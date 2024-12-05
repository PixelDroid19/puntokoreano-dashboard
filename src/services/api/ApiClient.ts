// @ts-nocheck
// src/services/api/ApiClient.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { store } from '../../redux/store';
import { logout } from '../../redux/reducers/userSlice';

// Singleton para manejar la instancia de axios
export class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: `${import.meta.env.VITE_API_REST_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar el token a las peticiones
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_dashboard_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar errores
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          store.dispatch(logout());
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Método para obtener la instancia singleton
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Método para obtener la instancia de axios
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // Manejo de errores centralizado
  private handleError(error: AxiosError): Error {
    const errorMessage = error.response?.data?.message || 'Ha ocurrido un error';
    return new Error(errorMessage);
  }
}