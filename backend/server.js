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

app.get('/api/news', async (req, res) => {
  const isFresh = Date.now() - newsCache.fetchedAt < CACHE_TTL_MS;
  if (isFresh && newsCache.data.length) {
    return res.json({ items: newsCache.data, cached: true });
  }

  try {
    const results = await Promise.all(sources.map(fetchFromSource));
    
    // Intercalar noticias: una de cada fuente en orden, repitiendo el ciclo.
    const items = [];
    let hasMore = true;
    let i = 0;
    while (hasMore) {
      hasMore = false;
      for (const sourceNews of results) {
        if (sourceNews && i < sourceNews.length) {
          items.push(sourceNews[i]);
          hasMore = true;
        }
      }
      i++;
    }

    newsCache = { data: items, fetchedAt: Date.now() };
    res.json({ items, cached: false });
  } catch (err) {
    console.error('Error agregando noticias:', err);
    res.status(500).json({ error: 'No se pudieron obtener las noticias', items: [] });
  }
});

app.get('/api/radios', (req, res) => {
  res.json({
    items: radios.map(({ id, name, frequency, streamUrl, websiteUrl, color, placeholder }) => ({
      id,
      name,
      frequency,
      streamUrl: streamUrl || null,
      websiteUrl: websiteUrl || null,
      color,
      placeholder: Boolean(placeholder) || !streamUrl,
    })),
  });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
    console.log(`   /api/news   -> feed agregado de noticias`);
    console.log(`   /api/radios -> lista de radios`);
  });
}
module.exports = app;
