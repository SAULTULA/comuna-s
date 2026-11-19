import { useState, useEffect, useRef } from 'react';
import styles from './FloatingVisitorCounter.module.css';

/**
 * FloatingVisitorCounter Component
 * 
 * Consume directamente la API real de analíticas y geolocalización de Gente de Medios:
 * https://gente-de-medios.vercel.app/api/track?site_id=comuna-s
 * 
 * Registra visitas reales en la base de datos Supabase y muestra métricas
 * oficiales (hoy, semana, mes, total y países/ciudades) en un formato flotante
 * moderno, sin iframes y sin elementos visuales invasivos.
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
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function trackAndFetchStats() {
      try {
        setLoading(true);
        // Intenta primero llamada directa a la API en producción
        let res;
        try {
          res = await fetch(`https://gente-de-medios.vercel.app/api/track?site_id=${siteId}`, {
            method: 'GET',
          });
        } catch {
          // Si falla o hay bloqueo local, utiliza el proxy del backend propio
          const apiUrl = import.meta.env.VITE_API_URL || '';
          res = await fetch(`${apiUrl}/api/track?site_id=${siteId}`);
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.stats && isMounted) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.error('Error al obtener analíticas de visitas reales:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    trackAndFetchStats();
    return () => {
      isMounted = false;
    };
  }, [siteId]);

  // Cierra el panel de detalles si se hace clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    }
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Agrupa ubicaciones por código de país
  const groupedLocations = (stats.locations || []).reduce((acc, loc) => {
    const code = (loc.code || 'ar').toLowerCase();
    if (!acc[code]) acc[code] = [];
    acc[code].push(loc);
    return acc;
  }, {});

  const countryCodes = Object.keys(groupedLocations);

  return (
    <div className={styles.visitorCounter} ref={dropdownRef}>
      {/* Píldora flotante compacta en el header */}
      <button
        type="button"
        className={`${styles.visitorCounter__pill} ${isExpanded ? styles['visitorCounter__pill--active'] : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Clic para ver detalle de visitas reales"
        aria-expanded={isExpanded}
      >
        <div className={styles.visitorCounter__liveIndicator}>
          <span className={styles.visitorCounter__pulseDot} aria-hidden="true" />
          <span className={styles.visitorCounter__liveText}>En vivo</span>
        </div>

        <span className={styles.visitorCounter__divider} aria-hidden="true" />

        <div className={styles.visitorCounter__metric}>
          <svg 
            className={styles.visitorCounter__icon}
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className={styles.visitorCounter__metricLabel}>Visitas:</span>
          <span className={styles.visitorCounter__metricValue}>
            {loading ? '...' : stats.total.toLocaleString('es-AR')}
          </span>
        </div>

        {!loading && stats.today > 0 && (
          <span className={styles.visitorCounter__todayBadge}>
            +{stats.today} hoy
          </span>
        )}

        {/* Banderitas resumen de los países principales */}
        {countryCodes.length > 0 && (
          <div className={styles.visitorCounter__flagPreview}>
            {countryCodes.slice(0, 3).map((code) => (
              <img
                key={code}
                src={`https://flagcdn.com/20x15/${code}.png`}
                alt={code.toUpperCase()}
                className={styles.visitorCounter__flagThumb}
                width="16"
                height="12"
              />
            ))}
          </div>
        )}

        <span className={styles.visitorCounter__chevron} aria-hidden="true">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Menú desplegable flotante con las métricas detalladas de Supabase */}
      {isExpanded && (
        <div className={styles.visitorCounter__dropdown} role="dialog" aria-label="Estadísticas de visitas">
          <div className={styles.visitorCounter__dropdownHeader}>
            <span className={styles.visitorCounter__dropdownTitle}>Estadísticas Oficiales</span>
            <span className={styles.visitorCounter__siteBadge}>Comuna-S</span>
          </div>

          <div className={styles.visitorCounter__grid}>
            <div className={styles.visitorCounter__gridCard}>
              <span className={styles.visitorCounter__gridLabel}>Hoy</span>
              <span className={styles.visitorCounter__gridNumber}>{stats.today}</span>
            </div>
            <div className={styles.visitorCounter__gridCard}>
              <span className={styles.visitorCounter__gridLabel}>Semana</span>
              <span className={styles.visitorCounter__gridNumber}>{stats.week}</span>
            </div>
            <div className={styles.visitorCounter__gridCard}>
              <span className={styles.visitorCounter__gridLabel}>Mes</span>
              <span className={styles.visitorCounter__gridNumber}>{stats.month}</span>
            </div>
            <div className={styles.visitorCounter__gridCard}>
              <span className={styles.visitorCounter__gridLabel}>Total</span>
              <span className={styles.visitorCounter__gridNumberHigh}>{stats.total}</span>
            </div>
          </div>

          {countryCodes.length > 0 && (
            <div className={styles.visitorCounter__locationsSection}>
              <span className={styles.visitorCounter__locationsTitle}>Visitantes por Ubicación</span>
              <div className={styles.visitorCounter__locationsList}>
                {countryCodes.map((code) => {
                  const cities = groupedLocations[code];
                  const totalCountry = cities.reduce((sum, item) => sum + item.count, 0);

                  return (
                    <div key={code} className={styles.visitorCounter__locationRow}>
                      <div className={styles.visitorCounter__countryInfo}>
                        <img
                          src={`https://flagcdn.com/24x18/${code}.png`}
                          alt={code.toUpperCase()}
                          className={styles.visitorCounter__countryFlag}
                          width="20"
                          height="15"
                        />
                        <span className={styles.visitorCounter__countryCode}>{code.toUpperCase()}</span>
                        <div className={styles.visitorCounter__citiesList}>
                          {cities
                            .sort((a, b) => b.count - a.count)
                            .slice(0, 3)
                            .map((c) => (
                              <span key={c.city} className={styles.visitorCounter__cityPill}>
                                {c.city}: {c.count}
                              </span>
                            ))}
                        </div>
                      </div>
                      <span className={styles.visitorCounter__countryTotal}>{totalCountry}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
