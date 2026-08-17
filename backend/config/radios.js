/**
 * CONFIGURACIÓN DE RADIOS
 * ------------------------------------------------------------------
 * "streamUrl" es la URL directa del stream de audio (mp3/aac, típicamente
 * algo como https://server.com:8000/stream o https://.../live.mp3).
 *
 * Ninguna de las 4 radios expone su mount point de streaming en su web
 * pública de forma indexable, así que no puedo verificarlas por scraping.
 * Para conseguir la URL real en 2 minutos:
 *   1. Abrí el sitio de la radio en Chrome/Edge.
 *   2. F12 -> pestaña "Network" (Red) -> filtrá por "Media" o escribí "mp3"/"stream".
 *   3. Apretá play en el reproductor embebido del sitio.
 *   4. Va a aparecer una request tipo icecast/shoutcast: copiá esa URL acá.
 *
 * Mientras tanto, "websiteUrl" sirve de fallback: el botón "Escuchar en el
 * sitio" abre la radio en una pestaña nueva si streamUrl todavía no es real.
 */

module.exports = [
  {
    id: 'la-meso',
    name: 'La Meso FM',
    frequency: '97.1',
    streamUrl: 'https://az03.streaminghd.net.ar:8226/stream',
    websiteUrl: 'https://lamesofm.com.ar/',
    color: '#ff6b6b',
    logoUrl: '/lameso.png',
  },
  {
    id: 'radio-municipal',
    name: 'Radio Municipal',
    frequency: '90.7',
    streamUrl: 'https://streaming2.locucionar.com/proxy/villaguay?mp=/stream',
    websiteUrl: 'https://villaguay.gob.ar/radiomunicipal/',
    color: '#4dabf7',
    logoUrl: '/muni.jpg',
  },
  {
    id: 'la-autentica',
    name: 'La Auténtica Radio',
    frequency: '100.5',
    streamUrl: 'https://edge03.radiohdvivo.com/autentica1005',
    websiteUrl: 'https://www.laautenticaradio.com/',
    color: '#ffd43b',
    logoUrl: '/autentica.png',
  },
  {
    id: 'radio-comunas',
    name: 'Radio Comuna S',
    frequency: '—',
    streamUrl: 'https://stream.zeno.fm/a2h50mks398uv',
    websiteUrl: '',
    color: '#69db7c',
    logoUrl: '/logo-comunas.png',
    placeholder: false,
  },
];
