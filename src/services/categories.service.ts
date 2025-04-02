// services/category.service.ts
import ENDPOINTS from "../api";
import { axiosInstance } from "../utils/axios-interceptor";

export interface Category {
  _id: string;
  name: string;
  description: string; 
  image: string;
  subgroups: Array<{
    _id?: string;
    name: string;
    active: boolean;
  }>;
  active: boolean;
}

export interface CategoryCreateInput {
  name: string;
  description: string;
  image: string;
  subgroups: Array<{
    name: string;
    active?: boolean;
  }>;
}

export interface CategoryUpdateInput extends Partial<CategoryCreateInput> {
  id: string;
}

export interface SubgroupStatusUpdate {
  categoryId: string;
  subgroupId: string;
  active: boolean;
}

class CategoriesService {
  private static readonly BASE_URL = ENDPOINTS.DASHBOARD.CATEGORIES.GET_ALL.url;
  
  static async getCategories(params?: { 
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const response = await axiosInstance.get(this.BASE_URL, { params });
    return response.data.data;
  }

  static async createCategory(data: Omit<Category, '_id'>) {
    const response = await axiosInstance.post(this.BASE_URL, data);
    return response.data.data;
  }

  static async updateCategory(id: string, data: Partial<Omit<Category, '_id'>>) {
    const response = await axiosInstance.put(`${this.BASE_URL}/${id}`, data);
    return response.data.data;
  }

  static async updateSubgroupStatus({categoryId, subgroupId, active}: SubgroupStatusUpdate) {
    const response = await axiosInstance.patch(
      `${this.BASE_URL}/${categoryId}/subgroups/${subgroupId}/status`,
      { active }
    );
    return response.data.data;
  }

  static async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosInstance.post(`${this.BASE_URL}/upload-image`, formData);
    return response.data.data.url;
  }
}

export default CategoriesService;