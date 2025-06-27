// src/api/types.ts
export interface ApiEndpoint {
  url: string;
  method: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  reservedStock: number; // Asegúrate que esté aquí si la usan los modales
  active: boolean;
  group: string;
  subgroup: string;
  short_description: string;
  long_description: string;
  useGroupImages: boolean;
  imageGroup?: string | null;
  thumb?: string;
  carousel?: string[];
  discount: {
    isActive: boolean;
    type: "permanent" | "temporary";
    startDate?: string | null;
    endDate?: string | null;
    percentage: number;
  };
  compatible_vehicles: any[];
  specifications: { key: string; value: string }[];
  variants: { name: string; value: string; price: number }[];
  shipping: string[];
  videoUrl?: string;
  warranty?: string;
  search_terms?: string[];
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
  views?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  code: string;
}

export interface Brand {
  id: string;
  name: string;
  display_name: string;
  image: {
    url: string;
    alt?: string;
  };
  logo: {
    url: string;
    alt?: string;
  };
  styles: {
    background: string;
    text_color: string;
    border_color: string;
  };
  description?: string;
  active: boolean;
  associated_blogs: string[];
  metadata?: {
    year_start?: number;
    year_end?: number;
    popular_models?: string[];
  };
}

export interface ShippingSettings {
  base_costs: {
    pickup: number;
    cod: number;
  };
  weight_rules: {
    base_weight: number;
    extra_cost_per_kg: number;
  };
  location_multipliers: {
    [key: string]: number;
  };
  delivery_times: {
    pickup: {
      min: number;
      max: number;
    };
    cod: {
      min: number;
      max: number;
    };
  };
  free_shipping_rules: {
    threshold: number;
    eligible_locations: string[];
    eligible_methods: string[];
    min_purchase: number;
  };
}

export interface Endpoints {
  AUTH: {
    LOGIN: ApiEndpoint;
    CHECK_SESSION: ApiEndpoint;
    REFRESH_TOKEN: ApiEndpoint;
    LOGOUT: ApiEndpoint;
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
  VEHICLES: {
    GET_ALL: ApiEndpoint;
    CREATE: ApiEndpoint;
    UPDATE: ApiEndpoint;
    DELETE: ApiEndpoint;

    // Brands
    GET_BRANDS: ApiEndpoint;
    CREATE_BRAND: ApiEndpoint;
    UPDATE_BRAND: ApiEndpoint;
    DELETE_BRAND: ApiEndpoint;

    // Families
    GET_FAMILIES: ApiEndpoint;
    CREATE_FAMILY: ApiEndpoint;

    // Models
    GET_MODELS: ApiEndpoint;
    CREATE_MODEL: ApiEndpoint;
    GET_MODELS_BY_FAMILY?: ApiEndpoint;

    // Transmissions
    GET_TRANSMISSIONS: ApiEndpoint;
    CREATE_TRANSMISSION: ApiEndpoint;

    // Fuels
    GET_FUELS: ApiEndpoint;
    CREATE_FUEL: ApiEndpoint;

    // Lines
    GET_LINES: ApiEndpoint;
    CREATE_LINE: ApiEndpoint;

    // Import functionality
    IMPORT_EXCEL: ApiEndpoint;
    DOWNLOAD_TEMPLATE: ApiEndpoint;
  };
  DASHBOARD: {
    DISCOUNTS: {
      APPLY: ApiEndpoint;
      REMOVE: ApiEndpoint;
      GET_HISTORY: ApiEndpoint;
      BULK_APPLY: ApiEndpoint;
      GET_ANALYTICS: ApiEndpoint;
    };
    CATEGORIES: {
      GET_ALL: ApiEndpoint;
      CREATE: ApiEndpoint;
      DELETE: ApiEndpoint;
      UPDATE: ApiEndpoint;
      UPLOAD_IMAGE: ApiEndpoint;
    };
    SETTINGS: {
      GET: ApiEndpoint;
      SEO: {
        UPDATE: ApiEndpoint;
      };
      HIGHLIGHTED_SERVICES: {
        GET_ALL: ApiEndpoint;
        CREATE: ApiEndpoint;
        DELETE: ApiEndpoint;
        UPDATE: ApiEndpoint;
      };
      ABOUT: {
        GET: ApiEndpoint;
        UPDATE: ApiEndpoint;
        UPDATE_CONSULTANT: ApiEndpoint;
      };
    };
    SHIPPING_SETTINGS: {
      GET_ALL: ApiEndpoint;
      UPDATE_BASE_COSTS: ApiEndpoint;
      UPDATE_WEIGHT_RULES: ApiEndpoint;
      UPDATE_LOCATION_MULTIPLIERS: ApiEndpoint;
      UPDATE_DELIVERY_TIMES: ApiEndpoint;
      UPDATE_FREE_SHIPPING: ApiEndpoint;
      GET_PROCESSING_FEES: ApiEndpoint;
      UPDATE_PROCESSING_FEES: ApiEndpoint;
      TOGGLE_PROCESSING_FEES: ApiEndpoint;
    };
    BRAND: {
      CREATE: ApiEndpoint;
      GET_ALL: ApiEndpoint;
      UPDATE: ApiEndpoint;
      DELETE: ApiEndpoint;
      ASSOCIATE_BLOG: ApiEndpoint;
      DISSOCIATE_BLOG: ApiEndpoint;
    };
    BLOG: {
      GET_ALL: ApiEndpoint;
      GET_ONE: ApiEndpoint;
      CREATE: ApiEndpoint;
      UPDATE: ApiEndpoint;
      DELETE: ApiEndpoint;
      GET_STATS: ApiEndpoint; 
      UPLOAD_IMAGE: ApiEndpoint; 
    };
    BLOG_TAGS: { // <<< ADDED SECTION
      GET_ALL: ApiEndpoint;
      GET_ONE: ApiEndpoint;
      CREATE: ApiEndpoint;
      UPDATE: ApiEndpoint;
      DELETE: ApiEndpoint;
  };
    BLOG_CATEGORIES: { 
      GET_ALL: ApiEndpoint;
      GET_ONE: ApiEndpoint;
      CREATE: ApiEndpoint;
      UPDATE: ApiEndpoint;
      DELETE: ApiEndpoint;
  };
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
      DELETE_THUMB: ApiEndpoint;
      DELETE_CAROUSEL_IMAGE: ApiEndpoint;
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
        BASE: {
          VALIDATE_EMAIL: ApiEndpoint;
          VALIDATE_DOCUMENT: ApiEndpoint;
        };
        ADMIN: {
          GET_ALL: ApiEndpoint;
          CREATE: ApiEndpoint;
          UPDATE: ApiEndpoint;
          DELETE: ApiEndpoint;
          UPDATE_PERMISSIONS: ApiEndpoint;
          REFRESH_TOKEN: ApiEndpoint;
          INVALIDATE_SESSIONS: ApiEndpoint;
          LOGOUT: ApiEndpoint;
          BLOCK: ApiEndpoint;
          UNBLOCK: ApiEndpoint;
        };
        CUSTOMERS: {
          GET_ALL: ApiEndpoint;
          CREATE: ApiEndpoint;
          GET_DETAILS: ApiEndpoint;
          UPDATE: ApiEndpoint;
          GET_PURCHASES: ApiEndpoint;
          GET_REVIEWS: ApiEndpoint;
          BLOCK: ApiEndpoint;
          UNBLOCK: ApiEndpoint;
          DELETE: ApiEndpoint;
          GET_STATS: ApiEndpoint;
          GET_DETAILED_STATS: ApiEndpoint;
          GET_ACTIVITY_LOG: ApiEndpoint;
          GET_MODE: ApiEndpoint;
          TOGGLE_MODE: ApiEndpoint;
          REFRESH_TOKEN: ApiEndpoint;
          INVALIDATE_SESSIONS: ApiEndpoint;
          LOGOUT: ApiEndpoint;
        };
      };
    };
    VEHICLE_APPLICABILITY_GROUPS: {
      GET_ALL: ApiEndpoint;
      GET_BY_ID: ApiEndpoint;
      CREATE: ApiEndpoint;
      UPDATE: ApiEndpoint;
      DELETE: ApiEndpoint;
    };
    STORAGE: {
      UPLOAD_SINGLE: ApiEndpoint;
      UPLOAD_MULTIPLE: ApiEndpoint;
      DELETE_FILE: ApiEndpoint;
      DELETE_FILE_BY_URL: ApiEndpoint;
      LIST_FILES: ApiEndpoint;
      OPTIMIZATION_CONFIG: ApiEndpoint;
      UPDATE_OPTIMIZATION_CONFIG: ApiEndpoint;
    };
  };
}

