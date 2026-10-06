import { useEffect, useRef, useState } from 'react';
import { FaWifi } from 'react-icons/fa';
import { MdWifiOff } from 'react-icons/md';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import '../../styles/Pwa.css';

export default function OfflineBanner() {
  const online = useOnlineStatus();
  const [recovered, setRecovered] = useState(false);
  const wasOffline = useRef(!navigator.onLine);

  useEffect(() => {
    document.body.classList.toggle('is-offline', !online);
    if (!online) {
      wasOffline.current = true;
      setRecovered(false);
      return undefined;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      setRecovered(true);
      const t = setTimeout(() => setRecovered(false), 3500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [online]);

  if (online && !recovered) return null;

  return (
    <div
      className={`pwa-banner ${online ? 'pwa-banner--ok' : 'pwa-banner--off'}`}
      role="status"
      aria-live="polite"
    >
      {online ? <FaWifi /> : <MdWifiOff />}
      <span>
        {online
          ? 'Conexión restablecida. Se enviarán los tickets pendientes.'
          : 'Sin conexión. Puedes seguir viendo lo ya cargado y crear tickets: se guardan en este dispositivo y se envían al volver internet.'}
      </span>
    </div>
  );
}
