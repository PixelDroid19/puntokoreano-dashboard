// src/services/orders.service.ts
import { OrderStatusUpdate } from "../types/orders";
import { axiosInstance } from "../utils/axios-interceptor";
class OrdersService {
  static async verifyPayment(orderId: string) {
    try {
      const response = await axiosInstance.post(
        `/dashboard/orders/${orderId}/verify-payment`
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  }

  static async verifyPendingPayments() {
    try {
      const response = await axiosInstance.post(
        "/dashboard/orders/verify-pending-payments"
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying pending payments:", error);
      throw error;
    }
  }

  static async processRefund(
    orderId: string,
    data: { amount: number; reason: string }
  ) {
    try {
      const response = await axiosInstance.post(
        `/dashboard/orders/${orderId}/refund`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error processing refund:", error);
      throw error;
    }
  }

  static async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    try {
      const response = await axiosInstance.get("/dashboard/orders", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  // Método para generar factura
  static async generateInvoice(orderId: string) {
    try {
      const response = await axiosInstance.post(`/dashboard/orders/${orderId}/invoice`);
      return response.data;
    } catch (error) {
      console.error("Error generating invoice:", error);
      throw error;
    }
  }

  /**
   * Descarga la factura en formato PDF
   * @param orderId ID de la orden
   * @returns Promise con el blob del PDF
   */
  static async downloadInvoice(orderId: string): Promise<Blob> {
    try {
      const response = await axiosInstance.get(`/invoices/orders/${orderId}/download`, {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!response.data || !(response.data instanceof Blob)) {
        throw new Error("Invalid response format");
      }

      return response.data;
    } catch (error) {
      console.error("Error downloading invoice:", error);
      throw error;
    }
  }

  /**
   * Método auxiliar para iniciar la descarga del archivo
   * @param blob Blob del PDF
   * @param fileName Nombre del archivo
   */
  static downloadPDF(blob: Blob, fileName: string): void {
    // Crear URL temporal para el blob
    const url = window.URL.createObjectURL(blob);

    // Crear elemento anchor temporal
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    // Añadir al DOM, hacer click y limpiar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Liberar URL
    window.URL.revokeObjectURL(url);
  }

  static async updateOrderStatus(orderId: string, data: OrderStatusUpdate) {
    try {
      const response = await axiosInstance.patch(
        `/dashboard/orders/${orderId}/status`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  static async getOrderDetails(orderId: string) {
    try {
      const response = await axiosInstance.get(`/dashboard/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  }
}

export default OrdersService;
