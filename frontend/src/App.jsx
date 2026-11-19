import { useState, useEffect } from 'react';
import NewsFeed from './components/NewsFeed.jsx';
import RadioCards from './components/RadioCards.jsx';
import WeatherBar from './components/WeatherBar.jsx';
import Footer from './components/Footer.jsx';
import InstallButton from './components/InstallButton.jsx';
import AdCarousel from './components/AdCarousel.jsx';
import HeaderAdBanner from './components/HeaderAdBanner.jsx';
import FloatingVisitorCounter from './components/FloatingVisitorCounter.jsx';

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
          <img 
            src="/ccomunasnoti.png" 
            alt="Ingeniero Sajaroff - Comuna de Entre Ríos" 
            className="app-header__logo" 
          />
          <div className="app-header__text">
            <div className="app-header__tag-row">
              <span className="app-header__tag-badge">Comuna de Entre Ríos</span>
              <span className="app-header__tag-location">Dpto. Villaguay</span>
            </div>
            <h1 className="app-header__title">Ingeniero Sajaroff</h1>
            <p className="app-header__subtitle">
              Portal Comunitario de Noticias, Radios y Memoria Viva
            </p>

            {/* Raíces históricas y multiculturales de Sajaroff */}
            <div className="app-header__heritage-bar" aria-label="Raíces culturales e históricas de Ingeniero Sajaroff">
              <span 
                className="heritage-pill heritage-pill--maneco"
                title="Homenaje a los pobladores afroentrerrianos y el histórico Cementerio de los Manecos"
              >
                <span className="heritage-pill__dot heritage-pill__dot--amber" aria-hidden="true" />
                <span>Herencia Afro Maneca</span>
              </span>

              <span 
                className="heritage-pill heritage-pill--jewish"
                title="Pioneros de la Jewish Colonization Association y Colonia Clara"
              >
                <span className="heritage-pill__dot heritage-pill__dot--blue" aria-hidden="true" />
                <span>Colonos Judíos</span>
              </span>

              <span 
                className="heritage-pill heritage-pill--german"
                title="Inmigrantes y familias alemanas del Volga"
              >
                <span className="heritage-pill__dot heritage-pill__dot--gold" aria-hidden="true" />
                <span>Descendientes Alemanes</span>
              </span>
            </div>
          </div>
        </div>

        <div className="app-header__right">
          {/* Contador de visitas flotante integrado en el header */}
          <FloatingVisitorCounter />
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

