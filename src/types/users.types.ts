// src/types/users.types.ts

// Base interfaces
export interface User {
  _id: string;
  name: string;
  email: string;
  role?: "admin" | "customer";
  active: boolean;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPurchase {
  orderId: string;
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
}

export interface UserReview {
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  averagePurchase: number;
  totalReviews: number;
  averageRating?: number;
  lastPurchaseDate?: string;
  wishlistItems?: number;
  loginCount?: number;
  lastLoginDate?: string;
}

// Create & Update Data interfaces
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  permissions?: string[];
  role?: "admin" | "customer";
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  permissions?: string[];
  active?: boolean;
}

// Response interfaces
export interface PaginatedResponse<T> {
  data: T[];
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
