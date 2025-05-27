export interface ApiEndpoint {
  url: string;
  method: string;
}

export interface Endpoints {
  AUTH: {
    LOGIN: ApiEndpoint;
    CHECK_SESSION: ApiEndpoint;
    REFRESH_TOKEN: ApiEndpoint;
    LOGOUT: ApiEndpoint;
  };
  PRODUCTS: {
    PRODUCT_DETAIL: ApiEndpoint;
    GET_ALL: ApiEndpoint;
    SEARCH: ApiEndpoint;
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
    GET_BRANDS: ApiEndpoint;
    CREATE_BRAND: ApiEndpoint;
    UPDATE_BRAND: ApiEndpoint;
    DELETE_BRAND: ApiEndpoint;
    GET_FAMILIES: ApiEndpoint;
    CREATE_FAMILY: ApiEndpoint;
    GET_MODELS: ApiEndpoint;
    CREATE_MODEL: ApiEndpoint;
    GET_TRANSMISSIONS: ApiEndpoint;
    CREATE_TRANSMISSION: ApiEndpoint;
    GET_FUELS: ApiEndpoint;
    CREATE_FUEL: ApiEndpoint;
    GET_LINES: ApiEndpoint;
    CREATE_LINE: ApiEndpoint;
  };
  DASHBOARD: {
    CATEGORIES: {
      GET_ALL: ApiEndpoint;
      CREATE: ApiEndpoint;
      UPDATE: ApiEndpoint;
      DELETE: ApiEndpoint;
      UPLOAD_IMAGE: ApiEndpoint;
    };
    DISCOUNTS: {
      APPLY: ApiEndpoint;
      REMOVE: ApiEndpoint;
      GET_HISTORY: ApiEndpoint;
      BULK_APPLY: ApiEndpoint;
      GET_ANALYTICS: ApiEndpoint;
    };
    SETTINGS: {
      GET: ApiEndpoint;
      SEO: {
        UPDATE: ApiEndpoint;
      };
      HIGHLIGHTED_SERVICES: {
        GET_ALL: ApiEndpoint;
        CREATE: ApiEndpoint;
        UPDATE: ApiEndpoint;
        DELETE: ApiEndpoint;
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
    };
    BRAND: {
      CREATE: ApiEndpoint;
      GET_ALL: ApiEndpoint;
      UPDATE: ApiEndpoint;
      DELETE: ApiEndpoint;
      ASSOCIATE_BLOG: ApiEndpoint;
      DISSOCIATE_BLOG: ApiEndpoint;
    };
    PRODUCTS: {
      CREATE: ApiEndpoint;
      GET_ALL: ApiEndpoint;
      GET_BY_ID: ApiEndpoint;
      UPDATE: ApiEndpoint;
      DELETE: ApiEndpoint;
      EXPORT_EXCEL: ApiEndpoint;
      IMPORT_EXCEL: ApiEndpoint;
      DOWNLOAD_TEMPLATE: ApiEndpoint;
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
    BLOG_CATEGORIES: {
      GET_ALL: ApiEndpoint;
      GET_ONE: ApiEndpoint;
      CREATE: ApiEndpoint;
      UPDATE: ApiEndpoint;
      DELETE: ApiEndpoint;
    };
    BLOG_TAGS: {
      GET_ALL: ApiEndpoint;
      GET_ONE: ApiEndpoint;
      CREATE: ApiEndpoint;
      UPDATE: ApiEndpoint;
      DELETE: ApiEndpoint;
    };
    FILTERS: {
      CREATE: ApiEndpoint;
      GET_ALL: ApiEndpoint;
      GET_BY_ID: ApiEndpoint;
      UPDATE: ApiEndpoint;
      DELETE: ApiEndpoint;
      UPDATE_SECTION: ApiEndpoint;
      GET_SECTION: ApiEndpoint;
    };
    FILES: {
      CREATE_GROUP: ApiEndpoint;
      GET_GROUPS: ApiEndpoint;
      UPDATE_GROUP: ApiEndpoint;
      DELETE_GROUP: ApiEndpoint;
      DELETE_THUMB: ApiEndpoint;
      DELETE_CAROUSEL_IMAGE: ApiEndpoint;
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
          GET_DETAILS: ApiEndpoint;
          GET_PURCHASES: ApiEndpoint;
          GET_REVIEWS: ApiEndpoint;
          GET_STATS: ApiEndpoint;
          GET_DETAILED_STATS: ApiEndpoint;
          GET_ACTIVITY_LOG: ApiEndpoint;
          GET_MODE: ApiEndpoint;
          BLOCK: ApiEndpoint;
          UNBLOCK: ApiEndpoint;
          DELETE: ApiEndpoint;
          TOGGLE_MODE: ApiEndpoint;
          REFRESH_TOKEN: ApiEndpoint;
          INVALIDATE_SESSIONS: ApiEndpoint;
          LOGOUT: ApiEndpoint;
          CREATE: ApiEndpoint;
          UPDATE: ApiEndpoint;
        };
      };
    };
  };
}; 