// src/services/products.service.ts

import axios from "axios";
import { Product } from "../api/types";
import ENDPOINTS from "../api";
import { axiosInstance } from "../utils/axios-interceptor";

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface PaginatedResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    perPage: number;
  };
}

interface UploadImageResponse {
  success: boolean;
  url: string;
  thumbUrl?: string;
  delete_url?: string;
}

class ProductsService {
  static async getProducts(
    params?: PaginationParams
  ): Promise<PaginatedResponse> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.GET_ALL;
      const response = await axiosInstance({
        url,
        method,
        params,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener los productos"
        );
      }
      throw error;
    }
  }

  static async getProductById(id: string): Promise<Product> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.GET_BY_ID;
      const response = await axiosInstance({
        url: `${url}/${id}`,
        method,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener el producto"
        );
      }
      throw error;
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.DELETE;
      await axiosInstance({
        url: `${url}/${id}`,
        method,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al eliminar el producto"
        );
      }
      throw error;
    }
  }

  static async updateProduct(
    id: string,
    data: Partial<Product>
  ): Promise<Product> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.UPDATE;
      const response = await axiosInstance({
        url: `${url}/${id}`,
        method,
        data,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al actualizar el producto"
        );
      }
      throw error;
    }
  }

  static async toggleProductStatus(
    id: string,
    active: boolean
  ): Promise<Product> {
    return this.updateProduct(id, { active });
  }

  static async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const { url, method } = ENDPOINTS.PRODUCTS.SEARCH;
      const response = await axiosInstance({
        url,
        method,

        params: { query: searchTerm },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error en la búsqueda de productos"
        );
      }
      throw error;
    }
  }

  /**
   * Sube una imagen al servidor
   * @param file Archivo a subir
   * @returns Promise con la URL y la URL para borrar
   */
  static async uploadImage(file: File): Promise<UploadImageResponse> {
    try {
      // Verificar el formato
      if (!file.type.startsWith('image/')) {
        throw new Error("El archivo debe ser una imagen");
      }

      // Crear formData para enviar el archivo
      const formData = new FormData();
      formData.append("image", file);

      // Usar un servicio externo como ImgBB para almacenamiento de imágenes
      // Esta es una implementación de ejemplo que usa ImgBB
      const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY || "YOUR_IMGBB_API_KEY";
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, 
        formData
      );

      if (response.data && response.data.success) {
        return {
          success: true,
          url: response.data.data.url,
          thumbUrl: response.data.data.thumb?.url || response.data.data.url,
          delete_url: response.data.data.delete_url
        };
      } else {
        throw new Error("Error al subir la imagen");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al subir la imagen"
        );
      }
      throw error;
    }
  }

  static async exportToExcel(limit?: number): Promise<Blob> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.EXPORT_EXCEL;
      const response = await axiosInstance({
        url,
        method,

        responseType: "blob",
        params: { limit },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al exportar productos"
        );
      }
      throw error;
    }
  }

  static async importFromExcel(file: File): Promise<{
    total: number;
    created: number;
    updated: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.IMPORT_EXCEL;
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance({
        url,
        method,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al importar productos"
        );
      }
      throw error;
    }
  }

  /**
   * Downloads the Excel template for product imports
   * @returns Promise<Blob> The Excel file as a Blob
   * @throws Error if the download fails
   */
  static async downloadTemplate(): Promise<Blob> {
    try {
      const { url, method } = ENDPOINTS.DASHBOARD.PRODUCTS.DOWNLOAD_TEMPLATE;

      // Configure request with proper headers for Excel download
      const response = await axiosInstance({
        url,
        method,
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        responseType: "blob", // Important for handling binary files
      });

      // Validate response
      if (!(response.data instanceof Blob)) {
        throw new Error("Invalid response format");
      }

      // Ensure proper MIME type
      const excelBlob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Set suggested filename for download
      const filename =
        response.headers["content-disposition"]?.split("filename=")[1] ||
        "plantilla_productos.xlsx";

      // Trigger download
      const url1 = window.URL.createObjectURL(excelBlob);
      const link = document.createElement("a");
      link.href = url1;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return excelBlob;
    } catch (error) {
      // Enhanced error handling
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data instanceof Blob
            ? await error.response.data.text()
            : error.response?.data?.message || "Error al descargar plantilla";

        throw new Error(message);
      }
      throw error;
    }
  }
}

export default ProductsService;
