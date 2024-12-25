// src/services/blog.service.ts

import axios from "axios";
import ENDPOINTS from "../api";
import { BlogFilters, BlogPost, BlogResponse } from "../types/blog.types";
import { api } from "./auth.service";

class BlogService {
  private static readonly IMGBB_API_KEY = process.env.REACT_APP_IMGBB_API_KEY;
  private static readonly IMGBB_API_URL = "https://api.imgbb.com/1/upload";

  static async getPosts(filters: BlogFilters = {}): Promise<BlogResponse> {
    try {
      const { data } = await api.get<BlogResponse>(
        ENDPOINTS.DASHBOARD.BLOG.GET_ALL.url,
        { params: filters }
      );
      return data;
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      throw error;
    }
  }

  private static async uploadToImgBB(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        `${this.IMGBB_API_URL}?key=${this.IMGBB_API_KEY}`,
        formData
      );

      if (response.data.success) {
        return response.data.data.url;
      }
      throw new Error("Error uploading image to ImgBB");
    } catch (error) {
      console.error("Error uploading to ImgBB:", error);
      throw error;
    }
  }

  static async uploadImages(files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) => this.uploadToImgBB(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading multiple images:", error);
      throw error;
    }
  }

  private static async preparePostDataWithImages(postData: Partial<BlogPost>) {
    try {
      let featuredImageUrl = postData.featured_image?.url;

      // Si hay un archivo de imagen destacada nuevo, súbelo a ImgBB
      if (postData.featured_image?.file) {
        featuredImageUrl = await this.uploadToImgBB(
          postData.featured_image.file
        );
      }

      // Manejar imágenes de la galería si existen
      let galleryUrls = [];
      if (postData.gallery?.length) {
        const newImages = postData.gallery.filter((img) => img.file);
        const existingImages = postData.gallery.filter(
          (img) => img.url && !img.file
        );

        const uploadedImages = await this.uploadImages(
          newImages.map((img) => img.file)
        );

        galleryUrls = [
          ...existingImages.map((img) => img.url),
          ...uploadedImages,
        ];
      }

      return {
        ...postData,
        content: postData.content,
        vehicle: {
          brand: postData.vehicle?.brand,
          model: postData.vehicle?.model,
          year_range: postData.vehicle?.year_range || {
            start: new Date().getFullYear(),
            end: new Date().getFullYear(),
          },
        },
        featured_image: featuredImageUrl
          ? {
              url: featuredImageUrl,
              alt: postData.title || "",
            }
          : undefined,
        gallery: galleryUrls.map((url) => ({
          url,
          alt: postData.title || "",
          caption: "",
        })),
        status: postData.status || "draft",
      };
    } catch (error) {
      console.error("Error preparing post data with images:", error);
      throw error;
    }
  }

  static async createPost(
    postData: Partial<BlogPost>
  ): Promise<{ success: boolean; data: BlogPost }> {
    try {
      // Manejar la carga de imágenes antes de crear el post
      const formData = await this.preparePostDataWithImages(postData);
      const { data } = await api.post(
        ENDPOINTS.DASHBOARD.BLOG.CREATE.url,
        formData
      );
      return data;
    } catch (error) {
      console.error("Error creating blog post:", error);
      throw error;
    }
  }

  static async updatePost(
    id: string,
    postData: Partial<BlogPost>
  ): Promise<{ success: boolean; data: BlogPost }> {
    try {
      const formData = await this.preparePostDataWithImages(postData);
      const url = ENDPOINTS.DASHBOARD.BLOG.UPDATE.url.replace(":id", id);
      const { data } = await api.patch(url, formData);
      return data;
    } catch (error) {
      console.error("Error updating blog post:", error);
      throw error;
    }
  }

  static async deletePost(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const url = ENDPOINTS.DASHBOARD.BLOG.DELETE.url.replace(":id", id);
      const { data } = await api.delete(url);
      return data;
    } catch (error) {
      console.error("Error deleting blog post:", error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const { data } = await api.get(ENDPOINTS.DASHBOARD.BLOG.GET_STATS.url);
      return data;
    } catch (error) {
      console.error("Error fetching blog stats:", error);
      throw error;
    }
  }

  static async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post(
        ENDPOINTS.DASHBOARD.BLOG.UPLOAD_IMAGE.url,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  private static preparePostData(postData: Partial<BlogPost>) {
    return {
      ...postData,
      content: postData.content,
      vehicle: {
        brand: postData.vehicle?.brand,
        model: postData.vehicle?.model,
        year_range: postData.vehicle?.year_range || {
          start: new Date().getFullYear(),
          end: new Date().getFullYear(),
        },
      },
      featured_image: postData.featured_image?.url
        ? {
            url: postData.featured_image.url,
            alt: postData.featured_image.alt || postData.title,
          }
        : undefined,
      status: postData.status || "draft",
    };
  }
}

export default BlogService;
