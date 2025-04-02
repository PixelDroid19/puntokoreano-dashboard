// src/utils/axios-interceptor.ts
import axios from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/reducers/userSlice";
import ENDPOINTS, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../api";

// Crear instancia de axios con configuración base
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_REST_URL,
});

// Interceptor para añadir el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers!.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Lista de errores que indican que el token es inválido o expiró
    const TOKEN_ERROR_CODES = [401, 403];

    if (error.response && TOKEN_ERROR_CODES.includes(error.response.status)) {
      // Limpiar el estado y localStorage
      handleLogout();
    }

    return Promise.reject(error);
  }
);

// Función para manejar el logout
export const handleLogout = async () => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!token) {
      throw new Error("No token found");
    }

    if (token) {
      return axiosInstance.post(
        ENDPOINTS.AUTH.LOGOUT.url,
        {
          refreshToken,
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    // Limpiar estado y localStorage independientemente del resultado
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    store.dispatch(logout());

    // Redirigir al login
    window.location.href = "/login";
  }
};
