// src/services/orders.service.ts
import { OrderStatusUpdate } from '../types/orders';
import { api } from './auth.service';

class OrdersService {
  static async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    try {
      const response = await api.get('/dashboard/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  static async updateOrderStatus(orderId: string, data: OrderStatusUpdate) {
    try {
      const response = await api.patch(`/dashboard/orders/${orderId}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  static async getOrderDetails(orderId: string) {
    try {
      const response = await api.get(`/dashboard/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }
}

export default OrdersService;