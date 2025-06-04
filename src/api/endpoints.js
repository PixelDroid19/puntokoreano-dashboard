const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    RECOVER_PASSWORD: `${BASE_URL}/auth/recover-password`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
    VALIDATE_TOKEN: `${BASE_URL}/auth/validate-token`,
  },
  
  USERS: {
    BASE: `${BASE_URL}/dashboard/users`,
    ALL: `${BASE_URL}/dashboard/users/all`,
    CREATE: `${BASE_URL}/dashboard/users`,
    UPDATE: `${BASE_URL}/dashboard/users`,
    DELETE: `${BASE_URL}/dashboard/users`,
  },
  
  VEHICLES: {
    BASE: `${BASE_URL}/dashboard/vehicles`,
    ALL: `${BASE_URL}/dashboard/vehicles/all`,
    CREATE: `${BASE_URL}/dashboard/vehicles`,
    UPDATE: `${BASE_URL}/dashboard/vehicles`,
    DELETE: `${BASE_URL}/dashboard/vehicles`,
    BRANDS: `${BASE_URL}/dashboard/vehicles/brands`,
    FAMILIES: `${BASE_URL}/dashboard/vehicles/families`,
    MODELS: `${BASE_URL}/dashboard/vehicles/models`,
    LINES: `${BASE_URL}/dashboard/vehicles/lines`,
    TRANSMISSIONS: `${BASE_URL}/dashboard/vehicles/transmissions`,
    FUELS: `${BASE_URL}/dashboard/vehicles/fuels`,
    APPLICABILITY_GROUPS: `${BASE_URL}/dashboard/vehicles/applicability-groups`,
    
    // Endpoints para importación en lotes
    IMPORT_EXCEL: `${BASE_URL}/dashboard/vehicles/import`,
    DOWNLOAD_TEMPLATE: `${BASE_URL}/dashboard/vehicles/import/template`,
    IMPORT_STATUS: `${BASE_URL}/dashboard/vehicles/import/status`,
    IMPORT_QUEUE_STATS: `${BASE_URL}/dashboard/vehicles/import/queue/stats`
  },
  
  PRODUCTS: {
    BASE: `${BASE_URL}/dashboard/products`,
    ALL: `${BASE_URL}/dashboard/products/all`,
    CREATE: `${BASE_URL}/dashboard/products`,
    UPDATE: `${BASE_URL}/dashboard/products`,
    DELETE: `${BASE_URL}/dashboard/products`,
    CATEGORIES: `${BASE_URL}/dashboard/categories`,
    SUBCATEGORIES: `${BASE_URL}/dashboard/subcategories`,
    BRANDS: `${BASE_URL}/dashboard/brands`,
    EXPORT_EXCEL: `${BASE_URL}/dashboard/products/excel/export`,
    IMPORT_EXCEL: `${BASE_URL}/dashboard/products/excel/import`,
    DOWNLOAD_TEMPLATE: `${BASE_URL}/dashboard/products/excel/template`,
  },
  
  ORDERS: {
    BASE: `${BASE_URL}/dashboard/orders`,
    ALL: `${BASE_URL}/dashboard/orders/all`,
    CREATE: `${BASE_URL}/dashboard/orders`,
    UPDATE: `${BASE_URL}/dashboard/orders`,
    DELETE: `${BASE_URL}/dashboard/orders`,
    STATUS: `${BASE_URL}/dashboard/orders/status`,
  }
};

export default ENDPOINTS; 