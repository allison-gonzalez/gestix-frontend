import api from './api';

const notificacionService = {
  /**
   * Trae las notificaciones del usuario actual + conteo de no leídas.
   * @returns {{ data: Notificacion[], no_leidas: number }}
   */
  getAll: () => api.get('/notificaciones'),

  /** Conteo de no leídas (ligero, para polling o inicialización). */
  unreadCount: () => api.get('/notificaciones/no-leidas'),

  /** Marca una notificación como leída. */
  markRead: (id) => api.put(`/notificaciones/${id}/leer`),

  /** Marca todas las notificaciones del usuario como leídas. */
  markAllRead: () => api.put('/notificaciones/leer-todas'),
};

export default notificacionService;
