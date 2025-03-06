// src/services/config.service.ts
import { SeoConfig, SiteConfig } from "../types/orders";
import { api } from "./auth.service";
import ENDPOINTS from "../api";
import axios from "axios";

class ConfigService {
  static async getSettings() {
    try {
      const response = await api.get(ENDPOINTS.DASHBOARD.SETTINGS.GET.url);
      return response.data;
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  }

  static async updateSeo(seoConfig: SeoConfig) {
    try {
      const response = await api.patch(
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
      const response = await api.patch(
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
      const response = await api.get(
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
      const response = await api.post(
        ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.CREATE.url,
        service
      );
      return response.data;
    } catch (error) {
      console.error("Error creating highlighted service:", error);
      throw error;
    }
  }
  static async updateHighlightedService(identifier: string, service: any) {
    try {
      const url =
        ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.UPDATE.url.replace(
          ":identifier",
          identifier
        );
      const response = await api.put(url, service);
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
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      console.error(`Error deleting highlighted service ${identifier}:`, error);
      throw error;
    }
  }
  // Achievements Methods
  static async getAchievements() {
    try {
      const response = await api.get(
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
      const response = await api.post(
        ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.GET_ALL.url +
          "/achievements",
        achievement
      );
      return response.data;
    } catch (error) {
      console.error("Error creating achievement:", error);
      throw error;
    }
  }
  static async updateAchievement(id: string, achievement: any) {
    try {
      const response = await api.put(
        `${ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.GET_ALL.url}/achievements/${id}`,
        achievement
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating achievement ${id}:`, error);
      throw error;
    }
  }
  static async deleteAchievement(id: string) {
    try {
      const response = await api.delete(
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
