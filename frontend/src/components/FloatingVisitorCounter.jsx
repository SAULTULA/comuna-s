import { useState } from 'react';
import styles from './FloatingVisitorCounter.module.css';

/**
 * FloatingVisitorCounter Component
 * 
 * Widget flotante para el header que aloja el contador de visitas oficial.
 * Mantiene la conexión permanente con el widget de analíticas sin invadir
 * el espacio principal de la grilla de noticias.
 */
export default function FloatingVisitorCounter() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={`${styles.visitorCounter} ${isCollapsed ? styles['visitorCounter--minimized'] : ''}`}
      role="region"
      aria-label="Contador de visitas de la web"
    >
      <div 
        className={styles.visitorCounter__header}
        onClick={() => isCollapsed && setIsCollapsed(false)}
        title={isCollapsed ? 'Clic para expandir el contador' : 'Contador de visitas'}
      >
        <div className={styles.visitorCounter__info}>
          <span className={styles.visitorCounter__pulseDot} aria-hidden="true" />
          <span className={styles.visitorCounter__title}>
            {isCollapsed ? 'Visitas en vivo' : 'Comunidad Activa'}
          </span>
        </div>
        <button
          type="button"
          className={styles.visitorCounter__toggleBtn}
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          title={isCollapsed ? 'Expandir' : 'Minimizar'}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expandir contador' : 'Minimizar contador'}
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {isCollapsed ? (
              <polyline points="6 9 12 15 18 9" />
            ) : (
              <polyline points="18 15 12 9 6 15" />
            )}
          </svg>
        </button>
      </div>

      <div 
        className={`${styles.visitorCounter__content} ${
          isCollapsed ? styles['visitorCounter__content--collapsed'] : ''
        }`}
      >
        <iframe
          src="https://gente-de-medios.vercel.app/widget?id=comuna-s"
          className={styles.visitorCounter__iframe}
          scrolling="no"
          title="Contador de visitas oficiales - Ingeniero Sajaroff"
          loading="lazy"
        />
      </div>
    </div>
  );
}

