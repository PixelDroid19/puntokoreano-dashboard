import { axiosInstance } from '../utils/axios-interceptor';
import ENDPOINTS from '../api';

export interface FileUploadResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    filename: string;
    bucket: string;
    contentType: string;
    size: number;
    originalName: string;
  };
  error?: string;
}

export interface MultipleFileUploadResponse {
  success: boolean;
  message: string;
  data?: FileUploadResponse['data'][];
  error?: string;
}

export interface StorageFile {
  name: string;
  url: string;
  size: string;
  contentType: string;
  updated: string;
}

export interface ListFilesResponse {
  success: boolean;
  message: string;
  data?: StorageFile[];
  error?: string;
}

class StorageService {
  /**
   * Sube un único archivo al Google Cloud Storage
   */
  async uploadSingleFile(file: File, folder: string = 'uploads'): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const { url, method } = ENDPOINTS.DASHBOARD.STORAGE.UPLOAD_SINGLE;
    const response = await axiosInstance({
      url,
      method,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Sube múltiples archivos al Google Cloud Storage
   */
  async uploadMultipleFiles(files: File[], folder: string = 'uploads'): Promise<MultipleFileUploadResponse> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('folder', folder);

    const { url, method } = ENDPOINTS.DASHBOARD.STORAGE.UPLOAD_MULTIPLE;
    const response = await axiosInstance({
      url,
      method,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Elimina un archivo del Google Cloud Storage
   */
  async deleteFile(filename: string): Promise<{ success: boolean; message: string }> {
    const { url, method } = ENDPOINTS.DASHBOARD.STORAGE.DELETE_FILE;
    const response = await axiosInstance({
      url: url.replace(':filename', encodeURIComponent(filename)),
      method,
    });
    return response.data;
  }

  /**
   * Lista archivos en una carpeta específica
   */
  async listFiles(folder: string = ''): Promise<ListFilesResponse> {
    const params = folder ? { folder } : {};
    const { url, method } = ENDPOINTS.DASHBOARD.STORAGE.LIST_FILES;
    const response = await axiosInstance({
      url,
      method,
      params,
    });
    return response.data;
  }

  /**
   * Convierte bytes a formato legible
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obtiene la extensión de un archivo desde la URL
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Verifica si un archivo es una imagen
   */
  isImageFile(filename: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    return imageExtensions.includes(this.getFileExtension(filename));
  }

  /**
   * Valida archivos antes de subirlos
   */
  validateFiles(files: File[], options: {
    maxSize?: number; // en bytes
    allowedTypes?: string[];
    maxFiles?: number;
  } = {}): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const { 
      maxSize = 10 * 1024 * 1024, // 10MB por defecto
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'],
      maxFiles = 5
    } = options;

    if (files.length > maxFiles) {
      errors.push(`Máximo ${maxFiles} archivos permitidos`);
    }

    files.forEach((file, index) => {
      if (file.size > maxSize) {
        errors.push(`Archivo ${index + 1}: Tamaño máximo permitido es ${this.formatFileSize(maxSize)}`);
      }

      if (!allowedTypes.includes(file.type)) {
        errors.push(`Archivo ${index + 1}: Tipo de archivo no permitido (${file.type})`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default new StorageService(); 