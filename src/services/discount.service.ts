// src/services/discount.service.ts
import axios from "axios";
import { ACCESS_TOKEN_KEY, BASE_URL } from "../api";
import { axiosInstance } from "../utils/axios-interceptor";

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
  productId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  previousState: {
    discountType: string | null;
    discountValue: number;
    discountStartDate: string | null;
    discountEndDate: string | null;
    finalPrice: number;
    hasDiscount: boolean;
  };
  currentState: {
    discountType: string | null;
    discountValue: number;
    discountStartDate: string | null;
    discountEndDate: string | null;
    finalPrice: number;
    hasDiscount: boolean;
  };
  action: "apply" | "remove" | "update";
  createdAt: string;
  updatedAt: string;
}

export interface DiscountAnalytics {
  totalProducts: number;
  productsWithDiscount: number;
  productsWithoutDiscount: number;
  discountPercentage: number;
  discountsByType: {
    [key: string]: {
      count: number;
      averageValue: number;
    };
  };
  historyByDay: Array<{
    _id: string;
    applied: number;
    updated: number;
    removed: number;
    total: number;
  }>;
}

class DiscountService {
  private static getToken(): string {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
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
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/discounts/${productId}`,
        method: "POST",
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
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/discounts/${productId}`,
        method: "DELETE",
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
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/discounts/${productId}/history`,
        method: "GET",
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
    discountData: DiscountData
  ): Promise<any> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/discounts/bulk`,
        method: "POST",
        data: {
          productIds,
          ...discountData
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
  static async getDiscountAnalytics(): Promise<DiscountAnalytics> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/discounts/analytics`,
        method: "GET"
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