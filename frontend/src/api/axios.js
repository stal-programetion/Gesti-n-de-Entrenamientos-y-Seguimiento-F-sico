import axios from 'axios';

const api = axios.create({
  
  baseURL: 'http://localhost:5000/api',
});

// Interceptor para inyectar token en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas y errores (401 token expirado/faltante)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpiar datos y forzar logout si el token es inválido/expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-error')); // Notificar al contexto para redirigir
    }
    return Promise.reject(error);
  }
);

export default api;
