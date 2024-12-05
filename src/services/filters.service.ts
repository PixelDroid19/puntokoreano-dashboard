// src/services/filters.service.ts
import axios from "axios";
import { Filter } from "../api/types";
import ENDPOINTS from "../api";

interface PaginatedResponse {
  filters: Filter[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    perPage: number;
  };
}

class FiltersService {
  private static getToken(): string {
    return localStorage.getItem("auth_dashboard_token") || "";
  }

  private static getHeaders() {
    return {
      Authorization: `Bearer ${this.getToken()}`,
      "Content-Type": "application/json",
    };
  }

  static async getFilters(): Promise<PaginatedResponse> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.GET_ALL;
      const response = await axios({
        url,
        method,
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener los filtros"
        );
      }
      throw error;
    }
  }

  static async getFilterById(id: string): Promise<Filter> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.GET_BY_ID;
      const response = await axios({
        url: `${url}/${id}`,
        method,
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener el filtro"
        );
      }
      throw error;
    }
  }

  static async createFilter(data: Omit<Filter, '_id'>): Promise<Filter> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.CREATE;
      const response = await axios({
        url,
        method,
        headers: this.getHeaders(),
        data,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al crear el filtro"
        );
      }
      throw error;
    }
  }

  static async updateFilter(
    id: string,
    data: Partial<Filter>
  ): Promise<Filter> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.UPDATE;
      const response = await axios({
        url: `${url}/${id}`,
        method,
        headers: this.getHeaders(),
        data,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al actualizar el filtro"
        );
      }
      throw error;
    }
  }

  static async deleteFilter(id: string): Promise<void> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.DELETE;
      await axios({
        url: `${url}/${id}`,
        method,
        headers: this.getHeaders(),
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al eliminar el filtro"
        );
      }
      throw error;
    }
  }

  static async updateFilterStatus(
    id: string,
    active: boolean
  ): Promise<Filter> {
    return this.updateFilter(id, { active });
  }

  // Método para actualizar secciones específicas
  static async updateFilterSection(
    id: string,
    section: 'families' | 'transmissions' | 'fuels' | 'lines',
    data: Record<string, any>
  ): Promise<Filter> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.UPDATE_SECTION;
      const response = await axios({
        url: `${url}/${id}/${section}`,
        method,
        headers: this.getHeaders(),
        data,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || `Error al actualizar la sección ${section}`
        );
      }
      throw error;
    }
  }

  // Método para obtener una sección específica
  static async getFilterSection(
    id: string,
    section: 'families' | 'transmissions' | 'fuels' | 'lines'
  ): Promise<Record<string, any>> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.FILTERS.GET_SECTION;
      const response = await axios({
        url: `${url}/${id}/${section}`,
        method,
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || `Error al obtener la sección ${section}`
        );
      }
      throw error;
    }
  }
}

export default FiltersService;