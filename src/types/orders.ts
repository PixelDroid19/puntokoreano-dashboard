// src/types/orders.ts

export interface OrderItem {
  product: {
    id: string;
    name: string;
    code: string;
    price: number;
  };
  quantity: number;
  total: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  payment: OrderPayment;
  shipping: OrderShipping;
  items: OrderItem[];
  status: OrderStatus;
  dates: {
    created: string;
    updated: string;
  };
  status_history?: OrderStatusHistory[];
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus = 
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface OrderStatusHistory {
  status: OrderStatus;
  date: string;
  comment?: string;
  updated_by?: {
    name: string;
    email: string;
  };
}
export interface OrderPayment {
  status: PaymentStatus;
  method: string;
  total: number;
  transaction_id?: string;
  isDevelopment?: boolean;
}

export interface OrderShipping {
  method: string;
  tracking_number?: string;
  tracking?: string; // Para compatibilidad
  status: string;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  tracking_number?: string;
  comment?: string;
}

export interface SiteConfig {
  seo: SeoConfig;
  contact: ContactConfig;
  payment: PaymentConfig;
  shipping: ShippingConfig;
}

export interface SeoConfig {
  global: {
    title: string;
    description: string;
    keywords?: string[];
  };
  social?: {
    og_title?: string;
    og_description?: string;
  };
}

export interface ContactConfig {
  email: string;
  phone: string;
}

export interface PaymentConfig {
  payment_methods: PaymentMethod[];
  currencies: Currency[];
  tax_rate: number;
}

export interface ShippingConfig {
  methods: ShippingMethod[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

// src/types/response.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    perPage: number;
  };
}
