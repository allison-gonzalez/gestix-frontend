import api from './api';

export const ticketService = {
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
};

export const usuarioService = {
  getAll: () => api.get('/usuarios'),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
};

export const departamentoService = {
  getAll: () => api.get('/departamentos'),
  getById: (id) => api.get(`/departamentos/${id}`),
  create: (data) => api.post('/departamentos', data),
  update: (id, data) => api.put(`/departamentos/${id}`, data),
  delete: (id) => api.delete(`/departamentos/${id}`),
};

export const categoriaService = {
  getAll: () => api.get('/categorias'),
  getById: (id) => api.get(`/categorias/${id}`),
  create: (data) => api.post('/categorias', data),
  update: (id, data) => api.put(`/categorias/${id}`, data),
  delete: (id) => api.delete(`/categorias/${id}`),
};

export const permisoService = {
  getAll: () => api.get('/permisos'),
  getById: (id) => api.get(`/permisos/${id}`),
  create: (data) => api.post('/permisos', data),
  update: (id, data) => api.put(`/permisos/${id}`, data),
  delete: (id) => api.delete(`/permisos/${id}`),
};

export const comentarioService = {
  getAll: () => api.get('/comentarios'),
  getByTicket: (ticketId) => api.get(`/tickets/${ticketId}/comentarios`),
  create: (data) => api.post('/comentarios', data),
  delete: (id) => api.delete(`/comentarios/${id}`),
};

export const backupService = {
  getInfo:        ()         => api.get('/backup/info'),
  getList:        ()         => api.get('/backup/list'),
  getSchedule:    ()         => api.get('/backup/schedule'),
  updateSchedule: (data)     => api.put('/backup/schedule', data),
  create:         ()         => api.post('/backup/create'),
  download:       (filename) => api.get(`/backup/download/${filename}`, { responseType: 'blob' }),
  delete:         (filename) => api.delete(`/backup/${filename}`),
  restore:        (filename) => api.post(`/backup/restore/${filename}`),
};

export default api;
