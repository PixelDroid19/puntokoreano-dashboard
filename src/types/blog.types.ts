// src/types/blog.ts

export type BlogPostStatus = "draft" | "published" | "scheduled";

export interface SimpleAuthor {
  _id: string;
  name: string;
}

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogTag {
  _id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPostFromBackend {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string | null;
  author: SimpleAuthor | null;
  status: BlogPostStatus;
  categories: BlogCategory[];
  tags: BlogTag[];
  // associatedItems: any[]; // Define if needed
  metaTitle?: string;
  metaDescription?: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  // views?: number; // Add if needed
}

export interface BlogPostDataToSend {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string | null;
  status?: BlogPostStatus;
  categories?: string[];
  tags?: string[];
  // associatedItems?: { itemType: string, itemId: string }[]; // Define if needed
  metaTitle?: string;
  metaDescription?: string;
  scheduledAt?: string | null;
}

export interface BlogPostsAdminFilters {
  page?: number;
  limit?: number;
  status?: BlogPostStatus;
  search?: string;
  author?: string;
  category?: string;
  tag?: string;
  sortBy?: "createdAt" | "updatedAt" | "publishedAt" | "title" | "status";
  sortOrder?: "asc" | "desc";
}

export interface BlogPostsAdminResponse {
  posts: BlogPostFromBackend[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface BlogCategoryListResponse {
    categories: BlogCategory[];
    pagination?: {
        total: number;
        pages: number;
        page: number;
        limit: number;
    };
}

export interface BlogTagListResponse {
    tags: BlogTag[];
    pagination?: {
        total: number;
        pages: number;
        page: number;
        limit: number;
    };
}



 export interface BlogResponse { // Specific response wrapper for getPosts if needed
  posts: BlogPostFromBackend[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
   };
 }

 export interface BlogFilters { // Simpler filter set if used elsewhere
   search?: string;
   status?: BlogPostStatus;
   page?: number;
   limit?: number;
 }