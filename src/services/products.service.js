// src/services/products.service.ts
import axios from "axios";
import ENDPOINTS from "../api";
class ProductsService {
    static getToken() {
        return localStorage.getItem("auth_dashboard_token") || "";
    }
    static getHeaders() {
        return {
            Authorization: `Bearer ${this.getToken()}`,
            "Content-Type": "application/json",
        };
    }
    static async getProducts(params) {
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
                throw new Error(error.response?.data?.message || "Error al obtener los productos");
            }
            throw error;
        }
    }
    static async getProductById(id) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.GET_BY_ID;
            const response = await axios({
                url: `${url}/${id}`,
                method,
                headers: this.getHeaders(),
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error al obtener el producto");
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
                throw new Error(error.response?.data?.message || "Error al eliminar el producto");
            }
            throw error;
        }
    }
    static async updateProduct(id, data) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.UPDATE;
            const response = await axios({
                url: `${url}/${id}`,
                method,
                headers: this.getHeaders(),
                data,
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error al actualizar el producto");
            }
            throw error;
        }
    }
    static async toggleProductStatus(id, active) {
        return this.updateProduct(id, { active });
    }
    static async searchProducts(searchTerm) {
        try {
            const { url, method } = ENDPOINTS.PRODUCTS.SEARCH;
            const response = await axios({
                url,
                method,
                headers: this.getHeaders(),
                params: { query: searchTerm },
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error en la búsqueda de productos");
            }
            throw error;
        }
    }
    static async exportToExcel(limit) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.EXPORT_EXCEL;
            const response = await axios({
                url,
                method,
                headers: this.getHeaders(),
                responseType: "blob",
                params: { limit },
            });
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error al exportar productos");
            }
            throw error;
        }
    }
    static async importFromExcel(file) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.IMPORT_EXCEL;
            const formData = new FormData();
            formData.append("file", file);
            const response = await axios({
                url,
                method,
                headers: {
                    ...this.getHeaders(),
                    "Content-Type": "multipart/form-data",
                },
                data: formData,
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error al importar productos");
            }
            throw error;
        }
    }
    static async downloadTemplate() {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.DOWNLOAD_TEMPLATE;
            const response = await axios({
                url,
                method,
                headers: this.getHeaders(),
                responseType: "blob",
            });
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error al descargar plantilla");
            }
            throw error;
        }
    }
}
export default ProductsService;
