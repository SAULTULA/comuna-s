import React, { useEffect, useState } from 'react';
import NewsCard from './NewsCard.jsx';

export default function NewsFeed() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      setStatus('loading');
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/api/news`);
        if (!res.ok) throw new Error('Respuesta no OK del backend');
        const data = await res.json();
        if (!cancelled) {
          setItems(data.items || []);
          setStatus('ready');
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error cargando noticias:', err);
          setStatus('error');
        }
      }
    }

    loadNews();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return (
      <section className="news-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="news-card news-card--skeleton" />
        ))}
      </section>
    );
  }

  if (status === 'error') {
    return (
      <div className="empty-state">
        <p>No se pudo conectar con el backend.</p>
        <p className="empty-state__hint">
          Verificá que el proxy esté corriendo (<code>npm run dev</code> en <code>backend/</code>).
        </p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <p>Todavía no hay noticias configuradas.</p>
        <p className="empty-state__hint">
          Completá las URLs de las fuentes en <code>backend/config/sources.js</code>.
        </p>
      </div>
    );
  }

  return (
    <section className="news-grid">
      {items.map((item, idx) => {
        const isThirdSlot = idx === 2;

        return (
          <React.Fragment key={`${item.link}-${idx}`}>
            {isThirdSlot && (
              <div className="widget-card">
                <iframe 
                  src="https://gente-de-medios.vercel.app/widget?id=comuna-s" 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  style={{ border: 'none', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}
                  title="Contador de visitas"
                ></iframe>
              </div>
            )}
            <NewsCard item={item} />
          </React.Fragment>
        );
      })}
    </section>
  );
}
