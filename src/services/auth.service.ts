// src/services/auth.service.ts
import axios from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/reducers/userSlice";
import CryptoJS from "crypto-js";
import ENDPOINTS from "../api";

// Crear instancia de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_REST_URL,
});

// Setup interceptors
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_dashboard_token");
    if (token) {
      config.headers!.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      AuthService.handleLogout();
    }
    return Promise.reject(error);
  }
);

class AuthService {
  // Método para obtener la clave de encriptación del servidor
  static async getEncryptionKey() {
    try {
      const response = await api.get(ENDPOINTS.AUTH.ENCRYPTION_KEY.url);
      return response.data.data;
    } catch (error) {
      console.error("Error al obtener la clave de encriptación:", error);
      throw error;
    }
  }

  // Método para encriptar la contraseña
  static encryptPassword(password: string, key: string) {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(
      password,
      CryptoJS.enc.Hex.parse(key),
      { iv: iv }
    );
    return iv.toString(CryptoJS.enc.Hex) + ":" + encrypted.toString();
  }

  // Método de login actualizado con encriptación
  static async login(credentials: { email: string; password: string }) {
    try {
      // 1. Obtener clave de encriptación
      const { key, sessionId } = await this.getEncryptionKey();

      // 2. Encriptar la contraseña
      const encryptedPassword = this.encryptPassword(credentials.password, key);

      // 3. Enviar credenciales con contraseña encriptada
      return api.post(ENDPOINTS.AUTH.LOGIN.url, {
        email: credentials.email,
        encryptedPassword,
        sessionId,
      });
    } catch (error) {
      console.error("Error durante el proceso de login:", error);
      throw error;
    }
  }

  static async verifyToken() {
    try {
      const token = localStorage.getItem("auth_dashboard_token");
      if (!token) return false;

      const response = await api.get("/api/dashboard/user-profile");
      return response.status === 200;
    } catch {
      return false;
    }
  }

  static async handleLogout() {
    try {
      const token = localStorage.getItem("auth_dashboard_token");
      if (token) {
        await api.get("/api/dashboard/logout");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      store.dispatch(logout());
      window.location.href = "/login";
    }
  }
}

export default AuthService;
export { api };
