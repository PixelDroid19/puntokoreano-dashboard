// src/types/blog.ts
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  categories: string[];
  tags: string[];
  status: BlogPostStatus;
  featured_image?: string;
  seo?: BlogPostSeo;
  created_at: string;
  updated_at: string;
}

export interface BlogPostCreate {
  title: string;
  content: string;
  excerpt?: string;
  categories: string[];
  tags: string[];
  status: BlogPostStatus;
  featured_image?: string;
  seo?: BlogPostSeo;
}

export interface BlogPostUpdate extends Partial<BlogPostCreate> {}

export type BlogPostStatus = "draft" | "published" | "archived";

export interface BlogPostSeo {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface BlogPostFilters {
  page?: number;
  limit?: number;
  status?: BlogPostStatus;
  category?: string;
  tag?: string;
  search?: string;
  sortBy?: "createdAt" | "title" | "status";
  sortOrder?: "asc" | "desc";
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  stats?: {
    [key in BlogPostStatus]: {
      count: number;
      views: number;
    };
  };
}
