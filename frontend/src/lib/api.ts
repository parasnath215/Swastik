import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const envUrl = import.meta.env.VITE_API_URL;
const baseURL = envUrl 
  ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) 
  : `http://${window.location.hostname}:5000/api`;

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  let token = useAuthStore.getState().token;
  if (token) {
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
