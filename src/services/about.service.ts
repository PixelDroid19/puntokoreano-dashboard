// src/services/about.service.ts
import { api } from "./auth.service";
import axios from "axios";
import type {
  AboutSettings,
  ConsultantUpdate,
  AboutSettingsResponse,
} from "../types/about.types";
import ENDPOINTS from "../api";

class AboutService {
  static async getSettings(): Promise<AboutSettingsResponse> {
    try {
      const response = await api.get(
        ENDPOINTS.DASHBOARD.SETTINGS.ABOUT.GET.url
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error fetching about settings"
      );
    }
  }

  static async updateSettings(
    settings: Partial<AboutSettings>
  ): Promise<AboutSettingsResponse> {
    try {
      const response = await api.patch(
        ENDPOINTS.DASHBOARD.SETTINGS.ABOUT.UPDATE.url,
        settings
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error updating about settings"
      );
    }
  }

  static async updateConsultant(
    id: string,
    data: ConsultantUpdate
  ): Promise<AboutSettingsResponse> {
    try {
      const url =
        ENDPOINTS.DASHBOARD.SETTINGS.ABOUT.UPDATE_CONSULTANT.url.replace(
          ":id",
          id
        );
      const response = await api.patch(url, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error updating consultant"
      );
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

export default AboutService;
