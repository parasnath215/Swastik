import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const envUrl = import.meta.env.VITE_API_URL;
const baseURL = envUrl 
  ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) 
  : `http://${window.location.hostname}:5000/api`;

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
