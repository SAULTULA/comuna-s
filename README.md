# Villaguay Noti

Dashboard con noticias locales de Villaguay + reproductor de radios en un dock inferior.

## Estructura

```
villaguay-noti/
  backend/    Express: proxy/scraper de noticias + config de radios
  frontend/   React + Vite: UI dark mode / glassmorphism
```

## Cómo correrlo

Necesitás **Node.js 18+** instalado.

**1. Backend**
```bash
cd backend
npm install
copy .env.example .env      (en Windows; en Mac/Linux: cp .env.example .env)
npm run dev
```
Levanta en `http://localhost:4000`.

**2. Frontend** (en otra terminal)
```bash
cd frontend
npm install
npm run dev
```
Levanta en `http://localhost:5173` y ya proxea `/api/*` hacia el backend (configurado en `vite.config.js`).

Abrí `http://localhost:5173` — deberías ver el dashboard corriendo, con las 4 radios en el dock
(inactivas hasta que cargues las URLs de streaming) y el feed de noticias vacío/con error hasta
que completes las fuentes.

## Lo que falta completar (y por qué no lo hice yo)

No pude verificar por scraping automático las URLs de streaming de las radios ni los dominios
exactos + estructura HTML de los 3 sitios de noticias: los sitios oficiales bloquean bots o no
exponen esos datos de forma pública/indexable. Dejé todo listo y configurable en dos archivos:

### 1. Streaming de radios → `backend/config/radios.js` (o `.env`)
Para cada radio, conseguí la URL directa del stream:
1. Abrí el sitio de la radio en Chrome/Edge.
2. `F12` → pestaña **Network** → filtrá por "Media" (o escribí `mp3`/`stream` en el buscador).
3. Dale play al reproductor embebido del sitio.
4. Va a aparecer una request tipo `https://servidor:puerto/stream` (Icecast/Shoutcast/Zeno.fm) —
   copiá esa URL exacta.
5. Pegala en `backend/.env` (`STREAM_LA_MESO=...`, etc.) o directo en `radios.js`.

**Radio ComunaS** era un placeholder en el plan original — falta también su nombre real,
frecuencia y sitio.

### 2. Fuentes de noticias → `backend/config/sources.js`
Para cada fuente (AP Noticias, Diario Villaguay Web, Infor-Villaguay):
1. Confirmá el dominio exacto (`url`).
2. Fijate si tiene RSS: probá `<dominio>/feed` o `<dominio>/rss` en el navegador, o mirá el
   `<head>` del sitio (Ctrl+U) buscando `<link rel="alternate" type="application/rss+xml">`.
   Si existe, poné esa URL en `rssUrl` — es lo más robusto y no requiere tocar el scraper.
3. Si no tiene RSS, ajustá los selectores CSS en `scrape` (`listSelector`, `titleSelector`, etc.)
   mirando el HTML real de la página de noticias (clic derecho → Inspeccionar sobre una nota).

El backend ya intenta RSS primero y cae a scraping automáticamente — y si una fuente falla,
no rompe las demás (el feed simplemente se arma con las que sí respondieron).

### 3. Del Co Digital Villaguay (Facebook)
Es una página de Facebook, no un sitio web. Facebook bloquea el scraping de páginas públicas sin
usar su Graph API oficial (requiere ser admin de la página + revisión de Meta), así que no la
incluí como fuente automática. Lo más simple es agregar un botón/link directo a la página en el
frontend en lugar de intentar traer sus posts.

## Verificación ya hecha
- ✅ `npm run build` del frontend compila sin errores.
- ✅ Backend levanta y responde en `/api/health`, `/api/radios`, `/api/news` (este último devuelve
  `items: []` hasta que completes `sources.js`, sin tirar error 500).
- ⬜ Falta: cargar streams reales y probar que el audio suene (paso manual, requiere las URLs de
  arriba).
- ⬜ Falta: cargar dominios/selectores reales de noticias y confirmar que las tarjetas muestren
  título, imagen y resumen correctos.
