import axios from "axios";
import dotenv from "dotenv"; 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
});

// inyecta token automáticamente si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
