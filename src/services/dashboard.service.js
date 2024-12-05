// src/services/dashboard.service.ts
import axios from 'axios';
import ENDPOINTS from '../api';
export class DashboardService {
    static getToken() {
        return localStorage.getItem('auth_dashboard_token') || '';
    }
    static getHeaders() {
        return {
            Authorization: `Bearer ${this.getToken()}`,
            'Content-Type': 'application/json',
        };
    }
    // Métodos existentes de productos
    static async createProduct(product) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.CREATE;
            const response = await axios({
                url,
                method,
                headers: this.getHeaders(),
                data: product,
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 409) {
                    throw new Error('El producto ya existe');
                }
                throw new Error(error.response?.data?.message || 'Error al crear el producto');
            }
            throw error;
        }
    }
    static async updateProduct(id, product) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.UPDATE;
            const response = await axios({
                url: `${url}/${id}`,
                method,
                headers: this.getHeaders(),
                data: product,
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Error al actualizar el producto');
            }
            throw error;
        }
    }
    static async deleteProduct(id) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.DELETE;
            await axios({
                url: `${url}/${id}`,
                method,
                headers: this.getHeaders(),
            });
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Error al eliminar el producto');
            }
            throw error;
        }
    }
    static async getAllProducts(params) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.GET_ALL;
            const response = await axios({
                url,
                method,
                headers: this.getHeaders(),
                params,
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Error al obtener los productos');
            }
            throw error;
        }
    }
    // Nuevos métodos para analíticas
    static async getAnalytics() {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.ANALYTICS.GET;
            const response = await axios({
                url,
                method,
                headers: this.getHeaders(),
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Error al obtener las analíticas del dashboard');
            }
            throw error;
        }
    }
    // Método para obtener analíticas por rango de fechas (opcional)
    static async getAnalyticsByDateRange(startDate, endDate) {
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
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Error al obtener las analíticas por rango de fechas');
            }
            throw error;
        }
    }
    // Método para obtener analíticas de productos específicos
    static async getProductAnalytics(productIds) {
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
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Error al obtener las analíticas de productos');
            }
            throw error;
        }
    }
    // Método para obtener analíticas de rendimiento
    static async getPerformanceMetrics() {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.ANALYTICS.GET;
            const response = await axios({
                url: `${url}/performance`,
                method,
                headers: this.getHeaders(),
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Error al obtener las métricas de rendimiento');
            }
            throw error;
        }
    }
}
