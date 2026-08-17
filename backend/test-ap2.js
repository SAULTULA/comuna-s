const axios = require('axios');
const fs = require('fs');

axios.get('https://www.apnoticias.com.ar', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
  }
}).then(r => {
  fs.writeFileSync('ap-output.html', r.data);
  console.log('HTML guardado en ap-output.html. Longitud:', r.data.length);
}).catch(console.error);
