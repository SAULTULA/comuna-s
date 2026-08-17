import { useState } from 'react';
import NewsFeed from './components/NewsFeed.jsx';
import RadioCards from './components/RadioCards.jsx';
<<<<<<< HEAD
import WeatherBar from './components/WeatherBar.jsx';
import Footer from './components/Footer.jsx';
=======
>>>>>>> 34ead8973f622d9bba8f2dcc7bbc4031adf00dfa

export default function App() {
  const [activeStationId, setActiveStationId] = useState(null);

  return (
    <div className="app-shell">
<<<<<<< HEAD
      <WeatherBar />
      <header className="app-header">
        <div className="app-header__brand">
          <img src="/logo-comunas.png" alt="Comuna-S" className="app-header__logo" />
=======
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__dot" />
          <h1>Comuna-S</h1>
>>>>>>> 34ead8973f622d9bba8f2dcc7bbc4031adf00dfa
        </div>
        <p className="app-header__subtitle">Noticias y radios locales, en un solo lugar</p>
      </header>

      <main>
        <RadioCards activeStationId={activeStationId} onActiveStationChange={setActiveStationId} />
        <NewsFeed />
      </main>
<<<<<<< HEAD
      
      <Footer />
=======
>>>>>>> 34ead8973f622d9bba8f2dcc7bbc4031adf00dfa
    </div>
  );
}
