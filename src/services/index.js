import api from './api';
export { STORAGE_BASE_URL } from './api';

// Tickets
export const ticketService = {
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
};

// Usuarios
export const usuarioService = {
  getAll: () => api.get('/usuarios'),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
};

// Departamentos
export const departamentoService = {
  getAll: () => api.get('/departamentos'),
  getById: (id) => api.get(`/departamentos/${id}`),
  create: (data) => api.post('/departamentos', data),
  update: (id, data) => api.put(`/departamentos/${id}`, data),
  delete: (id) => api.delete(`/departamentos/${id}`),
};

// Categorías
export const categoriaService = {
  getAll: () => api.get('/categorias'),
  getById: (id) => api.get(`/categorias/${id}`),
  create: (data) => api.post('/categorias', data),
  update: (id, data) => api.put(`/categorias/${id}`, data),
  delete: (id) => api.delete(`/categorias/${id}`),
};

// Permisos (MAIN)
export const permisoService = {
  getAll: () => api.get('/permisos'),
  getById: (id) => api.get(`/permisos/${id}`),
  create: (data) => api.post('/permisos', data),
  update: (id, data) => api.put(`/permisos/${id}`, data),
  delete: (id) => api.delete(`/permisos/${id}`),
};

// Comentarios
export const comentarioService = {
  getAll: () => api.get('/comentarios'),
  getByTicket: (ticketId) => api.get(`/tickets/${ticketId}/comentarios`),
  create: (data) => api.post('/comentarios', data),
  delete: (id) => api.delete(`/comentarios/${id}`),
};

// Backup (MAIN)
export const backupService = {
  getInfo: () => api.get('/backup/info'),
  getList: () => api.get('/backup/list'),
  getSchedule: () => api.get('/backup/schedule'),
  updateSchedule: (data) => api.put('/backup/schedule', data),
  create: () => api.post('/backup/create'),
  download: (filename) => api.get(`/backup/download/${filename}`, { responseType: 'blob' }),
  delete: (filename) => api.delete(`/backup/${filename}`),
  restore: (filename) => api.post(`/backup/restore/${filename}`),
};

// Archivos
export const archivoService = {
  getByEntidad: (tipo, id) => api.get(`/archivos/${tipo}/${id}`),
  delete: (id) => api.delete(`/archivos/${id}`),
};

// Perfil
export const profileService = {
  updatePassword: (data) => api.post('/auth/user/update-password', data),
  updateProfile:  (data) => api.put('/auth/user/update-profile', data),
};

export default api;