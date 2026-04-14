import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAuth } from '../hooks/useAuth';
import notificacionService from '../services/notificacionService';

// Pusher debe estar en window para que Laravel Echo lo encuentre
window.Pusher = Pusher;

const NotificacionesContext = createContext(null);

export function useNotificaciones() {
  return useContext(NotificacionesContext);
}

export function NotificacionesProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const echoRef = useRef(null);

  // ── Cargar notificaciones históricas desde la API ───────────────────────────
  const cargarNotificaciones = useCallback(async () => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await notificacionService.getAll();
      setNotificaciones(res.data.data ?? []);
      setNoLeidas(res.data.no_leidas ?? 0);
    } catch (err) {
      // silenciar errores de red (no relanzar para no romper el flujo)
      if (err?.response?.status !== 401) {
        console.warn('[NotificacionesContext] Error cargando notificaciones:', err?.message);
      }
    }
  }, [isAuthenticated]);

  // ── Marcar una notificación como leída ──────────────────────────────────────
  const marcarLeida = useCallback(async (id) => {
    try {
      await notificacionService.markRead(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setNoLeidas((prev) => Math.max(0, prev - 1));
    } catch {
      /* ignore */
    }
  }, []);

  // ── Marcar todas como leídas ────────────────────────────────────────────────
  const marcarTodasLeidas = useCallback(async () => {
    try {
      await notificacionService.markAllRead();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch {
      /* ignore */
    }
  }, []);

  // ── WebSocket: conectar / desconectar según autenticación ───────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Desconectar si existía una conexión previa
      if (echoRef.current) {
        echoRef.current.disconnect();
        echoRef.current = null;
      }
      return;
    }

    // Cargar historial al autenticarse
    cargarNotificaciones();

    // Crear instancia Echo
    const echo = new Echo({
      broadcaster:  'reverb',
      key:          import.meta.env.VITE_REVERB_APP_KEY,
      wsHost:       import.meta.env.VITE_REVERB_HOST       ?? 'localhost',
      wsPort:       parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080'),
      wssPort:      parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080'),
      forceTLS:    (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
    });

    echoRef.current = echo;

    // Suscribirse al canal público de notificaciones
    echo.channel('gestix-notifications').listen('.nueva-notificacion', (e) => {
      const notif = e.notificacion ?? e;

      // Mostrar sólo si es para este usuario o no tiene receptor específico
      const userId = user?.id ?? user?._id;
      if (notif.receptor_id && notif.receptor_id !== userId && notif.receptor_id !== Number(userId)) {
        return;
      }

      // Agregar al estado si no existe ya
      setNotificaciones((prev) => {
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
      setNoLeidas((prev) => prev + 1);
    });

    return () => {
      echo.disconnect();
      echoRef.current = null;
    };
  }, [isAuthenticated, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <NotificacionesContext.Provider
      value={{
        notificaciones,
        noLeidas,
        marcarLeida,
        marcarTodasLeidas,
        recargar: cargarNotificaciones,
      }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
}
