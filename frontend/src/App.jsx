import { useState } from 'react';
import NewsFeed from './components/NewsFeed.jsx';
import RadioCards from './components/RadioCards.jsx';

export default function App() {
  const [activeStationId, setActiveStationId] = useState(null);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__dot" />
          <h1>Comuna-S</h1>
        </div>
        <p className="app-header__subtitle">Noticias y radios locales, en un solo lugar</p>
      </header>

      <main>
        <RadioCards activeStationId={activeStationId} onActiveStationChange={setActiveStationId} />
        <NewsFeed />
      </main>
    </div>
  );
}
