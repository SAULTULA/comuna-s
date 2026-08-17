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

app.get(['/api/health', '/health'], (req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
    console.log(`   /api/news   -> feed agregado de noticias`);
    console.log(`   /api/radios -> lista de radios`);
  });
}
module.exports = app;
