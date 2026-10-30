import { useEffect, useState, useCallback } from 'react';
import styles from './AdCarousel.module.css';

/**
 * AdCarousel — Carrusel de publicidades para el sidebar.
 * 
 * Acepta hasta 5 slots. Si un slot está vacío muestra "Espacio disponible".
 * 
 * Prop `ads`: array de hasta 5 objetos con la forma:
 *   { id, imageUrl, altText, websiteUrl, whatsappNumber }
 *   - websiteUrl: si tiene, abre esa URL.
 *   - whatsappNumber: si tiene (y no tiene websiteUrl), abre WhatsApp.
 *   - Si ninguno, el slot es "espacio disponible".
 */

const MAX_ADS = 5;
const AUTO_PLAY_MS = 4000;

const PLACEHOLDER_AD = {
  id: '__placeholder__',
  imageUrl: null,
  altText: 'Espacio disponible para publicidad',
  websiteUrl: null,
  whatsappNumber: null,
};

function buildSlots(ads = []) {
  const slots = [...ads.slice(0, MAX_ADS)];
  while (slots.length < MAX_ADS) {
    slots.push({ ...PLACEHOLDER_AD, id: `__placeholder_${slots.length}__` });
  }
  return slots;
}

function getAdHref(ad) {
  if (ad.websiteUrl) return ad.websiteUrl;
  if (ad.whatsappNumber) {
    const clean = ad.whatsappNumber.replace(/\D/g, '');
    return `https://wa.me/${clean}`;
  }
  return null;
}

export default function AdCarousel({ ads = [] }) {
  const slots = buildSlots(ads);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slots.length);
  }, [slots.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slots.length) % slots.length);
  }, [slots.length]);

  const goTo = (idx) => setCurrent(idx);

  // Auto-play
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = slots[current];
  const href = getAdHref(slide);
  const isPlaceholder = !slide.imageUrl;

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Publicidades"
    >
      {/* Label */}
      <div className={styles.carousel__label}>
        <span className={styles.carousel__labelIcon}>📢</span>
        <span>Auspicios</span>
      </div>

      {/* Slide */}
      <div className={styles.carousel__track}>
        {isPlaceholder ? (
          <div className={styles.carousel__placeholder}>
            <div className={styles.carousel__placeholderIcon}>📣</div>
            <p className={styles.carousel__placeholderText}>
              Espacio disponible
            </p>
            <a
              className={styles.carousel__placeholderCta}
              href="https://wa.me/5491166508379"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contactar para publicitar
            </a>
          </div>
        ) : href ? (
          <a
            className={styles.carousel__slide}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={slide.altText}
          >
            <img
              className={styles.carousel__image}
              src={slide.imageUrl}
              alt={slide.altText || 'Publicidad'}
              loading="lazy"
            />
            {slide.websiteUrl && (
              <span className={styles.carousel__visitBadge}>Visitar sitio ↗</span>
            )}
            {!slide.websiteUrl && slide.whatsappNumber && (
              <span className={styles.carousel__waBadge}>WhatsApp ↗</span>
            )}
          </a>
        ) : (
          <div className={styles.carousel__slide}>
            <img
              className={styles.carousel__image}
              src={slide.imageUrl}
              alt={slide.altText || 'Publicidad'}
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={styles.carousel__controls}>
        <button
          className={styles.carousel__arrow}
          onClick={prev}
          aria-label="Publicidad anterior"
        >
          ‹
        </button>

        <div className={styles.carousel__dots}>
          {slots.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.carousel__dot} ${idx === current ? styles['carousel__dot--active'] : ''}`}
              onClick={() => goTo(idx)}
              aria-label={`Ir a publicidad ${idx + 1}`}
            />
          ))}
        </div>

        <button
          className={styles.carousel__arrow}
          onClick={next}
          aria-label="Siguiente publicidad"
        >
          ›
        </button>
      </div>

      {/* Counter */}
      <p className={styles.carousel__counter}>
        {current + 1} / {slots.length}
      </p>
    </div>
  );
}
