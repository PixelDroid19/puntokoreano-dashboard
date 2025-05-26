// src/services/config.service.ts
import { SeoConfig, SiteConfig } from "../types/orders";
import ENDPOINTS from "../api";
import { axiosInstance } from "../utils/axios-interceptor";
import axios from "axios";

class ConfigService {
  static async getSettings() {
    try {
      const response = await axiosInstance.get(ENDPOINTS.DASHBOARD.SETTINGS.GET.url);
      return response.data;
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  }

  static async updateSeo(seoConfig: SeoConfig) {
    try {
      const response = await axiosInstance.patch(
        ENDPOINTS.DASHBOARD.SETTINGS.SEO.UPDATE.url,
        seoConfig
      );
      return response.data;
    } catch (error) {
      console.error("Error updating SEO settings:", error);
      throw error;
    }
  }

  static async updateSettings(settings: Partial<SiteConfig>) {
    try {
      const response = await axiosInstance.patch(
        ENDPOINTS.DASHBOARD.SETTINGS.GET.url,
        settings
      );
      return response.data;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }
  // Highlighted Services Methods
  static async getHighlightedServices() {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.GET_ALL.url
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching highlighted services:", error);
      throw error;
    }
  }
  static async createHighlightedService(service: any) {
    try {
      // Only send the new service data, not all existing services
      const serviceData = {
        title: service.title,
        description: service.description,
        image: service.image,
        stats: service.stats || [],
        active: service.active,
        order: service.order,
        identifier: service.identifier
      };
      
      const response = await axiosInstance.post(
        ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.CREATE.url,
        serviceData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating highlighted service:", error);
      throw error;
    }
  }
  static async updateHighlightedService(identifier: string, service: any, changedFields?: string[]) {
    try {
      const url =
        ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.UPDATE.url.replace(
          ":identifier",
          identifier
        );
      
      // If changedFields is provided, only send those fields
      let updateData = service;
      if (changedFields && changedFields.length > 0) {
        updateData = {};
        changedFields.forEach(field => {
          if (service.hasOwnProperty(field) && field !== 'id' && field !== '_id' && field !== 'identifier') {
            updateData[field] = service[field];
          }
        });
      } else {
        // Clean the data to remove problematic fields
        updateData = { ...service };
        delete updateData.id;
        delete updateData._id;
        delete updateData.identifier;
      }
      
      console.log(`Sending service update for ${identifier}:`, updateData);
      
      const response = await axiosInstance.put(url, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating highlighted service ${identifier}:`, error);
      throw error;
    }
  }
  static async deleteHighlightedService(identifier: string) {
    try {
      const url =
        ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.DELETE.url.replace(
          ":identifier",
          identifier
        );
      const response = await axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      console.error(`Error deleting highlighted service ${identifier}:`, error);
      throw error;
    }
  }
  // Achievements Methods
  static async getAchievements() {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.GET_ALL.url +
          "/achievements"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching achievements:", error);
      throw error;
    }
  }
  static async createAchievement(achievement: any) {
    try {
      // Only send the new achievement data
      const achievementData = {
        title: achievement.title,
        value: achievement.value,
        icon: achievement.icon,
        color: achievement.color,
        active: achievement.active,
        order: achievement.order
      };
      
      const response = await axiosInstance.post(
        ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.GET_ALL.url +
          "/achievements",
        achievementData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating achievement:", error);
      throw error;
    }
  }
  static async updateAchievement(id: string, achievement: any, changedFields?: string[]) {
    try {
      // If changedFields is provided, only send those fields
      let updateData = achievement;
      if (changedFields && changedFields.length > 0) {
        updateData = {};
        changedFields.forEach(field => {
          if (achievement.hasOwnProperty(field) && field !== 'id' && field !== '_id' && field !== 'iconFile') {
            // Si el campo es icon, mapearlo a icon_url para el backend
            if (field === 'icon') {
              updateData['icon_url'] = achievement[field];
            } else {
              updateData[field] = achievement[field];
            }
          }
        });
      } else {
        // Clean the data to remove problematic fields
        updateData = { ...achievement };
        delete updateData.id;
        delete updateData._id;
        delete updateData.iconFile; // Eliminar el archivo local, solo enviar la URL
        
        // Mapear icon a icon_url para el backend
        if (updateData.icon !== undefined) {
          updateData.icon_url = updateData.icon;
          delete updateData.icon;
        }
      }
      
      // Asegurarse de que se envía correctamente el estado de la imagen
      if (updateData.icon_url === "") {
        console.log(`Eliminando imagen del logro ${id}`);
      }
      
      console.log(`Sending achievement update for ${id}:`, updateData);
      
      // Asegurarse de que la URL del endpoint es correcta
      const endpoint = `${ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.GET_ALL.url}/achievements/${id}`;
      console.log(`Endpoint para actualizar logro: ${endpoint}`);
      
      const response = await axiosInstance.put(endpoint, updateData);
      console.log(`Respuesta del backend al actualizar logro ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating achievement ${id}:`, error);
      console.error(`Detalles del error:`, error.response?.data || error.message);
      throw error;
    }
  }
  static async deleteAchievement(id: string) {
    try {
      const response = await axiosInstance.delete(
        `${ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.GET_ALL.url}/achievements/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting achievement ${id}:`, error);
      throw error;
    }
  }
  static async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${
          import.meta.env.VITE_IMGBB_API_KEY
        }`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.error?.message || "Upload failed");
      }
      return response.data.data.url;
    } catch (error: any) {
      console.error("Image upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}

export default ConfigService;
