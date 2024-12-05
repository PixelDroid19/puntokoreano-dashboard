// src/services/filters.service.ts
import axios from "axios";
import ENDPOINTS from "../api";
class FiltersService {
    static getToken() {
        return localStorage.getItem("auth_dashboard_token") || "";
    }
    static getHeaders() {
        return {
            Authorization: `Bearer ${this.getToken()}`,
            "Content-Type": "application/json",
        };
    }
    static async getFilters() {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.GET_ALL;
            const response = await axios({
                url,
                method,
                headers: this.getHeaders(),
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error al obtener los filtros");
            }
            throw error;
        }
    }
    static async getFilterById(id) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.GET_BY_ID;
            const response = await axios({
                url: `${url}/${id}`,
                method,
                headers: this.getHeaders(),
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error al obtener el filtro");
            }
            throw error;
        }
    }
    static async createFilter(data) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.CREATE;
            const response = await axios({
                url,
                method,
                headers: this.getHeaders(),
                data,
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error al crear el filtro");
            }
            throw error;
        }
    }
    static async updateFilter(id, data) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.UPDATE;
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
                throw new Error(error.response?.data?.message || "Error al actualizar el filtro");
            }
            throw error;
        }
    }
    static async deleteFilter(id) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.DELETE;
            await axios({
                url: `${url}/${id}`,
                method,
                headers: this.getHeaders(),
            });
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Error al eliminar el filtro");
            }
            throw error;
        }
    }
    static async updateFilterStatus(id, active) {
        return this.updateFilter(id, { active });
    }
    // Método para actualizar secciones específicas
    static async updateFilterSection(id, section, data) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.UPDATE_SECTION;
            const response = await axios({
                url: `${url}/${id}/${section}`,
                method,
                headers: this.getHeaders(),
                data,
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || `Error al actualizar la sección ${section}`);
            }
            throw error;
        }
    }
    // Método para obtener una sección específica
    static async getFilterSection(id, section) {
        try {
            const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.GET_SECTION;
            const response = await axios({
                url: `${url}/${id}/${section}`,
                method,
                headers: this.getHeaders(),
            });
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || `Error al obtener la sección ${section}`);
            }
            throw error;
        }
    }
}
export default FiltersService;
