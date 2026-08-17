import { useEffect, useRef, useState } from 'react';
import styles from './RadioCards.module.css';

export default function RadioCards({ activeStationId, onActiveStationChange }) {
  const [stations, setStations] = useState([]);
  const [playingId, setPlayingId] = useState(null);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/radios`)
      .then((res) => res.json())
      .then((data) => setStations(data.items || []))
      .catch((err) => console.error('Error cargando radios:', err));
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const activeStation = stations.find((s) => s.id === playingId);

  function handleToggle(station) {
    if (station.placeholder) return;

    if (playingId === station.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      onActiveStationChange(null);
      return;
    }

    setPlayingId(station.id);
    onActiveStationChange(station.id);
  }

  useEffect(() => {
    if (!audioRef.current || !activeStation) return;
    audioRef.current.src = activeStation.streamUrl;
    audioRef.current.play().catch((err) => {
      console.warn('No se pudo reproducir automáticamente:', err.message);
    });
  }, [activeStation]);

  if (!stations.length) return null;

  return (
    <>
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />
      
      <section className={styles.radioSection}>
        <h2 className={styles.sectionTitle}>Radios en Vivo</h2>
        <div className={styles.cardsGrid}>
          {stations.map((station) => {
            const isActive = playingId === station.id;
            const isPlaceholder = station.placeholder;

            return (
              <div 
                key={station.id} 
                className={`${styles.card} ${isActive ? styles.cardActive : ''} ${isPlaceholder ? styles.cardPlaceholder : ''}`}
                onClick={() => handleToggle(station)}
              >
                <div className={styles.cardHeader}>
                  <div 
                    className={`${styles.cardIcon} ${station.logoUrl ? styles.cardIconLogo : ''}`} 
                    style={station.logoUrl ? {} : { backgroundColor: station.color }}
                  >
                    {station.logoUrl ? (
                      <img
                        className={styles.stationLogo}
                        style={{ transform: station.id === 'la-autentica' ? 'scale(1.8)' : 'none' }}
                        src={station.logoUrl}
                        alt={`Logo ${station.name}`}
                      />
                    ) : isActive ? (
                      <div className={styles.iconBars}>
                        <span className={styles.bar}></span>
                        <span className={styles.bar}></span>
                        <span className={styles.bar}></span>
                      </div>
                    ) : (
                      <span className={styles.playIcon}>▶</span>
                    )}
                  </div>
                  {isPlaceholder && <span className={styles.badge}>Próximamente</span>}
                </div>
                
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{station.name}</h3>
                  <p className={styles.cardFreq}>{station.frequency} FM</p>
                </div>
                
                {isPlaceholder && station.websiteUrl && (
                  <a
                    className={styles.cardLink}
                    href={station.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Sitio Web ↗
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {activeStation && (
          <div className={styles.playerBar}>
            <div className={styles.playerInfo}>
              <span 
                className={styles.pulse} 
                style={{ backgroundColor: activeStation.color }}
              ></span>
              <span className={styles.playerText}>Al aire: <strong>{activeStation.name}</strong></span>
            </div>
            <div className={styles.playerControls}>
              <span className={styles.volumeIcon}>🔊</span>
              <input
                className={styles.volumeSlider}
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => {
                  e.stopPropagation();
                  setVolume(Number(e.target.value));
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </section>
    </>
  );
}
