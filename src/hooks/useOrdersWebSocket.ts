// src/hooks/useOrdersWebSocket.ts
import { useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

const getWsUrl = (): string => {
  return import.meta.env.VITE_WS_URL || "http://localhost:5000";
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

  const connectSocket = useCallback(() => {
    if (!token) {
      console.warn("No token provided for WebSocket connection");
      return;
    }

    // Desconectar socket existente si hay uno
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
    }

    console.log("Attempting WebSocket connection...");

    const socket = io(getWsUrl(), {
      auth: {
        token: token
      },
      transports: ["websocket"],
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on("connect", () => {
      console.log("WebSocket connected successfully");
      reconnectAttemptsRef.current = 0;
      onConnectionChange?.(true);
      socket.emit("join:payment-status");
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", {
        message: error.message,
        details: error,
      });
      
      reconnectAttemptsRef.current++;

      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        message.error("No se pudo establecer la conexión en tiempo real");
        socket.disconnect();
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      onConnectionChange?.(false);
    });

    socket.on("payments:check-required", (data) => {
      if (data.pendingCount > 0) {
        message.info(`Verificando ${data.pendingCount} pagos pendientes`);
      }
    });

    socket.on("payments:verification-complete", (data) => {
      if (!data?.results) return;
      
      const { updated, failed } = data.results;
      if (updated > 0) {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        message.success(
          `Verificación completada: ${updated} ${updated === 1 ? 'actualización' : 'actualizaciones'}`
        );
      }
    });

    if (onPaymentUpdate) {
      socket.on("payment:updated", onPaymentUpdate);
    }

    socketRef.current = socket;
    return socket;
  }, [token, onPaymentUpdate, queryClient, onConnectionChange]);

  useEffect(() => {
    const socket = connectSocket();

    return () => {
      if (socket?.connected) {
        console.log("Cleaning up WebSocket connection");
        socket.disconnect();
      }
      socketRef.current = null;
      reconnectAttemptsRef.current = 0;
    };
  }, [connectSocket]);

  return {
    isConnected: socketRef.current?.connected || false,
    reconnect: () => {
      console.log("Attempting to reconnect WebSocket");
      socketRef.current?.connect();
    },
    disconnect: () => {
      console.log("Manually disconnecting WebSocket");
      socketRef.current?.disconnect();
    }
  };
};