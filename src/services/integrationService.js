import axios from 'axios';

const INTEGRATION_URL = import.meta.env.VITE_INTEGRATION_API_URL || 'http://localhost:9000/api';
const INTEGRATION_KEY = import.meta.env.VITE_INTEGRATION_API_KEY || '';

const integrationApi = axios.create({
  baseURL: INTEGRATION_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': INTEGRATION_KEY,
  },
});

export const analyticsService = {
  getSummary:      () => integrationApi.get('/analytics/summary'),
  getByDepartment: () => integrationApi.get('/analytics/by-department'),
  getByAgent:      () => integrationApi.get('/analytics/by-agent'),
};

export default integrationApi;
