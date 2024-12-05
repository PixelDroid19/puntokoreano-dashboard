// services/files.service.ts
import ENDPOINTS from "../api";
import { api } from "./auth.service";
import axios from "axios";
class FilesService {
    /**
     * Crear nuevo grupo de imágenes
     */
    static async createGroup(data) {
        try {
            const response = await api.post(ENDPOINTS.DASHBOARD.FILES.CREATE_GROUP.url, data);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    static async uploadToImgBB(file) {
        try {
            const formData = new FormData();
            formData.append("image", file);
            const response = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (!response.data?.success) {
                throw new Error(response.data?.error?.message || "Upload failed");
            }
            return response.data;
        }
        catch (error) {
            console.error("ImgBB Upload Error:", error);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }
    static async addImagesToGroup(identifier, files) {
        try {
            // 1. Primero subir cada imagen a ImgBB
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append("image", file);
                const response = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (!response.data?.success) {
                    throw new Error("Upload to ImgBB failed");
                }
                // 2. Construir objeto con la información requerida por el modelo
                return {
                    name: file.name,
                    original_name: file.name,
                    url: response.data.data.url,
                    display_url: response.data.data.display_url,
                    delete_url: response.data.data.delete_url,
                    size: file.size,
                    type: file.type,
                    provider: "imgbb",
                };
            });
            // 3. Esperar a que todas las imágenes se suban
            const uploadedImages = await Promise.all(uploadPromises);
            // 4. Enviar las imágenes al backend
            const response = await api.post(`${ENDPOINTS.DASHBOARD.FILES.CREATE_GROUP.url}/${identifier}`, { images: uploadedImages });
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Upload multiple images and save to group
     */
    static async uploadImages(identifier, files, onProgress) {
        try {
            // Primero subir cada imagen a ImgBB
            const uploadedImages = await Promise.all(files.map(async (file) => {
                const imgbbResponse = await this.uploadToImgBB(file);
                return {
                    name: file.name,
                    original_name: file.name,
                    url: imgbbResponse.data.url,
                    display_url: imgbbResponse.data.display_url,
                    delete_url: imgbbResponse.data.delete_url,
                    size: file.size,
                    type: file.type,
                    provider: "imgbb",
                };
            }));
            // Crear FormData con la información del grupo y las imágenes
            const formData = new FormData();
            formData.append("identifier", identifier);
            formData.append("images", JSON.stringify(uploadedImages));
            const response = await api.post(ENDPOINTS.DASHBOARD.FILES.CREATE_GROUP.url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        }
        catch (error) {
            console.error("Error uploading images:", error);
            throw this.handleError(error);
        }
    }
    /**
     * Obtener grupos de imágenes
     */
    static async getGroups(params) {
        try {
            const response = await api.get(ENDPOINTS.DASHBOARD.FILES.GET_GROUPS.url, {
                params,
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Eliminar imagen de un grupo
     */
    static async deleteImage(identifier, imageId) {
        try {
            const response = await api.delete(`${ENDPOINTS.DASHBOARD.FILES.DELETE_IMAGE.url}/${identifier}/images/${imageId}`);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Actualizar grupo e información
     */
    static async updateGroupDetails(identifier, data) {
        try {
            const response = await api.patch(`${ENDPOINTS.DASHBOARD.FILES.UPDATE_GROUP.url}/${identifier}`, data);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Eliminar grupo completo
     */
    static async deleteGroup(identifier) {
        try {
            const response = await api.delete(`${ENDPOINTS.DASHBOARD.FILES.DELETE_GROUP.url}/${identifier}`);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Actualizar información del grupo
     */
    static async updateGroup(identifier, data) {
        try {
            const response = await api.patch(`${ENDPOINTS.DASHBOARD.FILES.UPDATE_GROUP.url}/${identifier}`, data);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    static handleError(error) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        if (error.code === "ECONNABORTED") {
            throw new Error("La operación ha excedido el tiempo de espera");
        }
        throw new Error(error.message || "Error en la operación");
    }
    static formatFileSize(bytes) {
        if (bytes === 0)
            return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
}
export default FilesService;
