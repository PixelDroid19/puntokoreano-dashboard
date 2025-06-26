import axios, { AxiosResponse } from 'axios';
import { BASE_URL } from '../api';
import { 
  PaymentSettings, 
  PaymentSettingsHistory, 
  PaymentSystemMetrics, 
  CronServiceStatus,
  ManualVerificationRequest,
  ManualVerificationResponse,
  ValidateCronRequest,
  ImportExportSettings 
} from './payment-settings.types';

// Crear instancia de axios con configuración personalizada
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autorización
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class PaymentSettingsService {
  private static basePath = '/dashboard/payment-settings';

  // Obtener configuración actual de pagos
  static async getCurrentSettings(): Promise<AxiosResponse<{
    success: boolean;
    data: {
      settings: PaymentSettings;
      cronServiceStatus: CronServiceStatus;
    };
  }>> {
    return apiClient.get(`${this.basePath}`);
  }

  // Actualizar configuración de pagos
  static async updateSettings(settings: Partial<PaymentSettings>): Promise<AxiosResponse<{
    success: boolean;
    data: PaymentSettings;
    message: string;
  }>> {
    return apiClient.put(`${this.basePath}`, settings);
  }

  // Obtener historial de configuraciones
  static async getSettingsHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<{
    success: boolean;
    data: PaymentSettingsHistory;
  }>> {
    return apiClient.get(`${this.basePath}/history`, { params });
  }

  // Activar una configuración específica
  static async activateSettings(settingsId: string): Promise<AxiosResponse<{
    success: boolean;
    message: string;
  }>> {
    return apiClient.post(`${this.basePath}/${settingsId}/activate`);
  }

  // Obtener estado del servicio de cron
  static async getCronStatus(): Promise<AxiosResponse<{
    success: boolean;
    data: CronServiceStatus;
  }>> {
    return apiClient.get(`${this.basePath}/cron/status`);
  }

  // Reiniciar servicio de cron
  static async restartCronService(): Promise<AxiosResponse<{
    success: boolean;
    message: string;
  }>> {
    return apiClient.post(`${this.basePath}/cron/restart`);
  }

  // Ejecutar verificación manual de pagos
  static async runManualVerification(
    params?: ManualVerificationRequest
  ): Promise<AxiosResponse<{
    success: boolean;
    data: ManualVerificationResponse;
  }>> {
    return apiClient.post(`${this.basePath}/verify/manual`, params);
  }

  // Obtener métricas del sistema de pagos
  static async getSystemMetrics(period: string = '24h'): Promise<AxiosResponse<{
    success: boolean;
    data: PaymentSystemMetrics;
  }>> {
    return apiClient.get(`${this.basePath}/metrics`, {
      params: { period }
    });
  }

  // Validar configuración cron sin aplicar
  static async validateCronSchedule(
    cronSchedule: string
  ): Promise<AxiosResponse<{
    success: boolean;
    data: {
      valid: boolean;
      nextRuns: string[];
      error?: string;
    };
  }>> {
    return apiClient.post(`${this.basePath}/validate-cron`, { cronSchedule });
  }

  // Exportar configuración actual (backup)
  static async exportSettings(): Promise<AxiosResponse<{
    success: boolean;
    data: ImportExportSettings;
  }>> {
    return apiClient.get(`${this.basePath}/export`);
  }

  // Importar configuración desde archivo (restore)
  static async importSettings(
    settings: ImportExportSettings
  ): Promise<AxiosResponse<{
    success: boolean;
    message: string;
  }>> {
    return apiClient.post(`${this.basePath}/import`, { settings });
  }

  // Descargar backup como archivo
  static async downloadBackup(): Promise<Blob> {
    const response = await this.exportSettings();
    const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
      type: 'application/json'
    });
    return blob;
  }

  // Helper para descargar archivo
  static downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Obtener estado detallado del sistema de verificaciones
   */
  static async getVerificationSystemStatus(): Promise<AxiosResponse<{
    success: boolean;
    data: {
      system: {
        isActive: boolean;
        schedule: string;
        frequency: string;
        nextExecution: string;
        timeWindow: string;
        batchSize: number;
        environment: string;
      };
      cronService: {
        isInitialized: boolean;
        isHealthy: boolean;
        activeTasks: string[];
        lastVerification: string | null;
      };
      metrics: {
        pendingPayments: number;
        activeTimeouts: number;
        systemHealth: boolean;
      };
      lastStats: {
        lastRun: string | null;
        duration?: number;
        totalProcessed: number;
        updated: number;
        failed: number;
        successRate: number;
        errors: any[];
      };
    };
  }>> {
    return apiClient.get(`${this.basePath}/system/status`);
  }
}

export default PaymentSettingsService; 