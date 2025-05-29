// src/utils/axios-interceptor.ts
import axios from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/reducers/userSlice";
import ENDPOINTS, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../api";

const API_BASE_URL = import.meta.env.VITE_API_REST_URL;
// Variable para controlar si estamos en proceso de refresh de token
let isRefreshing = false;
// Cola de peticiones pendientes
let failedQueue = [];

// Procesar la cola de peticiones fallidas
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Crear instancia de axios con configuración base
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  allowAbsoluteUrls: true,
});

// Interceptor para añadir el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    // Depurar solicitudes DELETE
    if (config.method === "delete") {
      console.log("DELETE Request Configuration:", {
        url: config.url,
        params: config.params,
        data: config.data,
        headers: config.headers,
      });
    }

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agregar información de depuración
    console.log(
      `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`,
      {
        params: config.params,
      }
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `[API Response] ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  async (error) => {
    // Lista de errores que indican que el token es inválido o expiró
    const TOKEN_ERROR_CODES = [401, 403];
    const originalRequest = error.config;

    console.error(
      `[API Error] ${error.response?.status || "Network Error"} ${
        error.config?.url
      }`,
      error.response?.data
    );

    // Evitar entrar en bucles infinitos
    // No intentar refresh si:
    // 1. Ya estamos en una ruta de autenticación
    // 2. El error no es de autenticación
    // 3. Ya intentamos refrescar el token para esta petición
    // 4. La ruta es específicamente refresh-token (que ya falló)
    const isAuthRequest = originalRequest.url.includes("/auth/");
    const isRefreshRequest = originalRequest.url.includes("/refresh-token");
    const isCheckSessionRequest =
      originalRequest.url.includes("/check-session");

    if (
      error.response &&
      TOKEN_ERROR_CODES.includes(error.response.status) &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
      if (isCheckSessionRequest) {
        // Si es check-session y falla, dirigir al login sin intentar refresh
        console.log("Sesión expirada o inválida, redirigiendo al login");
        handleLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Si ya estamos refrescando, poner en cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Marcar que estamos refrescando y que esta petición ya intentó refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Intentar hacer refresh del token
        console.log("Intentando refrescar token...");
        const response = await axios.post(
          `${API_BASE_URL}/auth/dashboard/refresh-token`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.success && response.data.data.token) {
          const newToken = response.data.data.token;
          console.log("Token refrescado exitosamente");

          // Guardar nuevo token
          localStorage.setItem(ACCESS_TOKEN_KEY, newToken);

          // Actualizar token en la petición original y en las pendientes
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

          // Procesar cola de peticiones
          processQueue(null, newToken);

          // Reintentamos la petición original
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Failed to refresh token");
        }
      } catch (refreshError) {
        console.error("Error al refrescar token:", refreshError);
        // Procesar cola con error
        processQueue(refreshError, null);
        // Logout
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Si es un error 403 o cualquier otro error de autenticación que no podemos manejar
    if (error.response && TOKEN_ERROR_CODES.includes(error.response.status)) {
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
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    store.dispatch(logout());

    // Redirigir al login
    window.location.href = "/login";
  }
};
