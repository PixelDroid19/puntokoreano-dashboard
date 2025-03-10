// src/services/discount.service.ts
import axios from "axios";
import { BASE_URL } from "../api";

export interface DiscountData {
  isActive: boolean;
  type: "permanent" | "temporary";
  startDate?: string | Date;
  endDate?: string | Date;
  percentage?: number;
  old_price?: number;
  reason?: string;
}

export interface DiscountHistoryItem {
  _id: string;
  product: string;
  previous: Record<string, any>;
  current: Record<string, any>;
  reason?: string;
  changeType: string;
  createdAt: string;
  updatedAt: string;
  changedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface DiscountAnalytics {
  totalDiscountedProducts: number;
  averageDiscountPercentage: number;
  totalSavings: number;
  discountsByType: {
    permanent: number;
    temporary: number;
  };
  topDiscountedProducts: {
    id: string;
    name: string;
    percentage: number;
    savings: number;
  }[];
  discountTrend: {
    date: string;
    count: number;
    averagePercentage: number;
  }[];
}

class DiscountService {
  private static getToken(): string {
    return localStorage.getItem("auth_dashboard_token") || "";
  }

  private static getHeaders() {
    return {
      Authorization: `Bearer ${this.getToken()}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Apply discount to a product
   */
  static async applyDiscount(productId: string, discountData: DiscountData): Promise<any> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/discounts/products/${productId}/discount`,
        method: "POST",
        headers: this.getHeaders(),
        data: discountData,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al aplicar el descuento"
        );
      }
      throw error;
    }
  }

  /**
   * Remove discount from a product
   */
  static async removeDiscount(productId: string, reason?: string): Promise<any> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/discounts/products/${productId}/discount`,
        method: "DELETE",
        headers: this.getHeaders(),
        data: reason ? { reason } : {},
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al eliminar el descuento"
        );
      }
      throw error;
    }
  }

  /**
   * Get discount history for a product
   */
  static async getDiscountHistory(
    productId: string,
    page = 1,
    limit = 10
  ): Promise<{ history: DiscountHistoryItem[]; pagination: any }> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/discounts/products/${productId}/discount/history`,
        method: "GET",
        headers: this.getHeaders(),
        params: { page, limit },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener el historial de descuentos"
        );
      }
      throw error;
    }
  }

  /**
   * Apply bulk discounts to multiple products
   */
  static async applyBulkDiscounts(
    productIds: string[],
    discountData: DiscountData,
    reason?: string
  ): Promise<any> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/discounts/bulk-discounts`,
        method: "POST",
        headers: this.getHeaders(),
        data: {
          productIds,
          discountData,
          reason,
        },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al aplicar descuentos en lote"
        );
      }
      throw error;
    }
  }

  /**
   * Get discount analytics
   */
  static async getDiscountAnalytics(
    startDate?: string | Date,
    endDate?: string | Date
  ): Promise<DiscountAnalytics> {
    try {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = new Date(startDate).toISOString().split('T')[0];
      if (endDate) params.endDate = new Date(endDate).toISOString().split('T')[0];

      const response = await axios({
        url: `${BASE_URL}/dashboard/discounts/analytics`,
        method: "GET",
        headers: this.getHeaders(),
        params,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener analíticas de descuentos"
        );
      }
      throw error;
    }
  }
}

export default DiscountService;