import { api } from './auth.service';
class OrdersService {
    static async getOrders(params) {
        try {
            const response = await api.get('/dashboard/orders', { params });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }
    static async updateOrderStatus(orderId, data) {
        try {
            const response = await api.patch(`/dashboard/orders/${orderId}/status`, data);
            return response.data;
        }
        catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }
    static async getOrderDetails(orderId) {
        try {
            const response = await api.get(`/dashboard/orders/${orderId}`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    }
}
export default OrdersService;
