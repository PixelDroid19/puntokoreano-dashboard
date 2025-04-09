// src/services/blog.service.ts
import ENDPOINTS from "../api";
import {
  BlogFilters,
  BlogPostDataToSend,
  BlogPostFromBackend,
  BlogResponse,
  BlogCategory,
  BlogTag,
} from "../types/blog.types";
import { ApiResponse } from "../api/types";
import { axiosInstance } from "../utils/axios-interceptor";
import axios from "axios";

// --- Helper Function for URL Replacement ---
function replaceIdInUrl(url: string, id: string): string {
  return url.replace(":id", id);
}

class BlogService {
  private static readonly IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
  private static readonly IMGBB_API_URL = "https://api.imgbb.com/1/upload";

  private static async uploadToImgBB(file: File): Promise<string> {
    if (!this.IMGBB_API_KEY) {
      throw new Error("ImgBB API Key is not configured.");
    }
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        `${this.IMGBB_API_URL}?key=${this.IMGBB_API_KEY}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Explicitly set header for FormData
          },
        }
      );

      if (response.data.success) {
        return response.data.data.url; // Return the direct image URL
      }
      console.error("ImgBB upload failed:", response.data);
      throw new Error(
        response.data?.error?.message || "Error uploading image to ImgBB"
      );
    } catch (error: any) {
      console.error(
        "Error uploading to ImgBB:",
        error.response?.data || error.message
      );
      // Rethrow a more specific error or the original one
      throw new Error(
        `ImgBB Upload Error: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  // --- Blog Post Service Methods ---

  static async getPosts(filters: BlogFilters = {}): Promise<BlogResponse> {
    try {
      // Assuming backend response matches BlogResponse structure { data: { posts: [], pagination: {} }, ... }
      const { data } = await axiosInstance.get<{
        data: { posts: BlogPostFromBackend[]; total: number };
      }>(
        ENDPOINTS.DASHBOARD.BLOG.GET_ALL.url, // Use correct endpoint name
        { params: filters }
      );
      // Adapt backend response to frontend BlogResponse if needed
      return {
        posts: data.data.posts,
        pagination: {
          // Assuming backend sends total, calculate pages etc.
          total: data.data.total,
          page: Number(filters.page || 1),
          limit: Number(filters.limit || 10),
          pages: Math.ceil(data.data.total / Number(filters.limit || 10)),
        },
      };
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      throw error; // Rethrow for handling in UI/store
    }
  }

  static async getPostById(id: string): Promise<BlogPostFromBackend> {
    try {
      const url = replaceIdInUrl(ENDPOINTS.DASHBOARD.BLOG.GET_ONE.url, id); // Use GET_ONE endpoint
      const { data } = await axiosInstance.get<ApiResponse<BlogPostFromBackend>>(url);
      if (data.status !== "success")
        throw new Error(data.message || "Failed to fetch post");
      return data.data.post;
    } catch (error) {
      console.error(`Error fetching blog post with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Prepares post data for sending to the backend, including uploading image if present.
   * @param postData - Data from the frontend form/store, potentially including a File object.
   * @returns Prepared data object ready for backend submission.
   */
  private static async preparePostData(
    postData: Partial<BlogPostDataToSend & { featuredImageFile?: File | null }>
  ): Promise<BlogPostDataToSend> {
    let featuredImageUrl: string | undefined = undefined;

    // 1. Handle Featured Image Upload
    if (postData.featuredImageFile instanceof File) {
      try {
        featuredImageUrl = await this.uploadToImgBB(postData.featuredImageFile);
      } catch (uploadError) {
        // Handle or rethrow the specific upload error
        console.error("Featured image upload failed:", uploadError);
        throw uploadError; // Stop the process if featured image upload fails
      }
    } else if (typeof postData.featuredImage === "string") {
      // If an existing URL is passed (e.g., during update without changing image)
      featuredImageUrl = postData.featuredImage;
    }

    // 2. Construct the final data object for the backend
    const dataToSend: BlogPostDataToSend = {
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt,
      status: postData.status || "draft",
      categories: postData.categories || [], // Expecting array of IDs
      tags: postData.tags || [], // Expecting array of IDs
      scheduledAt: postData.scheduledAt, // Expecting ISO date string or undefined
      // Only include featuredImage if it has a value (new URL or existing one)
      ...(featuredImageUrl && { featuredImage: featuredImageUrl }),
      // Include other fields the backend expects, e.g., associatedItems if used
      // associatedItems: postData.associatedItems || [],
    };

    // Remove undefined fields explicitly if necessary, although typically backend handles missing optional fields
    Object.keys(dataToSend).forEach(
      (key) => dataToSend[key] === undefined && delete dataToSend[key]
    );

    return dataToSend;
  }

  static async createPost(
    // Input type might include the File object from the form
    postData: Partial<BlogPostDataToSend & { featuredImageFile?: File | null }>
  ): Promise<BlogPostFromBackend> {
    try {
      // Prepare data (handles image upload)
      const dataToSend = await this.preparePostData(postData);

      const { data } = await axiosInstance.post<ApiResponse<BlogPostFromBackend>>(
        ENDPOINTS.DASHBOARD.BLOG.CREATE.url,
        dataToSend // Send the prepared data
      );
      if (data.status !== "success")
        throw new Error(data.message || "Failed to create post");
      return data.data; // Return the created post data from backend
    } catch (error) {
      console.error("Error creating blog post:", error);
      throw error;
    }
  }

  static async updatePost(
    id: string,
    // Input type might include the File object from the form
    postData: Partial<BlogPostDataToSend & { featuredImageFile?: File | null }>
  ): Promise<BlogPostFromBackend> {
    try {
      // Prepare data (handles image upload if a new file is provided)
      const dataToSend = await this.preparePostData(postData);

      const url = replaceIdInUrl(ENDPOINTS.DASHBOARD.BLOG.UPDATE.url, id);
      const { data } = await axiosInstance.patch<ApiResponse<BlogPostFromBackend>>(
        url,
        dataToSend // Send the prepared data
      );
      if (data.status !== "success")
        throw new Error(data.message || "Failed to update post");
      return data.data; // Return the updated post data from backend
    } catch (error) {
      console.error("Error updating blog post:", error);
      throw error;
    }
  }

  static async deletePost(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const url = replaceIdInUrl(ENDPOINTS.DASHBOARD.BLOG.DELETE.url, id);
      // Expecting 204 No Content or a JSON response { success: true }
      const response = await axiosInstance.delete(url);
      // Adapt based on actual backend response for DELETE (maybe it returns {success: true})
      // If 204, status check might be enough
      if (response.status === 204) {
        return { success: true };
      }
      // If JSON response:
      // if (!response.data.success) throw new Error(response.data.message || "Failed to delete post");
      // return response.data;
      return { success: true }; // Assuming success if no error and not 204
    } catch (error) {
      console.error("Error deleting blog post:", error);
      throw error;
    }
  }

  // --- Blog Category Service Methods ---

  static async getCategories(
    filters: any = {}
  ): Promise<{ categories: BlogCategory[]; pagination?: any }> {
    // Adjust filters/pagination type
    try {
      const { data } = await axiosInstance.get<
        ApiResponse<{ categories: BlogCategory[]; pagination?: any }>
      >(ENDPOINTS.DASHBOARD.BLOG_CATEGORIES.GET_ALL.url, { params: filters });
      if (data.status !== "success")
        throw new Error(data.message || "Failed to fetch categories");
      // Adapt response if backend structure differs
      return {
        categories: data.data.categories,
        pagination: data.data.pagination,
      };
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      throw error;
    }
  }

  static async createCategory(categoryData: {
    name: string;
  }): Promise<BlogCategory> {
    try {
      const { data } = await axiosInstance.post<ApiResponse<BlogCategory>>(
        ENDPOINTS.DASHBOARD.BLOG_CATEGORIES.CREATE.url,
        categoryData
      );
      if (data.status !== "success")
        throw new Error(data.message || "Failed to create category");
      return data.data;
    } catch (error) {
      console.error("Error creating blog category:", error);
      throw error;
    }
  }

  static async updateCategory(
    id: string,
    categoryData: { name: string }
  ): Promise<BlogCategory> {
    try {
      const url = replaceIdInUrl(
        ENDPOINTS.DASHBOARD.BLOG_CATEGORIES.UPDATE.url,
        id
      );
      // Using PUT as per routing example
      const { data } = await axiosInstance.put<ApiResponse<BlogCategory>>(
        url,
        categoryData
      );
      if (data.status !== "success")
        throw new Error(data.message || "Failed to update category");
      return data.data;
    } catch (error) {
      console.error("Error updating blog category:", error);
      throw error;
    }
  }

  static async deleteCategory(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const url = replaceIdInUrl(
        ENDPOINTS.DASHBOARD.BLOG_CATEGORIES.DELETE.url,
        id
      );
      const response = await axiosInstance.delete(url);
      if (response.status === 204) return { success: true };
      return { success: true }; // Adjust based on actual response
    } catch (error) {
      console.error("Error deleting blog category:", error);
      throw error;
    }
  }

  // --- Blog Tag Service Methods (Similar to Categories) ---

  static async getTags(
    filters: any = {}
  ): Promise<{ tags: BlogTag[]; pagination?: any }> {
    try {
      const { data } = await axiosInstance.get<
        ApiResponse<{ tags: BlogTag[]; pagination?: any }>
      >(ENDPOINTS.DASHBOARD.BLOG_TAGS.GET_ALL.url, { params: filters });
      if (data.status !== "success") {
        throw new Error(data.message || "Failed to fetch tags");
      }
      return { tags: data.data.tags, pagination: data.data.pagination };
    } catch (error) {
      console.error("Error fetching blog tags:", error);
      throw error;
    }
  }

  static async createTag(tagData: { name: string }): Promise<BlogTag> {
    try {
      const { data } = await axiosInstance.post<ApiResponse<BlogTag>>(
        ENDPOINTS.DASHBOARD.BLOG_TAGS.CREATE.url,
        tagData
      );
      if (data.status !== "success")
        throw new Error(data.message || "Failed to create tag");
      return data.data;
    } catch (error) {
      console.error("Error creating blog tag:", error);
      throw error;
    }
  }

  static async updateTag(
    id: string,
    tagData: { name: string }
  ): Promise<BlogTag> {
    try {
      const url = replaceIdInUrl(ENDPOINTS.DASHBOARD.BLOG_TAGS.UPDATE.url, id);
      const { data } = await axiosInstance.put<ApiResponse<BlogTag>>(url, tagData); // Using PUT
      if (data.status !== "success")
        throw new Error(data.message || "Failed to update tag");
      return data.data;
    } catch (error) {
      console.error("Error updating blog tag:", error);
      throw error;
    }
  }

  static async deleteTag(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const url = replaceIdInUrl(ENDPOINTS.DASHBOARD.BLOG_TAGS.DELETE.url, id);
      const response = await axiosInstance.delete(url);
      if (response.status === 204) return { success: true };
      return { success: true }; // Adjust based on actual response
    } catch (error) {
      console.error("Error deleting blog tag:", error);
      throw error;
    }
  }
}

export default BlogService;
