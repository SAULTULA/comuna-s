require('dotenv').config();
const express = require('express');
const cors = require('cors');

const sources = require('./config/sources');
const radios = require('./config/radios');
const { fetchFromSource } = require('./scrapers/genericScraper');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Cache simple en memoria para no golpear los sitios de origen en cada request.
let newsCache = { data: [], fetchedAt: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

app.get(['/api/news', '/news'], async (req, res) => {
  const isFresh = Date.now() - newsCache.fetchedAt < CACHE_TTL_MS;
  if (isFresh && newsCache.data.length) {
    return res.json({ items: newsCache.data, cached: true });
  }

  try {
    const results = await Promise.all(sources.map(fetchFromSource));

    // Aplanar todas las fuentes en un solo array
    const allItems = results.flat();

    // Ordenar: más reciente primero.
    // Items sin fecha (publishedAt === null) van al final, manteniendo su orden relativo.
    allItems.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;

      if (dateA === 0 && dateB === 0) return 0;   // ambos sin fecha → sin cambio
      if (dateA === 0) return 1;                    // a sin fecha → va después
      if (dateB === 0) return -1;                   // b sin fecha → va después
      return dateB - dateA;                         // más nuevo primero
    });

    newsCache = { data: allItems, fetchedAt: Date.now() };
    res.json({ items: allItems, cached: false });
  } catch (err) {
    console.error('Error agregando noticias:', err);
    res.status(500).json({ error: 'No se pudieron obtener las noticias', items: [] });
  }
});

app.get(['/api/radios', '/radios'], (req, res) => {
  res.json({
    items: radios.map(({ id, name, frequency, streamUrl, websiteUrl, color, placeholder, logoUrl }) => ({
      id,
      name,
      frequency,
      streamUrl: streamUrl || null,
      websiteUrl: websiteUrl || null,
      color,
      logoUrl: logoUrl || null,
      placeholder: Boolean(placeholder) || !streamUrl,
    })),
  });
});

// Integración directa con Supabase para estadísticas y tracking real sin intermediarios
const SUPABASE_URL = 'https://gocksnydkykbexlevsfe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UgWvNLcQHn3IlIo6AVPQqA_ALG7vUg4';

app.get(['/api/track', '/track'], async (req, res) => {
  try {
    const siteId = req.query.site_id || 'comuna-s';
    const shouldTrack = req.query.track !== '0';

    // 1. Si es una nueva visita (sesión no registrada), insertar los datos reales del usuario
    if (shouldTrack) {
      const country = req.headers['x-vercel-ip-country'] || 'AR';
      const rawCity = req.headers['x-vercel-ip-city'] || '';
      const city = rawCity ? decodeURIComponent(rawCity) : 'Desconocida';

      await fetch(`${SUPABASE_URL}/rest/v1/site_visits`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          country_code: country,
          city: city,
          site_id: siteId,
        }),
      });
    }

    // 2. Obtener estadísticas acumuladas desde Supabase
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - 7);
    const startOfWeekStr = startOfWeek.toISOString();

    const startOfMonth = new Date();
    startOfMonth.setDate(now.getDate() - 30);
    const startOfMonthStr = startOfMonth.toISOString();

    const sbHeaders = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'count=exact',
    };

    // Conteo Total
    const resTotal = await fetch(
      `${SUPABASE_URL}/rest/v1/site_visits?site_id=eq.${siteId}&select=id`,
      { method: 'HEAD', headers: sbHeaders }
    );
    const rangeTotal = resTotal.headers.get('content-range');
    const countTotal = rangeTotal ? parseInt(rangeTotal.split('/')[1] || '0', 10) : 0;

    // Conteo Hoy
    const resToday = await fetch(
      `${SUPABASE_URL}/rest/v1/site_visits?site_id=eq.${siteId}&created_at=gte.${startOfToday}&select=id`,
      { method: 'HEAD', headers: sbHeaders }
    );
    const rangeToday = resToday.headers.get('content-range');
    const countToday = rangeToday ? parseInt(rangeToday.split('/')[1] || '0', 10) : 0;

    // Conteo Semana
    const resWeek = await fetch(
      `${SUPABASE_URL}/rest/v1/site_visits?site_id=eq.${siteId}&created_at=gte.${startOfWeekStr}&select=id`,
      { method: 'HEAD', headers: sbHeaders }
    );
    const rangeWeek = resWeek.headers.get('content-range');
    const countWeek = rangeWeek ? parseInt(rangeWeek.split('/')[1] || '0', 10) : 0;

    // Conteo Mes
    const resMonth = await fetch(
      `${SUPABASE_URL}/rest/v1/site_visits?site_id=eq.${siteId}&created_at=gte.${startOfMonthStr}&select=id`,
      { method: 'HEAD', headers: sbHeaders }
    );
    const rangeMonth = resMonth.headers.get('content-range');
    const countMonth = rangeMonth ? parseInt(rangeMonth.split('/')[1] || '0', 10) : 0;

    // Obtener desglose de ubicaciones de los últimos 30 días
    const resRecent = await fetch(
      `${SUPABASE_URL}/rest/v1/site_visits?site_id=eq.${siteId}&created_at=gte.${startOfMonthStr}&select=country_code,city&limit=500`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const recentVisits = await resRecent.json();

    const locationStats = {};
    if (Array.isArray(recentVisits)) {
      recentVisits.forEach((v) => {
        if (v.country_code) {
          const code = v.country_code.toLowerCase();
          const city = (v.city || 'Desconocida').trim();
          const key = `${code}|${city}`;
          if (!locationStats[key]) {
            locationStats[key] = { code, city, count: 0 };
          }
          locationStats[key].count += 1;
        }
      });
    }

    const topLocations = Object.values(locationStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    res.json({
      success: true,
      stats: {
        today: countToday,
        week: countWeek,
        month: countMonth,
        total: countTotal,
        locations: topLocations,
      },
    });
  } catch (err) {
    console.error('Error en /api/track:', err);
    res.status(500).json({ success: false, error: 'Error procesando estadísticas de visitas' });
  }
});

app.get(['/api/health', '/health'], (req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
    console.log(`   /api/news   -> feed agregado de noticias`);
    console.log(`   /api/radios -> lista de radios`);
  });
}
module.exports = app;
