import { useEffect, useState } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';
import '../../styles/Pwa.css';

const DISMISS_KEY = 'gestix_install_descartado';

function yaInstalada() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export default function InstallPrompt() {
  const [evento, setEvento] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (yaInstalada()) return undefined;

    const onBeforeInstall = (e) => {
      e.preventDefault(); // se guarda el aviso del navegador para mostrarlo en nuestro botón
      setEvento(e);
      if (!sessionStorage.getItem(DISMISS_KEY)) setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setEvento(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const instalar = async () => {
    if (!evento) return;
    evento.prompt();
    await evento.userChoice;
    setEvento(null);
    setVisible(false);
  };

  const descartar = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="pwa-install" role="dialog" aria-label="Instalar Gestix">
      <img src="/icons/icon-192.png" alt="" className="pwa-install-icon" />
      <div className="pwa-install-text">
        <strong>Instala Gestix</strong>
        <span>Ábrela como una app, con acceso directo y sin la barra del navegador.</span>
      </div>
      <button type="button" className="pwa-install-btn" onClick={instalar}>
        <FaDownload /> Instalar
      </button>
      <button type="button" className="pwa-install-close" onClick={descartar} aria-label="Ahora no">
        <FaTimes />
      </button>
    </div>
  );
}
