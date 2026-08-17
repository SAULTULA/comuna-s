const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');

const rssParser = new Parser({ timeout: 8000 });

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
};

/**
 * Intenta traer noticias vía RSS. Si el sitio no tiene rssUrl configurada,
 * prueba automáticamente rutas comunes (/feed, /rss, /feed.xml) sobre `url`.
 */
async function tryRss(source) {
  const candidates = [];
  if (source.rssUrl) candidates.push(source.rssUrl);
  if (source.url) {
    candidates.push(
      `${source.url.replace(/\/$/, '')}/feed`,
      `${source.url.replace(/\/$/, '')}/rss`,
      `${source.url.replace(/\/$/, '')}/feed.xml`,
    );
  }

  for (const feedUrl of candidates) {
    if (!feedUrl) continue;
    try {
      const feed = await rssParser.parseURL(feedUrl);
      if (feed.items && feed.items.length) {
        return feed.items.slice(0, 12).map((item) => ({
          title: item.title || 'Sin título',
          link: item.link || source.url,
          image: extractImageFromRssItem(item),
          excerpt: cleanExcerpt(item.contentSnippet || item.content || ''),
          source: source.name,
          publishedAt: item.isoDate || item.pubDate || null,
        }));
      }
    } catch (err) {
      // Esta ruta de RSS no existe o falló, probamos la siguiente candidata.
      continue;
    }
  }
  return null;
}

function extractImageFromRssItem(item) {
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  const html = item['content:encoded'] || item.content || '';
  const match = /<img[^>]+src="([^">]+)"/.exec(html);
  return match ? match[1] : null;
}

function cleanExcerpt(text) {
  return text.replace(/\s+/g, ' ').trim().slice(0, 220);
}

/**
 * Fallback: scraping directo con cheerio usando los selectores definidos
 * en config/sources.js para esa fuente.
 */
async function tryScrape(source) {
  if (!source.url || !source.scrape) return null;

  const response = await axios.get(source.url, { headers: HEADERS, timeout: 8000, responseType: 'arraybuffer' });
  const headStr = response.data.toString('utf8', 0, 2048).toLowerCase();
  
  let htmlString;
  if (headStr.includes('iso-8859-1') || headStr.includes('windows-1252')) {
    htmlString = new TextDecoder('windows-1252').decode(response.data);
  } else {
    htmlString = new TextDecoder('utf-8').decode(response.data);
  }

  const $ = cheerio.load(htmlString);
  const { listSelector, titleSelector, linkSelector, imageSelector, excerptSelector } =
    source.scrape;

  const items = [];
  $(listSelector).each((_, el) => {
    if (items.length >= 12) return;
    const $el = $(el);

    const titleEl = $el.find(titleSelector).first();
    const title = titleEl.text().trim();
    let link = $el.find(linkSelector).first().attr('href') || '';
    if (link && !link.startsWith('http')) {
      link = new URL(link, source.url).toString();
    }

    let image = $el.find(imageSelector).first().attr('src') || null;
    if (image && !image.startsWith('http')) {
      image = new URL(image, source.url).toString();
    }

    const excerpt = cleanExcerpt($el.find(excerptSelector).first().text());

    if (title && link) {
      items.push({ title, link, image, excerpt, source: source.name, publishedAt: null });
    }
  });

  return items.length ? items : null;
}

/**
 * Punto de entrada: intenta RSS, si falla o no está configurado cae al scraper.
 * Nunca tira: si todo falla, devuelve [] y lo loguea, para que una fuente
 * caída no rompa el resto del feed agregado.
 */
async function fetchFromSource(source) {
  try {
    const rssResult = await tryRss(source);
    if (rssResult) return rssResult;
  } catch (err) {
    console.warn(`[${source.name}] RSS falló:`, err.message);
  }

  try {
    const scrapeResult = await tryScrape(source);
    if (scrapeResult) return scrapeResult;
  } catch (err) {
    console.warn(`[${source.name}] Scraping falló:`, err.message);
  }

  if (!source.url && !source.rssUrl) {
    console.warn(`[${source.name}] Sin url/rssUrl configurada todavía (ver config/sources.js).`);
  }

  return [];
}

module.exports = { fetchFromSource };
