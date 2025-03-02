// src/services/config.service.ts
import { SeoConfig, SiteConfig } from '../types/orders';
import { api } from './auth.service';
import ENDPOINTS from '../api';

class ConfigService {
  static async getSettings() {
    try {
      const response = await api.get(ENDPOINTS.DASHBOARD.SETTINGS.GET.url);
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  static async updateSeo(seoConfig: SeoConfig) {
    try {
      const response = await api.patch(ENDPOINTS.DASHBOARD.SETTINGS.SEO.UPDATE.url, seoConfig);
      return response.data;
    } catch (error) {
      console.error('Error updating SEO settings:', error);
      throw error;
    }
  }

  static async updateSettings(settings: Partial<SiteConfig>) {
    try {
      const response = await api.patch(ENDPOINTS.DASHBOARD.SETTINGS.GET.url, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  static async getHighlightedServices() {
    try {
      const response = await api.get(ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.GET_ALL.url);
      return response.data;
    } catch (error) {
      console.error('Error fetching highlighted services:', error);
      throw error;
    }
  }

  static async updateHighlightedServices(services: any[]) {
    try {
      // This is now a compatibility layer that handles individual service updates
      // First get current services to compare
      const currentServices = await this.getHighlightedServices();
      const currentServicesData = currentServices.data || [];
      
      // Process each service
      await Promise.all(services.map(async (service) => {
        // Check if service exists by identifier
        const existingService = currentServicesData.find(
          (s: any) => s.identifier === service.identifier
        );
        
        if (existingService) {
          // Update existing service
          const url = ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.UPDATE.url.replace(
            ':identifier',
            service.identifier
          );
          const response = await api.put(url, service);
          return response.data;
        } else {
          // Create new service
          const response = await api.post(ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.CREATE.url, service);
          return response.data;
        }
      }));
      
      // Handle deletions - services that exist in current but not in the new list
      const newIdentifiers = services.map(s => s.identifier);
      const deletionPromises = currentServicesData
        .filter((s: any) => !newIdentifiers.includes(s.identifier))
        .map((s: any) => {
          const url = ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.DELETE.url.replace(
            ':identifier',
            s.identifier
          );
          return api.delete(url);
        });
      
      await Promise.all(deletionPromises);
      
      // Return a compatible response format
      return {
        data: services,
        success: true
      };
    } catch (error) {
      console.error('Error updating highlighted services:', error);
      throw error;
    }
  }
  
  static async deleteHighlightedService(identifier: string) {
    try {
      const url = ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.DELETE.url.replace(
        ':identifier',
        identifier
      );
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      console.error(`Error deleting highlighted service ${identifier}:`, error);
      throw error;
    }
  }
  
  static async createHighlightedService(service: any) {
    try {
      const response = await api.post(ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.CREATE.url, service);
      return response.data;
    } catch (error) {
      console.error('Error creating highlighted service:', error);
      throw error;
    }
  }
  
  static async updateHighlightedService(identifier: string, service: any) {
    try {
      const url = ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.UPDATE.url.replace(
        ':identifier',
        identifier
      );
      const response = await api.put(url, service);
      return response.data;
    } catch (error) {
      console.error(`Error updating highlighted service ${identifier}:`, error);
      throw error;
    }
  }

  static async uploadImage(file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(ENDPOINTS.DASHBOARD.SETTINGS.HIGHLIGHTED_SERVICES.UPLOAD.url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
}

export default ConfigService;