export default function NewsCard({ item }) {
  const { title, excerpt, image, source, link, publishedAt } = item;

  return (
    <a className="news-card" href={link} target="_blank" rel="noopener noreferrer">
      <div className="news-card__image-wrap">
        {image ? (
          <img className="news-card__image" src={image} alt="" loading="lazy" />
        ) : (
          <div className="news-card__image news-card__image--placeholder">
            <span>{source?.[0] ?? 'V'}</span>
          </div>
        )}
      </div>
      <div className="news-card__body">
        <span className="news-card__source">{source}</span>
        <h3 className="news-card__title">{title}</h3>
        {excerpt && <p className="news-card__excerpt">{excerpt}</p>}
        {publishedAt && (
          <time className="news-card__time" dateTime={publishedAt}>
            {new Date(publishedAt).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short',
            })}
          </time>
        )}
      </div>
    </a>
  );
}
