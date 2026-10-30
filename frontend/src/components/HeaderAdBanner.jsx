import { useEffect, useState, useCallback } from 'react';
import styles from './HeaderAdBanner.module.css';

/**
 * HeaderAdBanner — Barra publicitaria PERSISTENTE debajo del header.
 *
 * Siempre visible. Rota automáticamente entre los slots cada INTERVAL_MS.
 * Si un slot no tiene imagen muestra "Espacio disponible para publicidad".
 *
 * Prop `ads`: array con hasta 5 objetos:
 *   { id, imageUrl, altText, websiteUrl, whatsappNumber }
 */

const MAX_ADS      = 5;
const INTERVAL_MS  = 5500; // tiempo entre cambios de anuncio

const PLACEHOLDER_AD = {
  id: '__placeholder__',
  imageUrl: null,
  altText: '¿Querés aparecer aquí? Contactanos',
  websiteUrl: null,
  whatsappNumber: null,
};

function buildSlots(ads = []) {
  const slots = [...ads.slice(0, MAX_ADS)];
  while (slots.length < MAX_ADS) {
    slots.push({ ...PLACEHOLDER_AD, id: `__ph_${slots.length}` });
  }
  return slots;
}

function getAdHref(ad) {
  if (ad.websiteUrl) return ad.websiteUrl;
  if (ad.whatsappNumber) {
    const clean = ad.whatsappNumber.replace(/\D/g, '');
    return `https://wa.me/${clean}`;
  }
  return 'https://wa.me/5491166508379'; // contacto por defecto para publicitar
}

export default function HeaderAdBanner({ ads = [] }) {
  const slots = buildSlots(ads);
  const [current, setCurrent]   = useState(0);
  const [paused,  setPaused]    = useState(false);
  const [animate, setAnimate]   = useState(false); // dispara clase CSS de transición

  const advance = useCallback(() => {
    setAnimate(true);
    setTimeout(() => {
      setCurrent((c) => (c + 1) % slots.length);
      setAnimate(false);
    }, 350); // duración del fade-out antes de cambiar contenido
  }, [slots.length]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(advance, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, advance]);

  const slide = slots[current];
  const href  = getAdHref(slide);
  const isPlaceholder = !slide.imageUrl;

  return (
    <div
      className={styles.banner}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Banner publicitario"
    >
      {/* Etiqueta fija */}
      <span className={styles.banner__tag}>Auspicia</span>

      {/* Contenido animado */}
      <a
        className={`${styles.banner__slot} ${animate ? styles['banner__slot--fade'] : ''}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={isPlaceholder ? 'Publicitar en Comuna-S' : slide.altText}
      >
        {!isPlaceholder && slide.imageUrl && (
          <img
            className={styles.banner__thumb}
            src={slide.imageUrl}
            alt={slide.altText || 'Publicidad'}
            loading="lazy"
          />
        )}

        {isPlaceholder ? (
          <span className={styles.banner__placeholderText}>
            <span className={styles['banner__placeholderText--icon']}>📣</span>
            <span>
              <strong>Espacio disponible</strong> — Tu negocio podría aparecer aquí
            </span>
          </span>
        ) : (
          <span className={styles.banner__adText}>
            <span className={styles.banner__adName}>{slide.altText}</span>
            <span className={styles.banner__adCta}>
              {slide.websiteUrl ? 'Visitar sitio ↗' : slide.whatsappNumber ? 'Contactar por WhatsApp ↗' : ''}
            </span>
          </span>
        )}
      </a>

      {/* Indicadores de posición */}
      <div className={styles.banner__dots}>
        {slots.map((_, i) => (
          <button
            key={i}
            className={`${styles.banner__dot} ${i === current ? styles['banner__dot--active'] : ''}`}
            onClick={() => { setAnimate(false); setCurrent(i); }}
            aria-label={`Publicidad ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
