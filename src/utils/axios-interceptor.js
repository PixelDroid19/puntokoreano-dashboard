// Archivo para crear el interceptor de axios
import axios from "axios";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../api";

// Crear una instancia de axios con configuración predeterminada
export const axiosInstance = axios.create({
  timeout: 15000, // 15 segundos timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    // Depurar solicitudes DELETE
    if (config.method === 'delete') {
      console.log('DELETE Request Configuration:', {
        url: config.url,
        params: config.params,
        data: config.data,
        headers: config.headers
      });
    }
    
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es un refresh token request
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          // No hay refresh token, redirigir al login
          window.location.href = "/auth/login";
          return Promise.reject(error);
        }

        // Llamar al endpoint refresh token
        const response = await axios.post(
          `${process.env.VITE_API_REST_URL || "http://localhost:5000/api/v1"}/auth/dashboard/refresh-token`,
          { refreshToken }
        );

        if (response.data.success) {
          // Actualizar tokens
          localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
          
          // Reintentar la solicitud original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return axiosInstance(originalRequest);
        } else {
          // Error al refrescar, redirigir al login
          window.location.href = "/auth/login";
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Error al refrescar, redirigir al login
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
); 