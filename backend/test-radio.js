const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://villaguay.gob.ar/radiomunicipal/').then(r => {
  const html = r.data;
  
  // Look for any audio/source tags or URLs ending in common stream ports/extensions
  const urls = html.match(/(https?:\/\/[^\s"'><]*?(?:8000|8226|stream|mp3|aac|icecast|shoutcast)[^\s"'><]*)/gi);
  console.log('Posibles URLs de streaming encontradas:');
  if (urls) {
    console.log([...new Set(urls)].join('\n'));
  } else {
    console.log('Ninguna encontrada por regex.');
  }

  const $ = cheerio.load(html);
  $('audio, source, iframe').each((i, el) => {
    console.log('Tag:', el.tagName, 'src:', $(el).attr('src'));
  });

}).catch(console.error);
