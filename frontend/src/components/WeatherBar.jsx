import { useEffect, useState } from 'react';
import styles from './WeatherBar.module.css';

const API_KEY = '87a66167c1f9a7046982610d0cd59b7a';
const CITIES = [
  { name: 'Villaguay', query: 'Villaguay,AR' },
  { name: 'Villa Clara', query: 'Villa Clara,AR' },
  { name: 'Villa Domínguez', query: 'Villa Dominguez,AR' },
  { name: 'Sajaroff', query: 'Ingeniero Sajaroff,AR' }
];

export default function WeatherBar() {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const promises = CITIES.map(async (city) => {
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city.query}&appid=${API_KEY}&units=metric&lang=es`);
          if (!res.ok) return null;
          const data = await res.json();
          return {
            name: city.name,
            temp: Math.round(data.main.temp),
            icon: data.weather[0].icon,
            description: data.weather[0].description
          };
        });

        const results = await Promise.all(promises);
        setWeatherData(results.filter(Boolean));
      } catch (err) {
        console.error('Error fetching weather:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || weatherData.length === 0) return null;

  return (
    <div className={styles.weatherBar}>
      <div className={styles.weatherTrack}>
        {weatherData.map((data, idx) => (
          <div key={idx} className={styles.weatherItem}>
            <span className={styles.cityName}>{data.name}</span>
            <img 
              src={`https://openweathermap.org/img/wn/${data.icon}.png`} 
              alt={data.description} 
              className={styles.weatherIcon}
            />
            <span className={styles.temperature}>{data.temp}°C</span>
          </div>
        ))}
      </div>
    </div>
  );
}
