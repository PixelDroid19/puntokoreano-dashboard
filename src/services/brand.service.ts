// src/services/brand.service.ts
import ENDPOINTS from "../api";
import { Brand } from "../api/types";
import { api } from "./auth.service";

class BrandService {
  static async getBrands() {
    try {
      const { data } = await api.get(ENDPOINTS.DASHBOARD.BRAND.GET_ALL.url);
      return data;
    } catch (error) {
      console.error("Error fetching brands:", error);
      throw error;
    }
  }

  static async getBrandByName(name: string) {
    try {
      const { data } = await api.get(
        `${ENDPOINTS.DASHBOARD.BRAND.GET_ALL.url}?name=${name}`
      );
      return data.data?.find(
        (brand) => brand.name.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      console.error("Error fetching brand by name:", error);
      throw error;
    }
  }

  static async createBrand(brandData: Partial<Brand>) {
    try {
      const { data } = await api.post(
        ENDPOINTS.DASHBOARD.BRAND.CREATE.url,
        brandData
      );
      return data;
    } catch (error) {
      console.error("Error creating brand:", error);
      throw error;
    }
  }

  static async updateBrand(id: string, brandData: Partial<Brand>) {
    try {
      const url = ENDPOINTS.DASHBOARD.BRAND.UPDATE.url.replace(":id", id);
      const { data } = await api.put(url, brandData);
      return data;
    } catch (error) {
      console.error("Error updating brand:", error);
      throw error;
    }
  }

  static async deleteBrand(id: string) {
    try {
      const url = ENDPOINTS.DASHBOARD.BRAND.DELETE.url.replace(":id", id);
      const { data } = await api.delete(url);
      return data;
    } catch (error) {
      console.error("Error deleting brand:", error);
      throw error;
    }
  }

  static async associateBlog(brandId: string, blogId: string) {
    try {
      const url = ENDPOINTS.DASHBOARD.BRAND.ASSOCIATE_BLOG.url
        .replace(":brandId", brandId)
        .replace(":blogId", blogId);
      const { data } = await api.post(url);
      return data;
    } catch (error) {
      console.error("Error associating blog with brand:", error);
      throw error;
    }
  }

  static async dissociateBlog(brandId: string, blogId: string) {
    try {
      const url = ENDPOINTS.DASHBOARD.BRAND.DISSOCIATE_BLOG.url
        .replace(":brandId", brandId)
        .replace(":blogId", blogId);
      const { data } = await api.delete(url);
      return data;
    } catch (error) {
      console.error("Error dissociating blog from brand:", error);
      throw error;
    }
  }
}

export default BrandService;
