// src/hooks/useOrdersWebSocket.ts
import { useEffect, useCallback, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { getWebSocketConfig } from "../config/websocket.config";

/**
 * 🆕 Debouncer para evitar notificaciones duplicadas
 */
class NotificationDebouncer {
  private pendingNotifications = new Map<string, NodeJS.Timeout>();
  private recentNotifications = new Set<string>();
  private readonly config = getWebSocketConfig().NOTIFICATION_DEBOUNCE;

  private generateKey(type: string, orderId?: string, data?: any): string {
    if (orderId) {
      return `${type}:${orderId}`;
    }
    if (data?.orderNumber) {
      return `${type}:${data.orderNumber}`;
    }
    return `${type}:${JSON.stringify(data)}`;
  }

  debounce(type: string, callback: () => void, orderId?: string, data?: any): void {
    const key = this.generateKey(type, orderId, data);
    
    // Si ya se mostró una notificación reciente del mismo tipo, cancelar
    if (this.recentNotifications.has(key)) {
      console.log(`🔇 Notificación bloqueada (reciente): ${key}`);
      return;
    }

    // Cancelar notificación pendiente si existe
    if (this.pendingNotifications.has(key)) {
      clearTimeout(this.pendingNotifications.get(key)!);
    }

    // Programar nueva notificación
    const timeout = setTimeout(() => {
      callback();
      this.pendingNotifications.delete(key);
      this.recentNotifications.add(key);
      
      // Limpiar de recientes después del tiempo límite
      setTimeout(() => {
        this.recentNotifications.delete(key);
      }, this.config.RECENT_TIME);
    }, this.config.DEBOUNCE_TIME);

    this.pendingNotifications.set(key, timeout);
  }

  clear(): void {
    this.pendingNotifications.forEach(timeout => clearTimeout(timeout));
    this.pendingNotifications.clear();
    this.recentNotifications.clear();
  }
}

/**
 * Función inteligente para obtener la URL de WebSocket
 * Deriva automáticamente desde la configuración de la API
 */
const getWsUrl = (): string => {
  const isProduction = import.meta.env.PROD;
  const envWsUrl = import.meta.env.VITE_WS_URL;
  const envApiUrl = import.meta.env.VITE_API_REST_URL;

  // Si hay una URL de WebSocket específica configurada, usarla
  if (envWsUrl) {
    if (import.meta.env.DEV) {
      console.log("📡 Usando URL de WebSocket configurada:", envWsUrl);
    }
    return envWsUrl;
  }

  // Derivar URL de WebSocket desde la API REST
  let wsUrl: string;

  if (isProduction) {
    if (!envApiUrl) {
      console.error("❌ VITE_API_REST_URL no configurada en producción");
      throw new Error("API URL not configured for production environment");
    }
    
    // Convertir URL de API REST a WebSocket
    // Ejemplo: https://api.puntokoreano.com/api/v1 → wss://api.puntokoreano.com
    wsUrl = envApiUrl
      .replace(/^https?:\/\//, '') // Quitar protocolo
      .replace(/\/api\/v1$/, ''); // Quitar ruta de API
    
    // Agregar protocolo WebSocket seguro para producción
    wsUrl = `wss://${wsUrl}`;
  } else {
    // En desarrollo, usar localhost
    wsUrl = "ws://localhost:5000";
  }

  // Log para debugging (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log("🔧 Configuración de WebSocket:");
    console.log("   - Entorno:", isProduction ? "Producción" : "Desarrollo");
    console.log("   - API URL:", envApiUrl);
    console.log("   - WebSocket URL:", wsUrl);
  }

  return wsUrl;
};

interface UseOrdersWebSocketProps {
  token: string;
  onPaymentUpdate?: (data: any) => void;
  onConnectionChange?: (isConnected: boolean) => void;
}

export const useOrdersWebSocket = ({
  token,
  onPaymentUpdate,
  onConnectionChange,
}: UseOrdersWebSocketProps) => {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Estado local para el estado de conexión (reactivo)
  const [isConnected, setIsConnected] = useState(false);
  
  // Ref para evitar re-renders innecesarios
  const hasInitialized = useRef(false);
  
  // 🆕 Instancia del debouncer
  const debouncerRef = useRef<NotificationDebouncer>(new NotificationDebouncer());
  
  // 🆕 Refs estables para callbacks para evitar re-creación de listeners
  const onPaymentUpdateRef = useRef(onPaymentUpdate);
  const onConnectionChangeRef = useRef(onConnectionChange);
  
  // Actualizar refs cuando cambien los callbacks
  useEffect(() => {
    onPaymentUpdateRef.current = onPaymentUpdate;
  }, [onPaymentUpdate]);
  
  useEffect(() => {
    onConnectionChangeRef.current = onConnectionChange;
  }, [onConnectionChange]);

  const connectSocket = useCallback(() => {
    if (!token) {
      console.warn("⚠️ No se proporcionó token para la conexión WebSocket");
      return;
    }

    // Verificar si ya hay una conexión activa para evitar bucles
    if (socketRef.current?.connected) {
      console.log("🔄 WebSocket ya está conectado, evitando nueva conexión");
      return socketRef.current;
    }

    // Desconectar socket existente si hay uno
    if (socketRef.current) {
      console.log("🧹 Desconectando socket anterior");
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const wsUrl = getWsUrl();
    console.log("🔌 Intentando conexión WebSocket a:", {
      url: wsUrl,
      attempt: reconnectAttemptsRef.current + 1,
      maxAttempts: maxReconnectAttempts
    });

    const socket = io(wsUrl, {
      auth: {
        token: token
      },
      // Configuración optimizada para producción
      transports: ["websocket", "polling"], // Fallback a polling si WebSocket falla
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000, // Timeout más largo para conexiones de red lentas
      forceNew: true, // Forzar nueva conexión
      autoConnect: true,
      // Configuraciones adicionales para estabilidad
      randomizationFactor: 0.5,
      upgrade: true,
      rememberUpgrade: true
    });

    socket.on("connect", () => {
      console.log("✅ WebSocket conectado exitosamente");
      console.log("   - Socket ID:", socket.id);
      console.log("   - Transporte:", socket.io.engine.transport.name);
      
      reconnectAttemptsRef.current = 0;
      setIsConnected(true); // Actualizar estado local
      onConnectionChangeRef.current?.(true);
      
      // Unirse a las salas necesarias
      socket.emit("join:payment-status");
      socket.emit("join:orders");
      
      console.log("🏠 Unido a salas: payment-status, orders");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Error de conexión WebSocket:", {
        message: error.message,
        details: error,
        url: wsUrl,
        attempt: reconnectAttemptsRef.current + 1
      });
      
      reconnectAttemptsRef.current++;
      setIsConnected(false); // Actualizar estado local

      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.error("🚫 Máximo de intentos de reconexión alcanzado");
        message.error("No se pudo establecer la conexión en tiempo real. Verificando configuración...");
        socket.disconnect();
      } else {
        console.log(`🔄 Reintentando conexión en ${1000}ms... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 WebSocket desconectado:", reason);
      setIsConnected(false); // Actualizar estado local
      onConnectionChangeRef.current?.(false);
      
      // Log adicional para debugging
      if (reason === "io server disconnect") {
        console.log("   → El servidor cerró la conexión");
      } else if (reason === "io client disconnect") {
        console.log("   → Cliente cerró la conexión");
      } else {
        console.log("   → Desconexión por:", reason);
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 WebSocket reconectado después de", attemptNumber, "intentos");
      setIsConnected(true); // Actualizar estado local
      message.success("Conexión en tiempo real restaurada");
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Intento de reconexión", attemptNumber);
    });

    socket.on("reconnect_error", (error) => {
      console.error("❌ Error en reconexión:", error);
    });

    socket.on("reconnect_failed", () => {
      console.error("🚫 Falló la reconexión después de", maxReconnectAttempts, "intentos");
      message.error("No se pudo restaurar la conexión en tiempo real");
    });

    socket.on("payments:check-required", (data) => {
      if (data.pendingCount > 0) {
        debouncerRef.current.debounce(
          "payments:check",
          () => message.info(`Verificando ${data.pendingCount} pagos pendientes`),
          undefined,
          data
        );
      }
    });

    socket.on("payments:verification-complete", (data) => {
      if (!data?.results) return;
      
      const { updated, failed } = data.results;
      if (updated > 0) {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        debouncerRef.current.debounce(
          "payments:verification",
          () => message.success(
            `Verificación completada: ${updated} ${updated === 1 ? 'actualización' : 'actualizaciones'}`
          ),
          undefined,
          data
        );
      }
    });

    // Escuchar nuevas órdenes creadas
    socket.on("order:created", (data) => {
      console.log("Nueva orden creada:", data);
      
      // Invalidar queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      
      // Mostrar notificación con debounce
      debouncerRef.current.debounce(
        "order:created",
        () => message.info(
          `Nueva orden #${data.orderNumber} - $${data.total?.toLocaleString("es-CO")} ${data.isDevelopment ? '(PRUEBA)' : ''}`
        ),
        data.orderId || data.orderNumber,
        data
      );
    });

    // Escuchar actualizaciones de pago de órdenes
    socket.on("order:payment-updated", (data) => {
      console.log("Pago de orden actualizado:", data);
      
      // Invalidar queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      
      // Mostrar notificación según el estado con debounce
      const statusMessages = {
        'completed': '✅ Pago aprobado',
        'failed': '❌ Pago fallido',
        'cancelled': '🚫 Pago cancelado',
        'pending': '⏳ Pago pendiente',
      };
      
      const statusMessage = statusMessages[data.paymentStatus] || 'Estado actualizado';
      
      debouncerRef.current.debounce(
        "order:payment-updated",
        () => message.info(
          `${statusMessage} - Orden #${data.orderNumber} (${data.source})`
        ),
        data.orderId || data.orderNumber,
        data
      );
    });

    // 🆕 Escuchar notificaciones de stock liberado
    socket.on("stock:released", (data) => {
      console.log("Stock liberado:", data);
      
      // Invalidar queries para refrescar el inventario
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      
      // Mostrar notificación con debounce
      debouncerRef.current.debounce(
        "stock:released",
        () => message.info(
          `📦 Stock liberado - Orden #${data.orderNumber} (${data.reason})`
        ),
        data.orderId || data.orderNumber,
        data
      );
    });

    if (onPaymentUpdateRef.current) {
      socket.on("payment:updated", onPaymentUpdateRef.current);
    }

    socketRef.current = socket;
    return socket;
  }, [token, queryClient]); // Remover dependencias que causan re-creación

  useEffect(() => {
    // Solo inicializar una vez si tenemos token
    if (!token || hasInitialized.current) {
      return;
    }

    console.log("🚀 Inicializando WebSocket por primera vez");
    hasInitialized.current = true;
    
    const socket = connectSocket();

    return () => {
      console.log("🧹 Cleanup del useEffect principal");
      hasInitialized.current = false;
      if (socket?.connected) {
        console.log("🧹 Limpiando conexión WebSocket");
        socket.disconnect();
      }
      setIsConnected(false); // Actualizar estado local
      socketRef.current = null;
      reconnectAttemptsRef.current = 0;
      // 🆕 Limpiar debouncer
      debouncerRef.current.clear();
    };
  }, [token]); // Solo depender del token

  // Effect para debugging del estado de conexión (solo cambios importantes)
  useEffect(() => {
    if (isConnected) {
      console.log("✅ Estado UI actualizado: CONECTADO");
    } else {
      console.log("❌ Estado UI actualizado: DESCONECTADO");
    }
  }, [isConnected]);

  return {
    isConnected, // Usar el estado local reactivo
    reconnect: () => {
      console.log("🔄 Intentando reconectar WebSocket manualmente");
      if (socketRef.current?.connected) {
        console.log("⚠️ Socket ya está conectado");
        return;
      }
      socketRef.current?.connect();
    },
    disconnect: () => {
      console.log("🔌 Desconectando WebSocket manualmente");
      socketRef.current?.disconnect();
    },
    // Función de emergencia para resetear completamente la conexión
    reset: () => {
      console.log("🔄 Reseteando conexión WebSocket completamente");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      hasInitialized.current = false;
      reconnectAttemptsRef.current = 0;
      
      // Reconectar después de un breve delay
      setTimeout(() => {
        if (token) {
          console.log("🚀 Reiniciando conexión después del reset");
          const socket = connectSocket();
        }
      }, 1000);
    }
  };
};