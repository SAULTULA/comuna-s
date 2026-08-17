const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://www.apnoticias.com.ar', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
  }
}).then(r => {
  const $ = cheerio.load(r.data);
  console.log('noticia:', $('.noticia').length, 'titulo a:', $('.titulo a').length, 'h2 a:', $('h2 a').length);
  const firstNoticia = $('.noticia').first();
  console.log('HTML de la primera noticia:');
  console.log(firstNoticia.html());
}).catch(console.error);
