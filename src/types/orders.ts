// src/types/orders.ts
export interface OrderItem {
    product: {
      id: string;
      name: string;
      code: string;
    };
    quantity: number;
    price: number;
  }
  
  export interface Order {
    id: string;
    order_number: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    items: OrderItem[];
    status: OrderStatus;
    total: number;
    created_at: string;
    status_history: OrderStatusHistory[];
  }
  
  export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'cancelled'
    | 'refunded';
  
  export interface OrderStatusHistory {
    status: OrderStatus;
    comment?: string;
    date: string;
  }
  
  export interface OrderStatusUpdate {
    status: OrderStatus;
    comment?: string;
    tracking_number?: string;
  }
  
  // src/types/config.ts
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