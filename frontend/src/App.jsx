import { useState } from 'react';
import NewsFeed from './components/NewsFeed.jsx';
import RadioCards from './components/RadioCards.jsx';
import WeatherBar from './components/WeatherBar.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [activeStationId, setActiveStationId] = useState(null);

  return (
    <div className="app-shell">
      <WeatherBar />
      <header className="app-header">
        <img src="/ccomunasnoti.png" alt="Comuna-S" className="app-header__logo" />
        <div className="app-header__text">
          <h1 className="app-header__title">Comuna-S</h1>
          <p className="app-header__subtitle">Noticias y radios locales — Departamento Villaguay, Entre Ríos</p>
        </div>
      </header>

      <main className="app-content">
        <section className="app-content__news">
          <NewsFeed />
        </section>
        <aside className="app-content__sidebar">
          <RadioCards activeStationId={activeStationId} onActiveStationChange={setActiveStationId} />
        </aside>
      </main>

      <Footer />
    </div>
  );
}
