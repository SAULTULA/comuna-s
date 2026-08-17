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
        <div className="app-header__brand">
          <img src="/ccomunasnoti.png" alt="Comuna-S" className="app-header__logo" />
        </div>
        <p className="app-header__subtitle">Noticias y radios locales, en un solo lugar</p>
      </header>

      <main>
        <RadioCards activeStationId={activeStationId} onActiveStationChange={setActiveStationId} />
        <NewsFeed />
      </main>

      <Footer />
    </div>
  );
}
