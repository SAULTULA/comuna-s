/**
 * CONFIGURACIÓN DE FUENTES DE NOTICIAS
 * ------------------------------------------------------------------
 * Verificado el 2026-08-14 con check-rss.js
 *
 * Cada fuente se resuelve en este orden de preferencia:
 *   1. rssUrl  → feed RSS/Atom (más robusto, no depende del HTML)
 *   2. scrape  → selectores CSS con cheerio (fallback automático)
 *
 * El backend intenta RSS primero y cae a scraping si falla.
 * Si una fuente falla completamente, devuelve [] sin romper las demás.
 */

module.exports = [
  {
    id: 'ap-noticias',
    name: 'AP Noticias',
    url: 'https://www.apnoticias.com.ar',
    // ❌ Sin RSS detectado — usa scraping directo
    rssUrl: '',
    scrape: {
      listSelector:    '.portada-noticia',
      titleSelector:   '.portada-titulo a',
      linkSelector:    '.portada-titulo a',
      imageSelector:   'img.portada-imagen',
      excerptSelector: '.portada-resumen',
    },
  },
  {
    id: 'diario-villaguay-web',
    name: 'Diario Villaguay Web',
    url: 'https://www.diariovillaguayweb.com',
    // ✅ Feed Atom de Blogger — verificado, título: "DIARIO VILLAGUAY"
    rssUrl: 'https://www.diariovillaguayweb.com/feeds/posts/default',
    scrape: {
      // WordPress — .post con 286 coincidencias, h2 a con 31
      listSelector:    '.post',
      titleSelector:   'h2 a, .entry-title a',
      linkSelector:    'h2 a, .entry-title a',
      imageSelector:   'img',
      excerptSelector: '.excerpt, .entry-summary, p',
    },
  },
  {
    id: 'infor-villaguay',
    name: 'Infor-Villaguay',
    url: 'https://infor-villaguay.com',
    // ✅ Feed WordPress — verificado, título: "Infor-Villaguay"
    rssUrl: 'https://infor-villaguay.com/feed/',
    scrape: {
      // WordPress — .entry con 100 coincidencias, h3 a con 15
      listSelector:    '.entry',
      titleSelector:   'h3 a, .entry-title a',
      linkSelector:    'h3 a, .entry-title a',
      imageSelector:   'img',
      excerptSelector: '.excerpt, .entry-summary, p',
    },
  },

  // Del Co Digital Villaguay: página de Facebook, no scraping automático.
  // Facebook bloquea bots sin Graph API (requiere ser admin + App Review de Meta).
  // → Mostrar como botón/link directo en el frontend.
];
