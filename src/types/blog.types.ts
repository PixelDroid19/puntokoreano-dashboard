// src/types/blog.ts
export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: null | {
    _id: string;
    name: string;
  };

  vehicle: {
    year_range: {
      start: number;
      end: number;
    };
    brand: string;
    model: string;
    engine: string;
    image: string;
  };
  maintenance_type:
    | "preventive"
    | "corrective"
    | "upgrade"
    | "tips"
    | "general";
  difficulty_level: "beginner" | "intermediate" | "advanced";
  estimated_time: {
    value: number;
    unit: "minutes" | "hours";
  };
  parts_required: Array<{
    _id: string;
    name: string;
    part_number: string;
    quantity: number;
  }>;
  tools_required: string[];
  featured_image: {
    url: string;
    alt: string;
    file?: File;
  };
  gallery: Array<{
    _id?: string;
    url: string;
    alt: string;
    caption: string;
    file?: File;
  }>;
  status: "draft" | "published" | "archived";
  views: number;
  likes: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface BlogResponse {
  success: boolean;
  data: {
    posts: BlogPost[];
    pagination: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  };
  message?: string;
}

export interface BlogFilters {
  search?: string;
  status?: "draft" | "published" | "archived";
  maintenance_type?: string;
  page?: number;
  limit?: number;
}
