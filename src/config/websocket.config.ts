/**
 * Configuración para WebSocket y notificaciones
 */
export const WEBSOCKET_CONFIG = {
  // Configuración de debouncing para notificaciones
  NOTIFICATION_DEBOUNCE: {
    // Tiempo de espera antes de mostrar la notificación (ms)
    DEBOUNCE_TIME: 2000,
    
    // Tiempo que una notificación se considera "reciente" (ms)
    RECENT_TIME: 5000,
    
    // Tipos de notificaciones que requieren debouncing
    DEBOUNCED_TYPES: [
      'payments:check',
      'payments:verification', 
      'order:created',
      'order:payment-updated',
      'stock:released'
    ]
  },

  // Configuración de reconexión
  RECONNECTION: {
    MAX_ATTEMPTS: 5,
    DELAY: 1000,
    DELAY_MAX: 5000,
    TIMEOUT: 15000
  },

  // Configuración de salas
  ROOMS: {
    PAYMENT_STATUS: 'payment-status',
    ORDERS: 'orders',
    ADMIN: 'admin'
  },

  // Habilitar logs de debug (solo en desarrollo)
  DEBUG: import.meta.env.DEV
};

/**
 * Obtener configuración específica para el entorno
 */
export const getWebSocketConfig = () => {
  const isProduction = import.meta.env.PROD;
  
  return {
    ...WEBSOCKET_CONFIG,
    // En producción, usar tiempos de debounce más largos
    NOTIFICATION_DEBOUNCE: {
      ...WEBSOCKET_CONFIG.NOTIFICATION_DEBOUNCE,
      DEBOUNCE_TIME: isProduction ? 3000 : 2000,
      RECENT_TIME: isProduction ? 8000 : 5000
    }
  };
}; 