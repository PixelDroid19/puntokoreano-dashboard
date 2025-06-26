// Configuración principal de pagos
export interface PaymentSettings {
  id?: string;
  verification: {
    enabled: boolean;
    cronSchedule: string;
    timeWindow: number; // horas
    batchSize: number;
    retryAttempts: number;
  };
  stockTimeout: {
    enabled: boolean;
    timeoutMinutes: number;
    cleanupOnStart: boolean;
  };
  alerts: {
    enabled: boolean;
    failureThreshold: number;
    adminEmails: string[];
    slackWebhook?: string;
  };
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    detailedLogs: boolean;
    retentionDays: number;
  };
  version: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// Estado del servicio cron
export interface CronServiceStatus {
  isRunning: boolean;
  nextExecution?: string;
  lastExecution?: string;
  activeJobs: {
    verification?: {
      schedule: string;
      nextRun: string;
      isActive: boolean;
    };
    cleanup?: {
      schedule: string;
      nextRun: string;
      isActive: boolean;
    };
    reports?: {
      schedule: string;
      nextRun: string;
      isActive: boolean;
    };
    stuckPayments?: {
      schedule: string;
      nextRun: string;
      isActive: boolean;
    };
  };
  uptime: number; // en segundos
  memoryUsage?: {
    used: number;
    total: number;
  };
}

// Historial de configuraciones
export interface PaymentSettingsHistory {
  history: PaymentSettingsHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentSettingsHistoryItem {
  id: string;
  settings: PaymentSettings;
  version: number;
  createdAt: string;
  createdBy: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  isActive: boolean;
}

// Métricas del sistema de pagos - Estructura real del API
export interface PaymentSystemMetrics {
  period: string;
  timeWindow: string;
  orders: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
    successRate: string; // "0.0%"
  };
  system: {
    pendingPayments: number;
    activeTimeouts: number;
    lastVerification: {
      lastRun: string;
      duration: number;
      totalProcessed: number;
      updated: number;
      failed: number;
      successRate: number;
      errors: any[];
    };
    isHealthy: boolean;
  };
  lastVerification: {
    lastRun: string;
    duration: number;
    totalProcessed: number;
    updated: number;
    failed: number;
    successRate: number;
    errors: any[];
  };
  cronStatus: {
    isInitialized: boolean;
    activeTasks: string[];
    lastVerification: {
      lastRun: string;
      duration: number;
      totalProcessed: number;
      updated: number;
      failed: number;
      successRate: number;
      errors: any[];
    };
    currentSettings: {
      verification: {
        enabled: boolean;
        schedule: string;
        timeWindow: string;
        batchSize: number;
        retryPolicy: string;
      };
      stockTimeout: {
        enabled: boolean;
        timeout: string;
        cleanupOnStartup: boolean;
        maxOrderAge: string;
      };
      alerts: {
        enabled: boolean;
        failureThreshold: string;
        stuckPaymentThreshold: string;
        adminEmails: number;
        slackEnabled: boolean;
      };
      rateLimiting: {
        enabled: boolean;
        limit: string;
        burst: number;
      };
    };
    systemHealth: boolean;
  };
}

// Solicitud de verificación manual
export interface ManualVerificationRequest {
  timeWindow?: number; // horas, default 24
  batchSize?: number; // default 5
  orderId?: string; // verificar orden específica
  forceVerification?: boolean; // forzar verificación aunque ya esté completada
}

// Respuesta de verificación manual
export interface ManualVerificationResponse {
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  details: {
    orderId: string;
    status: 'verified' | 'failed' | 'skipped';
    previousStatus?: string;
    newStatus?: string;
    error?: string;
  }[];
  executionTime: number; // ms
  timestamp: string;
}

// Validación de cron
export interface ValidateCronRequest {
  cronSchedule: string;
}

// Configuración de importación/exportación
export interface ImportExportSettings {
  settings: PaymentSettings;
  metadata: {
    exportedAt: string;
    exportedBy: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  backup: {
    id: string;
    description?: string;
  };
}

// Estados de verificación de pagos
export type PaymentVerificationStatus = 
  | 'pending'
  | 'processing' 
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired';

// Configuración de alertas
export interface AlertConfig {
  type: 'email' | 'slack' | 'webhook';
  enabled: boolean;
  config: {
    emails?: string[];
    slackWebhook?: string;
    webhookUrl?: string;
  };
  triggers: {
    paymentFailed: boolean;
    stockTimeout: boolean;
    cronJobFailed: boolean;
    highErrorRate: boolean;
  };
}

// Dashboard de configuración de pagos
export interface PaymentSettingsDashboard {
  currentSettings: PaymentSettings;
  cronStatus: CronServiceStatus;
  recentMetrics: PaymentSystemMetrics;
  healthChecks: {
    cronService: boolean;
    paymentGateway: boolean;
    database: boolean;
    notifications: boolean;
  };
  quickActions: {
    canRestartCron: boolean;
    canUpdateSettings: boolean;
    canRunManualVerification: boolean;
    canExportSettings: boolean;
  };
}

/**
 * Estado detallado del sistema de verificaciones
 */
export interface VerificationSystemStatus {
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
}

/**
 * Configuración actualizada de PaymentSettings para coincidir con el backend
 */
export interface PaymentSettingsUpdated {
  verification: {
    enabled: boolean;
    cronSchedule: string; // "*/3 * * * *" para cada 3 minutos
    timeWindow: number;
    batchSize: number;
    retryAttempts: number;
    retryDelay: number;
  };
  stockTimeout: {
    enabled: boolean;
    timeoutMinutes: number;
    cleanupOnStartup: boolean;
    maxOrderAge: number;
  };
  alerts: {
    enabled: boolean;
    failureRateThreshold: number; // 0.0 - 1.0
    stuckPaymentHours: number;
    adminEmails: string[];
    slackWebhookUrl?: string;
  };
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    enableDetailedLogs: boolean;
    logRetentionDays: number;
  };
  isActive?: boolean;
  version?: string;
  lastModified?: string;
  modifiedBy?: string;
} 