import api from './index';

export const permisoService = {
  getAll: () => api.get('/permisos'),
  getById: (id) => api.get(`/permisos/${id}`),
  create: (data) => api.post('/permisos', data),
  update: (id, data) => api.put(`/permisos/${id}`, data),
  delete: (id) => api.delete(`/permisos/${id}`),
};
