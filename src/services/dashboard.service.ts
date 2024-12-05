// src/services/dashboard.service.ts
// @ts-nocheck
import axios from 'axios';
import { 
  ProductCreateInput, 
  ProductResponse,
  DashboardAnalytics
} from '../api/types';
import ENDPOINTS from '../api';

export class DashboardService {
  private static getToken(): string {
    return localStorage.getItem('auth_dashboard_token') || '';
  }

  private static getHeaders() {
    return {
      Authorization: `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json',
    };
  }

  // Métodos existentes de productos
  static async createProduct(product: ProductCreateInput): Promise<ProductResponse> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.CREATE;
      const response = await axios({
        url,
        method,
        headers: this.getHeaders(),
        data: product,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          throw new Error('El producto ya existe');
        }
        throw new Error(error.response?.data?.message || 'Error al crear el producto');
      }
      throw error;
    }
  }

  static async updateProduct(id: string, product: Partial<ProductCreateInput>): Promise<ProductResponse> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.UPDATE;
      const response = await axios({
        url: `${url}/${id}`,
        method,
        headers: this.getHeaders(),
        data: product,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al actualizar el producto');
      }
      throw error;
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.DELETE;
      await axios({
        url: `${url}/${id}`,
        method,
        headers: this.getHeaders(),
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al eliminar el producto');
      }
      throw error;
    }
  }

  static async getAllProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    products: ProductResponse[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      perPage: number;
    };
  }> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.GET_ALL;
      const response = await axios({
        url,
        method,
        headers: this.getHeaders(),
        params,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener los productos');
      }
      throw error;
    }
  }

  // Nuevos métodos para analíticas
  static async getAnalytics(): Promise<DashboardAnalytics> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.ANALYTICS.GET;
      const response = await axios({
        url,
        method,
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Error al obtener las analíticas del dashboard'
        );
      }
      throw error;
    }
  }

  // Método para obtener analíticas por rango de fechas (opcional)
  static async getAnalyticsByDateRange(startDate: Date, endDate: Date): Promise<DashboardAnalytics> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.ANALYTICS.GET;
      const response = await axios({
        url,
        method,
        headers: this.getHeaders(),
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Error al obtener las analíticas por rango de fechas'
        );
      }
      throw error;
    }
  }

  // Método para obtener analíticas de productos específicos
  static async getProductAnalytics(productIds: string[]): Promise<{
    salesData: Array<{
      productId: string;
      name: string;
      totalSales: number;
      averagePrice: number;
    }>;
  }> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.ANALYTICS.GET;
      const response = await axios({
        url: `${url}/products`,
        method,
        headers: this.getHeaders(),
        params: {
          products: productIds.join(','),
        },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Error al obtener las analíticas de productos'
        );
      }
      throw error;
    }
  }

  // Método para obtener analíticas de rendimiento
  static async getPerformanceMetrics(): Promise<{
    dailyStats: Array<{
      date: string;
      views: number;
      sales: number;
      revenue: number;
    }>;
    topProducts: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: number;
    }>;
    conversionRate: number;
  }> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.ANALYTICS.GET;
      const response = await axios({
        url: `${url}/performance`,
        method,
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Error al obtener las métricas de rendimiento'
        );
      }
      throw error;
    }
  }
}