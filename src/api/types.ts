// src/api/types.ts
export interface ApiEndpoint {
  url: string;
  method: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  old_price?: number;
  group: string;
  subgroup: string;
  stock: number;
  code: string;
  shipping: string[];
  images: string[];
  short_description: string;
  long_description: string;
  active: boolean;
  videoUrl?: string;
  useGroupImages: boolean;
  imageGroup?: string;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface Endpoints {
  AUTH: {
    LOGIN: ApiEndpoint;
  };
  PRODUCTS: {
    GET_ALL: ApiEndpoint;
    SEARCH: ApiEndpoint;
    PRODUCT_DETAIL: ApiEndpoint;
  };
  FILTERS: {
    GET_ALL: ApiEndpoint;
  };
  GROUPS: {
    GET_ALL: ApiEndpoint;
  };
  DASHBOARD: {
    PRODUCTS: {
      CREATE: ApiEndpoint;
      UPDATE: ApiEndpoint;
      DELETE: ApiEndpoint;
      GET_ALL: ApiEndpoint;
      GET_BY_ID: ApiEndpoint;
      EXPORT_EXCEL: ApiEndpoint;
      IMPORT_EXCEL: ApiEndpoint;
      DOWNLOAD_TEMPLATE: ApiEndpoint;
    };
    FILES: {
      CREATE_GROUP: ApiEndpoint;
      GET_GROUPS: ApiEndpoint;
      UPDATE_GROUP: ApiEndpoint;
      DELETE_GROUP: ApiEndpoint;
      ADD_IMAGES: ApiEndpoint;
      DELETE_IMAGE: ApiEndpoint;
    };
    FILTERS: {
      CREATE: ApiEndpoint;
      UPDATE: ApiEndpoint;
      DELETE: ApiEndpoint;
      GET_ALL: ApiEndpoint;
      GET_BY_ID: ApiEndpoint;
      UPDATE_SECTION: ApiEndpoint;
      GET_SECTION: ApiEndpoint;
    };
    ANALYTICS: {
      GET: ApiEndpoint;
      GET_BY_DATE_RANGE: ApiEndpoint;
      GET_PRODUCT_ANALYTICS: ApiEndpoint;
      GET_PERFORMANCE: ApiEndpoint;
      USERS: {
        ADMIN: {
          GET_ALL: ApiEndpoint;
          CREATE: ApiEndpoint;
          UPDATE: ApiEndpoint;
          DELETE: ApiEndpoint;
          UPDATE_PERMISSIONS: ApiEndpoint;
        };
        CUSTOMERS: {
          GET_ALL: ApiEndpoint;
          GET_DETAILS: ApiEndpoint;
          GET_PURCHASES: ApiEndpoint;
          GET_REVIEWS: ApiEndpoint;
          BLOCK: ApiEndpoint;
          UNBLOCK: ApiEndpoint;
          DELETE: ApiEndpoint;
        };
      };
    };
  };
}

// Tipos para los productos
export interface ProductCreateInput {
  name: string;
  price: number;
  group: string;
  subgroup: string;
  stock: number;
  code: number;
  shipping: string[];
  images: string[];
  short_description: string;
  long_description: string;
  specifications?: Array<{
    key: string;
    value: string;
  }>;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  useGroupImages?: boolean;
  imageGroup?: string;
  active: boolean;
}

export interface ProductResponse {
  id: string;
  name: string;
  price: number;
  group: string;
  subgroup: string;
  stock: number;
  code: number;
  shipping: string[];
  images: string[];
  active: boolean;
  short_description?: string;
  long_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Filter {
  _id: string;
  family_name: string;
  families: Record<
    string,
    Array<{
      label: string;
      value: string;
    }>
  >;
  transmissions: Record<
    string,
    Record<
      string,
      Array<{
        label: string;
        value: string;
      }>
    >
  >;
  fuels: Record<
    string,
    Record<
      string,
      Record<
        string,
        Array<{
          label: string;
          value: string;
        }>
      >
    >
  >;
  lines: Record<
    string,
    Record<
      string,
      Record<
        string,
        Record<
          string,
          Array<{
            label: string;
            value: string;
          }>
        >
      >
    >
  >;
}

export interface DashboardAnalytics {
  products: {
    total: number;
    active: number;
    recentlyAdded: number;
    categoryDistribution: Array<{
      _id: string;
      count: number;
    }>;
  };
  inventory: {
    lowStockAlerts: number;
    totalValue: number;
  };
  filters: {
    total: number;
    familyDistribution: Array<{
      _id: string;
      count: number;
    }>;
  };
  recentActivity: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    updatedAt: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
