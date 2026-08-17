import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.logosContainer}>
          <div className={styles.creatorInfo}>
            <span className={styles.developedBy}>Desarrollado por</span>
            <a href="https://ksmservicios.com.ar" target="_blank" rel="noopener noreferrer" className={styles.ksmLink}>
              ksmservicios.com.ar
            </a>
          </div>
        </div>
        <div className={styles.copyright}>
          &copy; {currentYear} Comuna-S Noticias y Radios. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
