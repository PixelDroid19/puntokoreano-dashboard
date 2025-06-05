// services/files.service.ts
// @ts-nocheck
import ENDPOINTS from "../api";
import { axiosInstance } from "../utils/axios-interceptor";
import StorageService from "./storage.service";

export interface ImageData {
  _id: string;
  name: string;
  url: string;
  display_url: string;
  delete_url?: string;
  size: number;
  type: string;
  createdAt: string;
}

export interface ImageGroup {
  _id: string;
  identifier: string;
  description?: string;
  thumb?: string;
  thumb_delete_url?: string;
  carousel?: string[];
  carousel_delete_urls?: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilesResponse {
  success: boolean;
  data: {
    groups: ImageGroup[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

class FilesService {
  /**
   * Crear nuevo grupo de imágenes usando Google Cloud Storage
   */
  static async createGroup(data: {
    identifier: string;
    description?: string;
    tags?: string[];
    thumb?: File;
    thumbUrl?: string;
    carousel?: File[];
    carouselUrls?: string[];
    images?: File[];
    imageUrls?: string[];
  }) {
    try {
      let thumbUrl = data.thumbUrl;
      let carouselUrls = data.carouselUrls || [];
      let imageUrls = data.imageUrls || [];

      // Subir thumb a Google Cloud Storage si es un archivo
      if (data.thumb) {
        const thumbResponse = await StorageService.uploadSingleFile(data.thumb, `images/groups/${data.identifier}`);
        if (thumbResponse.success && thumbResponse.data) {
          thumbUrl = thumbResponse.data.url;
        }
      }

      // Subir imágenes de carrusel a Google Cloud Storage
      if (data.carousel && data.carousel.length) {
        const carouselResponse = await StorageService.uploadMultipleFiles(
          data.carousel, 
          `images/groups/${data.identifier}/carousel`
        );
        if (carouselResponse.success && carouselResponse.data) {
          carouselUrls = carouselResponse.data.map(file => file.url);
        }
      }

      // Subir imágenes principales a Google Cloud Storage
      if (data.images && data.images.length) {
        const imagesResponse = await StorageService.uploadMultipleFiles(
          data.images, 
          `images/groups/${data.identifier}/main`
        );
        if (imagesResponse.success && imagesResponse.data) {
          imageUrls = imagesResponse.data.map(file => file.url);
        }
      }

      // Crear FormData para enviar al backend
      const formData = new FormData();
      
      // Datos básicos
      formData.append('identifier', data.identifier);
      if (data.description) {
        formData.append('description', data.description);
      }
      
      // Tags (opcional)
      if (data.tags && data.tags.length) {
        formData.append('tags', JSON.stringify(data.tags));
      }
      
      // URLs de las imágenes subidas
      if (thumbUrl) {
        formData.append('thumbUrl', thumbUrl);
      }
      
      if (carouselUrls.length) {
        formData.append('carouselUrls', JSON.stringify(carouselUrls));
      }
      
      if (imageUrls.length) {
        formData.append('imageUrls', JSON.stringify(imageUrls));
      }
      
      const response = await axiosInstance.post(
        ENDPOINTS.DASHBOARD.FILES.CREATE_GROUP.url,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Subir archivo individual a Google Cloud Storage
   */
  static async uploadToGCS(file: File, folder: string = 'images') {
    try {
      const response = await StorageService.uploadSingleFile(file, folder);

      if (!response.success) {
        throw new Error(response.error || "Upload failed");
      }

      // Adaptar respuesta para compatibilidad con el formato anterior
      return {
        success: true,
        data: {
          url: response.data?.url,
          display_url: response.data?.url,
          delete_url: null, // GCS no provee URL de eliminación directa
          size: response.data?.size,
          filename: response.data?.filename,
          originalName: response.data?.originalName
        }
      };
    } catch (error: any) {
      console.error("GCS Upload Error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  static async addImagesToGroup(identifier: string, files: File[]) {
    try {
      // 1. Subir todas las imágenes a Google Cloud Storage
      const uploadResponse = await StorageService.uploadMultipleFiles(
        files, 
        `images/groups/${identifier}/additional`
        );

      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error("Failed to upload files to Google Cloud Storage");
        }

        // 2. Construir objeto con la información requerida por el modelo
      const uploadedImages = uploadResponse.data.map((fileData, index) => ({
        name: files[index].name,
        original_name: files[index].name,
        url: fileData.url,
        display_url: fileData.url,
        delete_url: null, // GCS maneja eliminación por filename
        size: fileData.size,
        type: fileData.contentType,
        provider: "gcs",
        filename: fileData.filename
      }));

      // 3. Enviar las imágenes al backend
      const response = await axiosInstance.post(
        `${ENDPOINTS.DASHBOARD.FILES.CREATE_GROUP.url}/${identifier}`,
        { images: uploadedImages }
      );

      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload multiple images and save to group usando Google Cloud Storage
   */
  static async uploadImages(
    identifier: string,
    files: File[],
    onProgress?: (progressEvent: ProgressEvent) => void
  ) {
    try {
      // Subir todas las imágenes a Google Cloud Storage
      const uploadResponse = await StorageService.uploadMultipleFiles(
        files,
        `images/groups/${identifier}`
      );

      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error("Failed to upload files to Google Cloud Storage");
      }

      // Adaptar respuesta para compatibilidad
      const uploadedImages = uploadResponse.data.map((fileData, index) => ({
        name: files[index].name,
        original_name: files[index].name,
        url: fileData.url,
        display_url: fileData.url,
        delete_url: null,
        size: fileData.size,
        type: fileData.contentType,
        provider: "gcs",
        filename: fileData.filename
      }));

      // Crear FormData con la información del grupo y las imágenes
      const formData = new FormData();
      formData.append("identifier", identifier);
      formData.append("images", JSON.stringify(uploadedImages));

      const response = await axiosInstance.post(
        ENDPOINTS.DASHBOARD.FILES.CREATE_GROUP.url,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error uploading images:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener grupos de imágenes
   */
  static async getGroups(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<FilesResponse> {
    try {
      const response = await axiosInstance.get(ENDPOINTS.DASHBOARD.FILES.GET_GROUPS.url, {
        params,
        timeout: 10000,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar imagen de un grupo
   */
  static async deleteImage(identifier: string, imageId: string) {
    try {
      const response = await axiosInstance.delete(
        `${ENDPOINTS.DASHBOARD.FILES.DELETE_IMAGE.url}/${identifier}/images/${imageId}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar grupo e información
   */
  static async updateGroupDetails(
    identifier: string,
    data: {
      description?: string;
      tags?: string[];
    }
  ) {
    try {
      const response = await axiosInstance.patch(
        `${ENDPOINTS.DASHBOARD.FILES.UPDATE_GROUP.url}/${identifier}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar información del grupo usando Google Cloud Storage
   */
  static async updateGroup(
    identifier: string,
    data: { 
      description?: string; 
      thumb?: File | string;
      carousel?: string[] | File[];
    }
  ) {
    try {
      let thumbUrl = typeof data.thumb === 'string' ? data.thumb : undefined;
      let carouselUrls: string[] = [];

      // Subir thumb a GCS si es un archivo
        if (data.thumb && data.thumb instanceof File) {
        const thumbResponse = await StorageService.uploadSingleFile(
          data.thumb, 
          `images/groups/${identifier}`
        );
        if (thumbResponse.success && thumbResponse.data) {
          thumbUrl = thumbResponse.data.url;
        }
        }
        
      // Procesar carousel
        if (data.carousel && data.carousel.length > 0) {
          if (data.carousel[0] instanceof File) {
          // Son archivos - subir a GCS
          const carouselResponse = await StorageService.uploadMultipleFiles(
            data.carousel as File[], 
            `images/groups/${identifier}/carousel`
          );
          if (carouselResponse.success && carouselResponse.data) {
            carouselUrls = carouselResponse.data.map(file => file.url);
          }
        } else {
          // Son URLs - mantener como están
          carouselUrls = data.carousel as string[];
        }
      }

      // Crear FormData para enviar al backend
      const formData = new FormData();
      
      if (data.description !== undefined) {
        formData.append('description', data.description);
      }
      
      if (thumbUrl) {
        formData.append('thumbUrl', thumbUrl);
      }
      
      if (carouselUrls.length > 0) {
        formData.append('carouselUrls', JSON.stringify(carouselUrls));
        }
        
        const response = await axiosInstance.patch(
          ENDPOINTS.DASHBOARD.FILES.UPDATE_GROUP.url.replace(':identifier', identifier),
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar grupo completo
   */
  static async deleteGroup(identifier: string) {
    try {
      const response = await axiosInstance.delete(
        ENDPOINTS.DASHBOARD.FILES.DELETE_GROUP.url.replace(':identifier', identifier)
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar miniatura de un grupo
   */
  static async deleteThumb(identifier: string) {
    try {
      const response = await axiosInstance.delete(
        ENDPOINTS.DASHBOARD.FILES.DELETE_THUMB.url.replace(':identifier', identifier)
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar imagen de carrusel por índice
   */
  static async deleteCarouselImage(identifier: string, index: number) {
    try {
      const response = await axiosInstance.delete(
        ENDPOINTS.DASHBOARD.FILES.DELETE_CAROUSEL_IMAGE.url
          .replace(':identifier', identifier)
          .replace(':index', index.toString())
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any): never {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.code === "ECONNABORTED") {
      throw new Error("La operación ha excedido el tiempo de espera");
    }
    throw new Error(error.message || "Error en la operación");
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Subir imagen individual para productos usando Google Cloud Storage
   * Sigue el mismo patrón que createGroup para consistencia
   */
  static async uploadProductImage(file: File, folder: string = 'products/images') {
    try {
      const response = await StorageService.uploadSingleFile(file, folder);

      if (!response.success) {
        throw new Error(response.error || "Upload failed");
      }

      // Adaptar respuesta al formato esperado por los componentes de productos
      return {
        success: true,
        data: {
          url: response.data?.url,
          thumbUrl: response.data?.url, // GCS no tiene thumbnails separados
          delete_url: response.data?.filename, // Filename para eliminación
          size: response.data?.size,
          filename: response.data?.filename,
          originalName: response.data?.originalName
        }
      };
    } catch (error: any) {
      console.error("Product Image Upload Error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}

export default FilesService;

