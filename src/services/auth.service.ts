import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { store } from "../redux/store";
import { updateToken, logout } from "../redux/reducers/userSlice";
import ENDPOINTS, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../api";
import { axiosInstance } from "../utils/axios-interceptor";

// --- Configuración ---
const API_BASE_URL = import.meta.env.VITE_API_REST_URL;

// --- Instancia de Axios ---


// --- Lógica para Refresh Token ---
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Interceptores ---
// Request: Añadir token de autorización si existe
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers = config.headers || {}; // Asegurar que headers existe
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: Manejar errores, especialmente 401 para refrescar token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const errorData = error.response?.data as {
      code?: string;
      message?: string;
    };

    // Solo intentar refrescar si es 401, el código específico es TOKEN_EXPIRED y no es un reintento
    if (
      error.response?.status === 401 &&
      errorData?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      // Si ya hay un proceso de refresh en curso, encolar la request original
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Cuando el refresh termine (resolve), actualizar el header y reintentar
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = "Bearer " + token;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            // Si el refresh falla (reject), propagar el error
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        // Si no hay refresh token, no se puede continuar, desloguear
        console.log("No refresh token found, logging out.");
        AuthService.handleLogout(); 
        isRefreshing = false; 
        return Promise.reject(error); 
      }

      try {
        // Intentar obtener un nuevo access token usando el refresh token
        const refreshResponse = await axiosInstance.post<{
          success: boolean;
          data: { token: string; expiresAt: number };
        }>(
          `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN.url}`,
          { refreshToken } // Enviar el refresh token en el cuerpo
        );

        if (refreshResponse.data.success) {
          const newAccessToken = refreshResponse.data.data.token;
          const newExpiresAt = refreshResponse.data.data.expiresAt;

          // Guardar el nuevo token y actualizar Redux
          localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
          store.dispatch(
            updateToken({ token: newAccessToken, expiresAt: newExpiresAt })
          );

          // Actualizar el token por defecto para futuras requests y el de la request original
          axiosInstance.defaults.headers.common["Authorization"] =
            "Bearer " + newAccessToken;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          // Procesar la cola de requests esperando el nuevo token
          processQueue(null, newAccessToken);
          // Reintentar la request original con el nuevo token
          return axiosInstance(originalRequest);
        } else {
          // Si el endpoint de refresh responde que falló (ej. refresh token inválido)
          console.log("Refresh token failed (server response), logging out.");
          processQueue(error, null); // Rechazar las requests en cola
          AuthService.handleLogout(); // Desloguear
          return Promise.reject(error); // Rechazar la request original
        }
      } catch (refreshError) {
        // Si la llamada al endpoint de refresh falla (ej. error de red)
        console.error("Error during token refresh request:", refreshError);
        processQueue(refreshError as AxiosError, null); // Rechazar las requests en cola
        AuthService.handleLogout(); // Desloguear
        return Promise.reject(refreshError); // Rechazar con el error de refresh
      } finally {
        isRefreshing = false; // Resetear estado de refresh al finalizar
      }
    } else if (
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {
      // Manejar otros errores 401 (ej. token inválido, no 'TOKEN_EXPIRED') o 403 (prohibido)
      console.log(
        `Received ${error.response.status} (${
          errorData?.code || "No Code"
        }), logging out.`,
        errorData?.message
      );
      AuthService.handleLogout(); // Desloguear en estos casos también
    }

    // Para todos los demás errores, simplemente rechazarlos
    return Promise.reject(error);
  }
);

// --- Clase AuthService ---
class AuthService {
  static async login(credentials: { email: string; password: string }) {
    // Asegúrate que ENDPOINTS.AUTH.LOGIN.url apunte a la ruta correcta (ej. /auth/dashboard/login)
    return axiosInstance.post(ENDPOINTS.AUTH.LOGIN.url, {
      email: credentials.email,
      password: credentials.password,
    });
    // La lógica para manejar la respuesta (guardar token, dispatch) estará en el componente que llama a login
  }

  static async verifyToken() {
    try {
      const response = await axiosInstance.get(ENDPOINTS.AUTH.CHECK_SESSION.url);
      // Asumir que un éxito significa que el token es válido
      return response.status === 200 && response.data?.success === true;
    } catch (error) {
      // Si la llamada falla (ej. 401), el token no es válido
      console.log("Verify token check failed:", error);
      return false;
    }
  }

  static async handleLogout() {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    // Limpiar estado local y Redux PRIMERO para una desconexión inmediata en el frontend
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem("refreshTokenExpiresAt"); // Limpiar si se usa
    store.dispatch(logout()); // Limpia el estado del usuario en Redux

    try {
      // Intentar invalidar tokens en el backend (mejor esfuerzo, no bloquear si falla)
      // Se envía el refresh token si el backend lo requiere para invalidar la sesión
      await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT.url, { refreshToken });
    } catch (error) {
      console.error("Error calling backend logout (non-critical):", error);
    } finally {
      // Redirigir SIEMPRE al login después de limpiar todo, asegurando que no quede en una ruta protegida
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "/login"; // Redirección completa para limpiar estado de la app
      }
    }
  }
}

export default AuthService;

