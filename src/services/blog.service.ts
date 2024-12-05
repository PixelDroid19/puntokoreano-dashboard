// src/services/blog.service.ts
import { 
  BlogPost, 
  BlogPostCreate, 
  BlogPostUpdate, 
  BlogPostFilters, 
  BlogPostsResponse 
} from  "../types/blog.types";
import { ApiResponse } from "../types/orders";
import { api } from "./auth.service";

class BlogService {
  private static readonly BASE_URL = '/dashboard/blog';

  /**
   * Obtiene los posts del blog con paginación y filtros
   */
  static async getPosts(filters: BlogPostFilters = {}): Promise<ApiResponse<BlogPostsResponse>> {
    try {
      const { data } = await api.get<ApiResponse<BlogPostsResponse>>(this.BASE_URL, { 
        params: filters,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      return data;
    } catch (error) {
      this.handleError(error, 'Error fetching blog posts');
      throw error;
    }
  }

  /**
   * Obtiene un post específico por ID o slug
   */
  static async getPost(identifier: string): Promise<ApiResponse<BlogPost>> {
    try {
      const { data } = await api.get<ApiResponse<BlogPost>>(`${this.BASE_URL}/${identifier}`);
      return data;
    } catch (error) {
      this.handleError(error, 'Error fetching blog post');
      throw error;
    }
  }

  /**
   * Crea un nuevo post
   */
  static async createPost(post: BlogPostCreate): Promise<ApiResponse<BlogPost>> {
    try {
      const { data } = await api.post<ApiResponse<BlogPost>>(this.BASE_URL, post);
      return data;
    } catch (error) {
      this.handleError(error, 'Error creating blog post');
      throw error;
    }
  }

  /**
   * Actualiza un post existente
   */
  static async updatePost(postId: string, post: BlogPostUpdate): Promise<ApiResponse<BlogPost>> {
    try {
      const { data } = await api.patch<ApiResponse<BlogPost>>(`${this.BASE_URL}/${postId}`, post);
      return data;
    } catch (error) {
      this.handleError(error, 'Error updating blog post');
      throw error;
    }
  }

  /**
   * Elimina un post
   */
  static async deletePost(postId: string): Promise<ApiResponse<void>> {
    try {
      const { data } = await api.delete<ApiResponse<void>>(`${this.BASE_URL}/${postId}`);
      return data;
    } catch (error) {
      this.handleError(error, 'Error deleting blog post');
      throw error;
    }
  }

  /**
   * Obtiene metadatos del blog (categorías, tags, etc)
   */
  static async getMetadata(): Promise<ApiResponse<{
    categories: { _id: string; count: number; }[];
    tags: { _id: string; count: number; }[];
  }>> {
    try {
      const { data } = await api.get<ApiResponse<any>>(`${this.BASE_URL}/metadata`);
      return data;
    } catch (error) {
      this.handleError(error, 'Error fetching blog metadata');
      throw error;
    }
  }

  /**
   * Manejador centralizado de errores
   */
  private static handleError(error: any, message: string): never {
    console.error(message, error);
    
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
        case 403:
          throw new Error('Authentication error. Please login again.');
        case 404:
          throw new Error('Resource not found');
        case 422:
          throw new Error('Validation error: ' + JSON.stringify(error.response.data.errors));
        default:
          throw new Error(`Server error: ${error.response.data.message || 'Unknown error'}`);
      }
    }
    
    throw new Error('Network error: Unable to connect to server');
  }
}

export default BlogService;