import { Endpoints } from "./types";

export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";

const getBaseUrl = (): string => {
  // Usar una variable más explícita para el entorno
  const isProduction = import.meta.env.PROD;
  const envApiUrl = import.meta.env.VITE_API_REST_URL;

  // Log para debugging (se eliminará en producción)
  if (import.meta.env.DEV) {
    console.log("Environment:", isProduction ? "Production" : "Development");
    console.log("API URL:", envApiUrl);
  }

  // Usar un objeto de configuración más robusto
  const config = {
    development: {
      apiUrl: "http://localhost:5000/api/v1",
      timeout: 10000,
      retries: 3,
    },
    production: {
      apiUrl: envApiUrl,
      timeout: 15000,
      retries: 5,
    },
  };

  const currentConfig = isProduction ? config.production : config.development;

  if (!currentConfig.apiUrl) {
    throw new Error(
      `API URL not configured for ${
        isProduction ? "production" : "development"
      } environment`
    );
  }

  return currentConfig.apiUrl;
 
};

export const API_CONFIG = {
  baseUrl: getBaseUrl(),
  isProduction: import.meta.env.PROD,
  version: "1.0.0",
};

export const BASE_URL = API_CONFIG.baseUrl;

const ENDPOINTS: Endpoints = {
  AUTH: {
    LOGIN: {
      url: `${BASE_URL}/auth/dashboard/login`,
      method: "POST",
    },
    CHECK_SESSION: {
      url: `${BASE_URL}/auth/dashboard/check-session`,
      method: "GET", 
    },
    REFRESH_TOKEN: {
      url: `${BASE_URL}/auth/dashboard/refresh-token`,
      method: "POST",
    },
    LOGOUT: {
      url: `${BASE_URL}/auth/dashboard/logout`,
      method: "POST", 
    },
   
  },

  PRODUCTS: {
    PRODUCT_DETAIL: {
      url: `${BASE_URL}/products/detail`,
      method: "GET",
    },
    GET_ALL: {
      url: `${BASE_URL}/products/get-products`,
      method: "GET",
    },
    SEARCH: {
      url: `${BASE_URL}/products/search`,
      method: "GET",
    },
  },

  FILTERS: {
    GET_ALL: {
      url: `${BASE_URL}/filters/get-filters`,
      method: "GET",
    },
  },

  GROUPS: {
    GET_ALL: {
      url: `${BASE_URL}/groups/get-groups`,
      method: "GET",
    },
  },

  VEHICLES: {
    // Core Vehicle CRUD
    GET_ALL: { url: `${BASE_URL}/dashboard/vehicles`, method: "GET" },
    CREATE: { url: `${BASE_URL}/dashboard/vehicles`, method: "POST" },
    UPDATE: { url: `${BASE_URL}/dashboard/vehicles/:id`, method: "PUT" },
    DELETE: { url: `${BASE_URL}/dashboard/vehicles/:id`, method: "DELETE" },
    // GET_BY_ID: { url: `${BASE_URL}/dashboard/vehicles/:id`, method: "GET" }, // Add if needed

    // Brands
    GET_BRANDS: { url: `${BASE_URL}/dashboard/vehicle-brands`, method: "GET" },
    CREATE_BRAND: {
      url: `${BASE_URL}/dashboard/vehicle-brands`,
      method: "POST",
    },
    UPDATE_BRAND: {
      url: `${BASE_URL}/dashboard/vehicle-brands/:id`,
      method: "PUT",
    },
    DELETE_BRAND: {
      url: `${BASE_URL}/dashboard/vehicle-brands/:id`,
      method: "DELETE",
    },

    // Families
    GET_FAMILIES: {
      url: `${BASE_URL}/dashboard/vehicle-families`,
      method: "GET",
    },
    CREATE_FAMILY: {
      url: `${BASE_URL}/dashboard/vehicle-families`,
      method: "POST",
    },

    // Models
    GET_MODELS: { url: `${BASE_URL}/dashboard/vehicles/models`, method: "GET" }, // General get
    CREATE_MODEL: {
      url: `${BASE_URL}/dashboard/vehicles/models`,
      method: "POST",
    }, // General create
    // Optional: Keep specific getters if needed elsewhere
    // GET_MODELS_BY_FAMILY: { url: `${BASE_URL}/dashboard/vehicles/families/:familyId/models`, method: "GET" },

    // Transmissions
    GET_TRANSMISSIONS: {
      url: `${BASE_URL}/dashboard/vehicles/transmissions`,
      method: "GET",
    },
    CREATE_TRANSMISSION: {
      url: `${BASE_URL}/dashboard/vehicles/transmissions`,
      method: "POST",
    },

    // Fuels
    GET_FUELS: { url: `${BASE_URL}/dashboard/vehicles/fuels`, method: "GET" },
    CREATE_FUEL: {
      url: `${BASE_URL}/dashboard/vehicles/fuels`,
      method: "POST",
    },

    GET_LINES: { url: `${BASE_URL}/dashboard/vehicles/lines`, method: "GET" },
    CREATE_LINE: {
      url: `${BASE_URL}/dashboard/vehicles/lines`,
      method: "POST",
    },

    // Import functionality
    IMPORT_EXCEL: {
      url: `${BASE_URL}/dashboard/vehicles/import`,
      method: "POST",
    },
    DOWNLOAD_TEMPLATE: {
      url: `${BASE_URL}/dashboard/vehicles/import/template`,
      method: "GET",
    },
  },

  DASHBOARD: {
    CATEGORIES: {
      GET_ALL: {
        url: `${BASE_URL}/dashboard/categories`,
        method: "GET",
      },
      CREATE: {
        url: `${BASE_URL}/dashboard/categories`,
        method: "POST",
      },
      UPDATE: {
        url: `${BASE_URL}/dashboard/categories/:id`,
        method: "PUT",
      },
      DELETE: {
        url: `${BASE_URL}/dashboard/categories/:id`,
        method: "DELETE",
      },
      UPLOAD_IMAGE: {
        url: `${BASE_URL}/dashboard/categories/upload-image`,
        method: "POST",
      },
    },
    DISCOUNTS: {
      APPLY: {
        url: `${BASE_URL}/dashboard/discounts/products/:productId/discount`,
        method: "POST",
      },
      REMOVE: {
        url: `${BASE_URL}/dashboard/discounts/products/:productId/discount`,
        method: "DELETE",
      },
      GET_HISTORY: {
        url: `${BASE_URL}/dashboard/discounts/products/:productId/discount/history`,
        method: "GET",
      },
      BULK_APPLY: {
        url: `${BASE_URL}/dashboard/discounts/bulk-discounts`,
        method: "POST",
      },
      GET_ANALYTICS: {
        url: `${BASE_URL}/dashboard/discounts/analytics`,
        method: "GET",
      },
    },
    SETTINGS: {
      GET: {
        url: `${BASE_URL}/dashboard/settings`,
        method: "GET",
      },
      SEO: {
        UPDATE: {
          url: `${BASE_URL}/dashboard/settings/seo`,
          method: "PATCH",
        },
      },
      HIGHLIGHTED_SERVICES: {
        GET_ALL: {
          url: `${BASE_URL}/dashboard/highlighted-services`,
          method: "GET",
        },
        CREATE: {
          url: `${BASE_URL}/dashboard/highlighted-services`,
          method: "POST",
        },
        UPDATE: {
          url: `${BASE_URL}/dashboard/highlighted-services/:identifier`,
          method: "PUT",
        },
        DELETE: {
          url: `${BASE_URL}/dashboard/highlighted-services/:identifier`,
          method: "DELETE",
        },
      },
      ABOUT: {
        GET: {
          url: `${BASE_URL}/dashboard/settings/about`,
          method: "GET",
        },
        UPDATE: {
          url: `${BASE_URL}/dashboard/settings/about`,
          method: "PATCH",
        },
        UPDATE_CONSULTANT: {
          url: `${BASE_URL}/dashboard/settings/about/consultants/:id`,
          method: "PATCH",
        },
      },
    },
    SHIPPING_SETTINGS: {
      GET_ALL: {
        url: `${BASE_URL}/dashboard/shipping-settings`,
        method: "GET",
      },
      UPDATE_BASE_COSTS: {
        url: `${BASE_URL}/dashboard/shipping-settings/base-costs`,
        method: "PATCH",
      },
      UPDATE_WEIGHT_RULES: {
        url: `${BASE_URL}/dashboard/shipping-settings/weight-rules`,
        method: "PATCH",
      },
      UPDATE_LOCATION_MULTIPLIERS: {
        url: `${BASE_URL}/dashboard/shipping-settings/location-multipliers`,
        method: "PATCH",
      },
      UPDATE_DELIVERY_TIMES: {
        url: `${BASE_URL}/dashboard/shipping-settings/delivery-times`,
        method: "PATCH",
      },
      UPDATE_FREE_SHIPPING: {
        url: `${BASE_URL}/dashboard/shipping-settings/free-shipping`,
        method: "PATCH",
      },
    },
    BRAND: {
      CREATE: {
        url: `${BASE_URL}/dashboard/brands`,
        method: "POST",
      },
      GET_ALL: {
        url: `${BASE_URL}/dashboard/brands`,
        method: "GET",
      },
      UPDATE: {
        url: `${BASE_URL}/dashboard/brands/:id`,
        method: "PUT",
      },
      DELETE: {
        url: `${BASE_URL}/dashboard/brands/:id`,
        method: "DELETE",
      },
      ASSOCIATE_BLOG: {
        url: `${BASE_URL}/dashboard/brands/:brandId/blogs/:blogId`,
        method: "POST",
      },
      DISSOCIATE_BLOG: {
        url: `${BASE_URL}/dashboard/brands/:brandId/blogs/:blogId`,
        method: "DELETE",
      },
    },
    PRODUCTS: {
      CREATE: {
        url: `${BASE_URL}/dashboard/products`,
        method: "POST",
      },
      GET_ALL: {
        url: `${BASE_URL}/dashboard/products`,
        method: "GET",
      },
      GET_BY_ID: {
        url: `${BASE_URL}/dashboard/products`,
        method: "GET",
      },
      UPDATE: {
        url: `${BASE_URL}/dashboard/products`,
        method: "PUT",
      },
      DELETE: {
        url: `${BASE_URL}/dashboard/products`,
        method: "DELETE",
      },
      EXPORT_EXCEL: {
        url: `${BASE_URL}/dashboard/products/excel/export`,
        method: "GET",
      },
      IMPORT_EXCEL: {
        url: `${BASE_URL}/dashboard/products/excel/import`,
        method: "POST",
      },
      DOWNLOAD_TEMPLATE: {
        url: `${BASE_URL}/dashboard/products/excel/template`,
        method: "GET",
      },
    },
    BLOG: {
      GET_ALL: {
        url: `${BASE_URL}/dashboard/blog`,
        method: "GET",
      },
      GET_ONE: {
        url: `${BASE_URL}/dashboard/blog/:id`,
        method: "GET",
      },
      CREATE: {
        url: `${BASE_URL}/dashboard/blog`,
        method: "POST",
      },
      UPDATE: {
        url: `${BASE_URL}/dashboard/blog/:id`,
        method: "PATCH",
      },
      DELETE: {
        url: `${BASE_URL}/dashboard/blog/:id`,
        method: "DELETE",
      },

      GET_STATS: {
        url: `${BASE_URL}/dashboard/blog/stats`,
        method: "GET",
      },
      UPLOAD_IMAGE: {
        url: `${BASE_URL}/dashboard/blog/upload-image`,
        method: "POST",
      },
    },

    BLOG_CATEGORIES: {
      GET_ALL: {
        url: `${BASE_URL}/dashboard/blog-categories`,
        method: "GET",
      },
      GET_ONE: {
        url: `${BASE_URL}/dashboard/blog-categories/:id`,
        method: "GET",
      },
      CREATE: {
        url: `${BASE_URL}/dashboard/blog-categories`,
        method: "POST",
      },
      UPDATE: {
        url: `${BASE_URL}/dashboard/blog-categories/:id`,
        method: "PUT",
      },
      DELETE: {
        url: `${BASE_URL}/dashboard/blog-categories/:id`,
        method: "DELETE",
      },
    },

    BLOG_TAGS: {
      GET_ALL: {
        url: `${BASE_URL}/dashboard/blog-tags`,
        method: "GET",
      },
      GET_ONE: {
        url: `${BASE_URL}/dashboard/blog-tags/:id`,
        method: "GET",
      },
      CREATE: {
        url: `${BASE_URL}/dashboard/blog-tags`,
        method: "POST",
      },
      UPDATE: {
        url: `${BASE_URL}/dashboard/blog-tags/:id`,
        method: "PUT",
      },
      DELETE: {
        url: `${BASE_URL}/dashboard/blog-tags/:id`,
        method: "DELETE",
      },
    },
    FILTERS: {
      CREATE: {
        url: `${BASE_URL}/dashboard/filters`,
        method: "POST",
      },
      GET_ALL: {
        url: `${BASE_URL}/dashboard/filters`,
        method: "GET",
      },
      GET_BY_ID: {
        url: `${BASE_URL}/dashboard/filters`,
        method: "GET",
      },
      UPDATE: {
        url: `${BASE_URL}/dashboard/filters`,
        method: "PUT",
      },
      DELETE: {
        url: `${BASE_URL}/dashboard/filters`,
        method: "DELETE",
      },
      UPDATE_SECTION: {
        url: `${BASE_URL}/dashboard/filters/section`,
        method: "PUT",
      },
      GET_SECTION: {
        url: `${BASE_URL}/dashboard/filters/section`,
        method: "GET",
      },
    },
    FILES: {
      CREATE_GROUP: {
        url: `${BASE_URL}/dashboard/files/groups`,
        method: "POST",
      },
      GET_GROUPS: {
        url: `${BASE_URL}/dashboard/files/groups`,
        method: "GET",
      },
      UPDATE_GROUP: {
        url: `${BASE_URL}/dashboard/files/groups/:identifier`,
        method: "PATCH",
      },
      DELETE_GROUP: {
        url: `${BASE_URL}/dashboard/files/groups/:identifier`,
        method: "DELETE",
      },
      DELETE_THUMB: {
        url: `${BASE_URL}/dashboard/files/groups/:identifier/thumb`,
        method: "DELETE",
      },
      DELETE_CAROUSEL_IMAGE: {
        url: `${BASE_URL}/dashboard/files/groups/:identifier/carousel/:index`,
        method: "DELETE",
      },
    },
    ANALYTICS: {
      GET: {
        url: `${BASE_URL}/dashboard/analytics`,
        method: "GET",
      },
      GET_BY_DATE_RANGE: {
        url: `${BASE_URL}/dashboard/analytics/date-range`,
        method: "GET",
      },
      GET_PRODUCT_ANALYTICS: {
        url: `${BASE_URL}/dashboard/analytics/products`,
        method: "GET",
      },
      GET_PERFORMANCE: {
        url: `${BASE_URL}/dashboard/analytics/performance`,
        method: "GET",
      },
      USERS: {
        BASE: {
          VALIDATE_EMAIL: {
            url: `${BASE_URL}/dashboard/users/validate-email`,
            method: "POST",
          },
          VALIDATE_DOCUMENT: {
            url: `${BASE_URL}/dashboard/users/validate-document`,
            method: "POST",
          },
        },
        ADMIN: {
          GET_ALL: {
            url: `${BASE_URL}/dashboard/users/admin`,
            method: "GET",
          },
          CREATE: {
            url: `${BASE_URL}/dashboard/users/admin`,
            method: "POST",
          },
          UPDATE: {
            url: `${BASE_URL}/dashboard/users/admin/:id`,
            method: "PATCH",
          },
          DELETE: {
            url: `${BASE_URL}/dashboard/users/admin/:id`,
            method: "DELETE",
          },
          UPDATE_PERMISSIONS: {
            url: `${BASE_URL}/dashboard/users/admin/:id/permissions`,
            method: "PATCH",
          },
          REFRESH_TOKEN: {
            url: `${BASE_URL}/dashboard/users/admin/:id/refresh-token`,
            method: "POST",
          },
          INVALIDATE_SESSIONS: {
            url: `${BASE_URL}/dashboard/users/admin/:id/invalidate-sessions`,
            method: "POST",
          },
          LOGOUT: {
            url: `${BASE_URL}/dashboard/users/admin/:id/logout`,
            method: "POST",
          },
          BLOCK: {
            url: `${BASE_URL}/dashboard/users/admin/:id/block`,
            method: "POST",
          },
          UNBLOCK: {
            url: `${BASE_URL}/dashboard/users/admin/:id/unblock`,
            method: "POST",
          },
        },
        CUSTOMERS: {
          GET_ALL: {
            url: `${BASE_URL}/dashboard/users/customers`,
            method: "GET",
          },
          GET_DETAILS: {
            url: `${BASE_URL}/dashboard/users/customers/:id`,
            method: "GET",
          },
          GET_PURCHASES: {
            url: `${BASE_URL}/dashboard/users/customers/:id/purchases`,
            method: "GET",
          },
          GET_REVIEWS: {
            url: `${BASE_URL}/dashboard/users/customers/:id/reviews`,
            method: "GET",
          },
          GET_STATS: {
            url: `${BASE_URL}/dashboard/users/customers/:id/stats`,
            method: "GET",
          },
          GET_DETAILED_STATS: {
            url: `${BASE_URL}/dashboard/users/customers/:id/detailed-stats`,
            method: "GET",
          },
          GET_ACTIVITY_LOG: {
            url: `${BASE_URL}/dashboard/users/customers/:id/activity-log`,
            method: "GET",
          },
          GET_MODE: {
            url: `${BASE_URL}/dashboard/users/customers/:id/mode`,
            method: "GET",
          },
          BLOCK: {
            url: `${BASE_URL}/dashboard/users/customers/:id/block`,
            method: "POST",
          },
          UNBLOCK: {
            url: `${BASE_URL}/dashboard/users/customers/:id/unblock`,
            method: "POST",
          },
          DELETE: {
            url: `${BASE_URL}/dashboard/users/customers/:id`,
            method: "DELETE",
          },
          TOGGLE_MODE: {
            url: `${BASE_URL}/dashboard/users/customers/:id/toggle`,
            method: "POST",
          },
          REFRESH_TOKEN: {
            url: `${BASE_URL}/dashboard/users/customers/:id/refresh-token`,
            method: "POST",
          },
          INVALIDATE_SESSIONS: {
            url: `${BASE_URL}/dashboard/users/customers/:id/invalidate-sessions`,
            method: "POST",
          },
          LOGOUT: {
            url: `${BASE_URL}/dashboard/users/customers/:id/logout`,
            method: "POST",
          },
        },
      },
    },
    VEHICLE_APPLICABILITY_GROUPS: {
      GET_ALL: {
        url: `${BASE_URL}/dashboard/vehicles/applicability-groups`,
        method: "GET",
      },
      GET_BY_ID: {
        url: `${BASE_URL}/dashboard/vehicles/applicability-groups/:id`,
        method: "GET",
      },
      CREATE: {
        url: `${BASE_URL}/dashboard/vehicles/applicability-groups`,
        method: "POST",
      },
      UPDATE: {
        url: `${BASE_URL}/dashboard/vehicles/applicability-groups/:id`,
        method: "PUT",
      },
      DELETE: {
        url: `${BASE_URL}/dashboard/vehicles/applicability-groups/:id`,
        method: "DELETE",
      },
    },
  },
};

export default ENDPOINTS;
