import { useState, useEffect, useRef } from 'react';
import styles from './FloatingVisitorCounter.module.css';

/**
 * FloatingVisitorCounter Component
 * 
 * Consume datos 100% REALES de la base de datos Supabase:
 * - Registra únicamente 1 visita real por sesión de navegación (evita duplicar al recargar).
 * - Registra la ubicación geográfica real del usuario (Argentina, etc.), no del servidor.
 * - Muestra permanentemente visible el contador con métricas oficiales:
 *   Hoy, Semana, Mes, Total y detalle de ciudades visitantes.
 */
export default function FloatingVisitorCounter({ siteId = 'comuna-s' }) {
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    locations: [],
  });
  const [loading, setLoading] = useState(true);
  const [activePopover, setActivePopover] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        setLoading(true);
        const SESSION_TRACK_KEY = `comunas_tracked_${siteId}`;
        const hasTracked = Boolean(sessionStorage.getItem(SESSION_TRACK_KEY));

        // Solo enviamos track=1 la primera vez que el usuario ingresa en esta sesión.
        // Si recarga la página, envía track=0 para consultar estadísticas sin inflar visitas.
        const shouldTrack = !hasTracked;
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const endpoint = `${apiUrl}/api/track?site_id=${encodeURIComponent(siteId)}&track=${shouldTrack ? 1 : 0}`;

        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.stats && isMounted) {
            setStats(data.stats);
            if (shouldTrack) {
              sessionStorage.setItem(SESSION_TRACK_KEY, '1');
            }
          }
        }
      } catch (err) {
        console.error('Error cargando estadísticas de visitas:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [siteId]);

  // Cierra el popover de ciudades al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setActivePopover(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Agrupa ubicaciones por código de país
  const groupedLocations = (stats.locations || []).reduce((acc, loc) => {
    const code = (loc.code || 'ar').toLowerCase();
    if (!acc[code]) acc[code] = [];
    acc[code].push(loc);
    return acc;
  }, {});

  const countries = Object.keys(groupedLocations);

  return (
    <div className={styles.visitorCard} ref={cardRef} aria-label="Estadísticas de visitas">
      {/* Cabecera del contador */}
      <div className={styles.visitorCard__header}>
        <div className={styles.visitorCard__live}>
          <span className={styles.visitorCard__pulseDot} aria-hidden="true" />
          <span className={styles.visitorCard__liveText}>En vivo</span>
        </div>
        <span className={styles.visitorCard__title}>Visitas Reales</span>
      </div>

      {/* Grid de 4 métricas oficiales */}
      <div className={styles.visitorCard__stats}>
        <div className={styles.visitorCard__statItem}>
          <span className={styles.visitorCard__statLabel}>Hoy</span>
          <span className={styles.visitorCard__statValue}>
            {loading ? '...' : stats.today}
          </span>
        </div>

        <div className={styles.visitorCard__statItem}>
          <span className={styles.visitorCard__statLabel}>Semana</span>
          <span className={styles.visitorCard__statValue}>
            {loading ? '...' : stats.week}
          </span>
        </div>

        <div className={styles.visitorCard__statItem}>
          <span className={styles.visitorCard__statLabel}>Mes</span>
          <span className={styles.visitorCard__statValue}>
            {loading ? '...' : stats.month}
          </span>
        </div>

        <div className={styles.visitorCard__statItem}>
          <span className={styles.visitorCard__statLabel}>Total</span>
          <span className={styles.visitorCard__statValueTotal}>
            {loading ? '...' : stats.total}
          </span>
        </div>
      </div>

      {/* Banderas por país con sus ciudades reales */}
      {countries.length > 0 && (
        <div className={styles.visitorCard__flagsSection}>
          <span className={styles.visitorCard__flagsTitle}>Países visitantes:</span>
          <div className={styles.visitorCard__flags}>
            {countries.map((code) => {
              const cities = groupedLocations[code];
              const totalForCountry = cities.reduce((sum, item) => sum + item.count, 0);
              const isOpen = activePopover === code;

              return (
                <div key={code} className={styles.visitorCard__flagItem}>
                  <img
                    src={`https://flagcdn.com/24x18/${code}.png`}
                    alt={code.toUpperCase()}
                    width="20"
                    height="15"
                    className={styles.visitorCard__flagImg}
                  />
                  <span className={styles.visitorCard__flagCount}>{totalForCountry}</span>
                  <button
                    type="button"
                    className={`${styles.visitorCard__infoBtn} ${isOpen ? styles['visitorCard__infoBtn--active'] : ''}`}
                    onClick={() => setActivePopover(isOpen ? null : code)}
                    title={`Ver ciudades de ${code.toUpperCase()}`}
                    aria-label={`Ver ciudades de ${code.toUpperCase()}`}
                  >
                    ⓘ
                  </button>

                  {/* Popover flotante con las ciudades de ese país */}
                  {isOpen && (
                    <div className={styles.visitorCard__popover}>
                      <div className={styles.visitorCard__popoverHeader}>
                        <span className={styles.visitorCard__popoverTitle}>
                          {code.toUpperCase()} — Ciudades
                        </span>
                        <button
                          type="button"
                          className={styles.visitorCard__popoverClose}
                          onClick={() => setActivePopover(null)}
                          aria-label="Cerrar"
                        >
                          ×
                        </button>
                      </div>
                      <div className={styles.visitorCard__popoverList}>
                        {cities
                          .sort((a, b) => b.count - a.count)
                          .map(({ city, count }) => (
                            <div key={city} className={styles.visitorCard__popoverRow}>
                              <span className={styles.visitorCard__popoverCity}>{city}</span>
                              <span className={styles.visitorCard__popoverCount}>{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
