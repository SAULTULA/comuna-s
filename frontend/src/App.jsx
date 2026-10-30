import { useState, useEffect } from 'react';
import NewsFeed from './components/NewsFeed.jsx';
import RadioCards from './components/RadioCards.jsx';
import WeatherBar from './components/WeatherBar.jsx';
import Footer from './components/Footer.jsx';
import InstallButton from './components/InstallButton.jsx';
import AdCarousel from './components/AdCarousel.jsx';
import HeaderAdBanner from './components/HeaderAdBanner.jsx';

/**
 * Los anuncios se cargan en runtime desde /ads/ads.json
 * Ese archivo es gestionado por el panel de administración local.
 * Para publicar cambios: usar el botón "Deploy a Vercel" en el panel admin.
 */
export default function App() {
  const [activeStationId, setActiveStationId] = useState(null);
  const [adsSidebar, setAdsSidebar] = useState([]);
  const [adsHeader,  setAdsHeader]  = useState([]);

  useEffect(() => {
    fetch('/ads/ads.json')
      .then((r) => r.json())
      .then((data) => {
        setAdsSidebar(data.sidebar || []);
        setAdsHeader(data.header  || []);
      })
      .catch(() => {
        // Si falla la carga, muestra "Espacio disponible" (arrays vacíos)
        setAdsSidebar([]);
        setAdsHeader([]);
      });
  }, []);

  return (
    <div className="app-shell">
      {/* Barra publicitaria persistente — siempre visible, rota automáticamente */}
      <HeaderAdBanner ads={adsHeader} />

      <header className="app-header">
        <div className="app-header__brand-wrapper">
          <img src="/ccomunasnoti.png" alt="Comuna-S" className="app-header__logo" />
          <div className="app-header__text">
            <h1 className="app-header__title">Comuna-S</h1>
            <p className="app-header__subtitle">Noticias y radios locales — Departamento Villaguay, Entre Ríos</p>
          </div>
        </div>
        <div className="app-header__right">
          <WeatherBar />
          <InstallButton />
        </div>
      </header>

      <main className="app-content">
        <section className="app-content__news">
          <NewsFeed />
        </section>
        <aside className="app-content__sidebar">
          {/* Carrusel de publicidades — encima de las radios */}
          <AdCarousel ads={adsSidebar} />
          <RadioCards
            activeStationId={activeStationId}
            onActiveStationChange={setActiveStationId}
          />
        </aside>
      </main>

      <Footer />
    </div>
  );
}

