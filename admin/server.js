/**
 * admin/server.js
 * Panel de administración de publicidades — Comuna-S
 * 
 * Rutas:
 *   GET  /              → Sirve la UI
 *   GET  /api/ads       → Lee ads.json del frontend
 *   POST /api/ads       → Guarda ads.json actualizado
 *   POST /api/upload    → Sube imagen a frontend/public/ads/
 *   POST /api/deploy    → Ejecuta `vercel --prod` en el directorio raíz
 *   GET  /api/status    → Estado del último deploy
 */

const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { exec, spawn } = require('child_process');

const app  = express();
const PORT = 3500;

// ─── Rutas absolutas ─────────────────────────────────────
const ROOT_DIR    = path.resolve(__dirname, '..');
const ADS_DIR     = path.join(ROOT_DIR, 'frontend', 'public', 'ads');
const ADS_JSON    = path.join(ADS_DIR, 'ads.json');

// Asegurar que existan los directorios necesarios
if (!fs.existsSync(ADS_DIR)) fs.mkdirSync(ADS_DIR, { recursive: true });
if (!fs.existsSync(ADS_JSON)) {
  fs.writeFileSync(ADS_JSON, JSON.stringify({ sidebar: [], header: [] }, null, 2));
}

// ─── Multer (subida de imágenes) ──────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ADS_DIR),
  filename:    (_req,  file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ext    = path.extname(file.originalname).toLowerCase();
    cb(null, `ad-${unique}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máx
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|avif)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      // multer v2: rechazar con false y mensaje
      cb(null, false);
    }
  },
});

// ─── Middlewares ──────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Servir las imágenes subidas desde frontend/public/ads/ en la ruta /ads
app.use('/ads', express.static(ADS_DIR));

// ─── Estado del deploy ────────────────────────────────────
let deployLog    = '';
let deployStatus = 'idle'; // 'idle' | 'running' | 'success' | 'error'

// ─── API: leer ads ────────────────────────────────────────
app.get('/api/ads', (_req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(ADS_JSON, 'utf8'));
    res.json(data);
  } catch {
    res.json({ sidebar: [], header: [] });
  }
});

// ─── API: guardar ads ─────────────────────────────────────
app.post('/api/ads', (req, res) => {
  try {
    const { sidebar, header } = req.body;
    if (!Array.isArray(sidebar) || !Array.isArray(header)) {
      return res.status(400).json({ error: 'Formato inválido' });
    }
    const data = { sidebar: sidebar.slice(0, 5), header: header.slice(0, 5) };
    fs.writeFileSync(ADS_JSON, JSON.stringify(data, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: subir imagen ────────────────────────────────────
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });
  // La URL pública es relativa al frontend: /ads/<filename>
  res.json({ url: `/ads/${req.file.filename}` });
});

// ─── API: eliminar imagen ─────────────────────────────────
app.delete('/api/image', (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename || filename.includes('..')) {
      return res.status(400).json({ error: 'Nombre de archivo inválido' });
    }
    const filepath = path.join(ADS_DIR, path.basename(filename));
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: deploy a Vercel ─────────────────────────────────
app.post('/api/deploy', (_req, res) => {
  if (deployStatus === 'running') {
    return res.json({ status: 'running', log: deployLog });
  }

  deployStatus = 'running';
  deployLog    = '🚀 Iniciando deploy a Vercel...\n';

  res.json({ status: 'running', log: deployLog });

  const child = spawn('vercel', ['--prod', '--yes'], {
    cwd:   ROOT_DIR,
    shell: true,
    env:   { ...process.env },
  });

  child.stdout.on('data', (d) => { deployLog += d.toString(); });
  child.stderr.on('data', (d) => { deployLog += d.toString(); });

  child.on('close', (code) => {
    if (code === 0) {
      deployStatus = 'success';
      deployLog   += '\n✅ Deploy completado exitosamente.';
    } else {
      deployStatus = 'error';
      deployLog   += `\n❌ Deploy falló con código ${code}.`;
    }
  });

  child.on('error', (err) => {
    deployStatus = 'error';
    deployLog   += `\n❌ Error: ${err.message}`;
  });
});

// ─── API: estado del deploy ───────────────────────────────
app.get('/api/deploy/status', (_req, res) => {
  res.json({ status: deployStatus, log: deployLog });
});

// ─── API: reset estado deploy ─────────────────────────────
app.post('/api/deploy/reset', (_req, res) => {
  deployStatus = 'idle';
  deployLog    = '';
  res.json({ ok: true });
});

// ─── Iniciar servidor ─────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   🖥️  Admin Panel — Comuna-S          ║');
  console.log(`  ║   http://localhost:${PORT}             ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
