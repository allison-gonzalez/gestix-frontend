import api from './api';

const buildMultipartRequest = (data) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  return formData;
};

const requestWithPossibleFile = (method, url, data) => {
  const hasFile = data && Object.values(data).some((value) => value instanceof File || value instanceof Blob);
  if (hasFile) {
    return api[method](url, buildMultipartRequest(data), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  return api[method](url, data);
};

export const ticketService = {
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => requestWithPossibleFile('post', '/tickets', data),
  update: (id, data) => requestWithPossibleFile('put', `/tickets/${id}`, data),
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
