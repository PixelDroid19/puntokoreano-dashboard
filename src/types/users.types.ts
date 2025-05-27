// src/types/users.types.ts

// Base interfaces
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  isDevelopment?: boolean;
  createdAt: string;
  updatedAt: string;
  last_login?: string;
  permissions?: Record<string, any>;
  phone?: string;
  document_type?: string;
  document_number?: string;
}

export interface UserPurchase {
  _id: string;
  tracking_number: string;
  items: {
    product: {
      _id: string;
      name: string;
      price: number;
      images: string[];
    };
    quantity: number;
    price: number;
  }[];
  total: number;
  status: string;
  createdAt: string;
}

export interface UserReview {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  rating: number;
  original_content: {
    content: string;
  };
  createdAt: string;
}

export interface UserStats {
  overview: {
    accountAge: {
      days: number;
      createdAt: string;
    };
    lastLogin: string | null;
    status: string;
    verificationStatus: {
      email: boolean;
      phone: boolean;
    };
  };
  orders: {
    total: number;
    totalSpent: number;
    avgOrderValue: number;
    lastOrderDate: string | null;
    totalItems: number;
    minOrderValue: number;
    maxOrderValue: number;
    statusDistribution: Record<string, number>;
    recentOrders: {
      id: string;
      orderNumber: string;
      date: string;
      total: number;
      status: string;
      items: number;
    }[];
  };
  reviews: {
    total: number;
    avgRating: number;
    distribution: Record<string, number>;
    positive: number;
    negative: number;
  };
  cart: {
    itemCount: number;
    total: number;
    items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      total: number;
      image: string | null;
    }[];
  };
  wishlist: {
    itemCount: number;
    items: {
      id: string;
      name: string;
      price: number;
      image: string | null;
      addedAt: string;
    }[];
  };
  popularProducts: {
    id: string;
    name: string;
    totalQuantity: number;
    totalSpent: number;
    purchaseCount: number;
    image: string | null;
  }[];
  recentActivity: {
    type: string;
    date: string;
    device: string;
    ip: string;
  }[];
}

// Create & Update Data interfaces
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  permissions?: string[];
  phone?: string;
  document_type?: string;
  document_number?: string;
  userType?: 'dashboard' | 'ecommerce';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  permissions?: string[];
  phone?: string;
  document_type?: string;
  document_number?: string;
  active?: boolean;
}

// Response interfaces
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Additional interfaces for extended functionality
export interface UserPayment {
  id: string;
  amount: number;
  method: string;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: string;
  orderId?: string;
}

export interface UserNotification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export interface UserLoginHistory {
  id: string;
  ip: string;
  userAgent: string;
  location?: string;
  status: "success" | "failed";
  createdAt: string;
}

// Enums
export enum UserType {
  ALL = "all",
  ADMIN = "admin",
  CUSTOMER = "customer",
}
