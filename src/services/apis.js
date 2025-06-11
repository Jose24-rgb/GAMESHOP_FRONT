// src/services/apis.js
import axios from 'axios';

const api = axios.create({
  // MODIFICATO: Aggiungi '/api' direttamente dopo l'URL base del backend.
  // In questo modo, le chiamate come api.post('/auth/login') diventeranno
  // https://gameshop-back.onrender.com/api/auth/login
  baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
