import { Endpoints } from "./types";

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
        method: "DELETE"  
      },
      UPLOAD_IMAGE: {
        url: `${BASE_URL}/dashboard/categories/upload-image`, 
        method: "POST"
      }
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
        UPLOAD: {
          url: `${BASE_URL}/dashboard/upload`,
          method: "POST",
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
        url: `${BASE_URL}/dashboard/files/groups`,
        method: "PATCH",
      },
      DELETE_GROUP: {
        url: `${BASE_URL}/dashboard/files/groups`,
        method: "DELETE",
      },
      ADD_IMAGES: {
        url: `${BASE_URL}/dashboard/files/groups`,
        method: "POST",
      },
      DELETE_IMAGE: {
        url: `${BASE_URL}/dashboard/files/groups`,
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
        },
      },
    },
  },
};

export default ENDPOINTS;
