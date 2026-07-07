import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import notificacionService from '../services/notificacionService';

const NotificacionesContext = createContext(null);

export function useNotificaciones() {
  return useContext(NotificacionesContext);
}

export function NotificacionesProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const socketRef = useRef(null);

  const cargarNotificaciones = useCallback(async () => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await notificacionService.getAll();
      setNotificaciones(res.data.data ?? []);
      setNoLeidas(res.data.no_leidas ?? 0);
    } catch (err) {
      if (err?.response?.status !== 401) {
        console.warn('[NotificacionesContext] Error cargando notificaciones:', err?.message);
      }
    }
  }, [isAuthenticated]);

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

  const marcarTodasLeidas = useCallback(async () => {
    try {
      await notificacionService.markAllRead();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    cargarNotificaciones();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000');
    socketRef.current = socket;

    socket.on('nueva-notificacion', (notif) => {
      const userId = user?.id ?? user?._id;
      if (notif.receptor_id && notif.receptor_id !== userId && notif.receptor_id !== Number(userId)) {
        return;
      }

      setNotificaciones((prev) => {
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
      setNoLeidas((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
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
