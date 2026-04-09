import api from './index';

export const departamentoService = {
  getAll: () => api.get('/departamentos'),
  getById: (id) => api.get(`/departamentos/${id}`),
  create: (data) => api.post('/departamentos', data),
  update: (id, data) => api.put(`/departamentos/${id}`, data),
  delete: (id) => api.delete(`/departamentos/${id}`),
};