// Tipos para los productos
export interface ProductCreateInput {
  name: string;
  code: string;
  price: number;
  stock: number;
  reservedStock: number;
  group: string;
  subgroup: string;
  short_description: string;
  long_description: string;
  active: boolean;
  useGroupImages: boolean;
  imageGroup?: string;
  thumb?: string;
  carousel?: string[];
  shipping: string[];
  videoUrl?: string;
  warranty: string;
  discount: {
    isActive: boolean;
    type?: string;
    percentage?: number;
    startDate?: Date;
    endDate?: Date;
  };
  compatible_vehicles: string[];
  applicabilityGroups?: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  variants: any[];
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
  thumb?: string;
  carousel?: string[];
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
      _id: string | null; // Category name might be null
      count: number;
    }>;
  };
  inventory: {
    lowStockAlerts: number;
    totalValue: number;
  };
  vehicles: {
    total: number;
    active: number;
    recentlyAdded: number;
    monthlyGrowth: number; // This seems redundant with recentlyAdded if both are 30 days
    growthPercentage: number;
  };
  brands: {
    total: number;
    active: number;
    recentlyAdded: number;
  };
  families: {
    total: number;
    active: number;
    recentlyAdded: number;
  };
  customers: {
    total: number;
    recentlyAdded: number;
    monthlyGrowth: number; // Redundant?
    growthPercentage: number;
  };
  lines: {
    total: number;
    active: number;
    recentlyAdded: number;
    brandDistribution: Array<{
      count: number;
      brandId: string | null; // Brand ID might be null if lookup fails
      brandName: string | null; // Brand name might be null
    }>;
  };
  recentActivityLogs: ActivityLog[]; // Use the more specific type below
  vehicleActivity: VehicleActivity[]; // Use the more specific type below
  // Note: 'filters' section was removed in the previous controller adjustment
  // If you need it back, you'll have to re-add the aggregation in the backend
}

export interface ActivityLog {
  id?: string;
  _id?: string;
  type: string;
  action: string;
  details?: string | object;
  userType?: string;
  userName?: string;
  timestamp: string;
}

export interface VehicleActivity {
  type:
    | "vehicle"
    | "brand"
    | "family"
    | "model"
    | "line"
    | "transmission"
    | "fuel";
  title: string;
  description: string;
  timestamp: string;
  details?: {
    id: string;
    country?: string;
    brand?: string;
    family?: string;
    engine?: string;
    model?: string;
    transmission?: string;
    fuel?: string;
    color?: string;
    features?: string;
    price?: string | number;
  };
}

export interface ApiResponse<T> {
  success: boolean | string;
  data: T;
  message?: string;
  status?: boolean | string;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
