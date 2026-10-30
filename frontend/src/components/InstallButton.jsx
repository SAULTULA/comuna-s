import { useState, useEffect } from 'react';
import styles from './InstallButton.module.css';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Evita que Chrome muestre el prompt nativo de instalación inmediatamente
      e.preventDefault();
      // Guardamos el evento para poder dispararlo luego
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Muestra el prompt de instalación
    deferredPrompt.prompt();
    
    // Espera a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice;
    
    // Una vez respondido, limpiamos el prompt diferido
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt) return null;

  return (
    <button onClick={handleInstallClick} className={styles.installButton}>
      <span className={styles.icon}>⬇️</span>
      Instalar App
    </button>
  );
}
