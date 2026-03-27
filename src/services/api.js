import axios from 'axios';

let activeRequests = 0;
let loadingCallback = null;

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const registerLoadingCallback = (fn) => {
  loadingCallback = fn;
};

const updateLoading = () => {
  if (loadingCallback) loadingCallback(activeRequests > 0);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  activeRequests++;
  updateLoading();
  return config;
});

api.interceptors.response.use(
  (response) => {
    activeRequests = Math.max(0, activeRequests - 1);
    updateLoading();
    return response;
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1);
    updateLoading();
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
