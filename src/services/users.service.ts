// src/services/users.service.ts
// @ts-nocheck
import { api } from "./auth.service";
import {
  User,
  UserPurchase,
  UserReview,
  UserStats,
  CreateUserData,
  UpdateUserData,
  PaginatedResponse,
} from "../types/users.types";

interface GetUsersParams {
  userType?: "admin" | "customer" | "all";
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface UserResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  };
}

class UsersService {
  private static readonly BASE_URL = "/dashboard/users";
  private static readonly ADMIN_URL = `${UsersService.BASE_URL}/admin`;
  private static readonly CUSTOMERS_URL = `${UsersService.BASE_URL}/customers`;

  static async toggleDevelopmentMode(userId: string): Promise<void> {
    try {
      const response = await api.post(`${this.CUSTOMERS_URL}/${userId}/toggle`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getUserMode(userId: string): Promise<void> {
    try {
      const response = await api.get(`${this.CUSTOMERS_URL}/${userId}/mode`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generic error handler for service requests
   */
  private static handleError(error: any): never {
    const message = error.response?.data?.message || "An error occurred";
    console.error("UsersService Error:", message);
    throw new Error(message);
  }

  /**
   * Get users based on type and filters
   */
  static async getUsers(params: GetUsersParams = {}): Promise<UserResponse> {
    try {
      const endpoint = this.getUsersEndpoint(params.userType);
      const response = await api.get(endpoint, {
        params: this.formatParams(params),
      });

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      const response = await api.get(`${this.CUSTOMERS_URL}/${userId}/stats`);

      return response.data.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user purchases with pagination
   */
  static async getUserPurchases(
    userId: string,
    params: { page?: number; limit?: number; status?: string } = {}
  ): Promise<PaginatedResponse<UserPurchase>> {
    try {
      const response = await api.get(
        `${this.CUSTOMERS_URL}/${userId}/purchases`,
        { params }
      );

      return response.data.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user reviews with pagination
   */
  static async getUserReviews(
    userId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<UserReview>> {
    try {
      const response = await api.get(
        `${this.CUSTOMERS_URL}/${userId}/reviews`,
        { params }
      );

      return response.data.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create a new user (admin or customer)
   */
  static async createUser(
    data: CreateUserData,
    userType: "admin" | "customer"
  ): Promise<User> {
    try {
      const endpoint =
        userType === "admin" ? this.ADMIN_URL : this.CUSTOMERS_URL;
      const response = await api.post(endpoint, data);

      return response.data.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update existing user
   */
  static async updateUser(
    id: string,
    data: UpdateUserData,
    userType: "admin" | "customer"
  ): Promise<User> {
    try {
      const endpoint =
        userType === "admin"
          ? `${this.ADMIN_URL}/${id}`
          : `${this.CUSTOMERS_URL}/${id}`;
      const response = await api.patch(endpoint, data);
      return response.data.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Toggle user status (active/inactive)
   */
  static async toggleStatus(
    userId: string,
    active: boolean,
    userType: string
  ): Promise<void> {
    try {
      const endpoint =
        userType === "admin"
          ? `${this.ADMIN_URL}/${userId}/status`
          : `${this.CUSTOMERS_URL}/${userId}/status`;
      await api.patch(endpoint, { active });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Block user with reason
   */
  static async blockUser(userId: string, reason: string): Promise<void> {
    try {
      await api.post(`${this.CUSTOMERS_URL}/${userId}/block`, { reason });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Unblock user
   */
  static async unblockUser(userId: string): Promise<void> {
    try {
      await api.post(`${this.CUSTOMERS_URL}/${userId}/unblock`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete user with optional data transfer
   */
  static async deleteUser(
    id: string,
    userType: "admin" | "customer",
    options: { transferDataTo?: string; hardDelete?: boolean } = {}
  ): Promise<void> {
    try {
      const endpoint =
        userType === "admin"
          ? `${this.ADMIN_URL}/${id}`
          : `${this.CUSTOMERS_URL}/${id}`;
      await api.delete(endpoint, { params: options });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update user permissions (admin only)
   */
  static async updatePermissions(
    userId: string,
    permissions: string[]
  ): Promise<void> {
    try {
      await api.patch(`${this.ADMIN_URL}/${userId}/permissions`, {
        permissions,
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create admin user
   */
  static async createAdminUser(data: CreateUserData): Promise<User> {
    return this.createUser(data, "admin");
  }

  /**
   * Create customer user
   */
  static async createCustomerUser(data: CreateUserData): Promise<User> {
    return this.createUser(data, "customer");
  }

  /**
   * Update admin user
   */
  static async updateAdminUser(
    id: string,
    data: UpdateUserData
  ): Promise<User> {
    return this.updateUser(id, data, "admin");
  }

  /**
   * Update customer user
   */
  static async updateCustomerUser(
    id: string,
    data: UpdateUserData
  ): Promise<User> {
    return this.updateUser(id, data, "customer");
  }

  /**
   * Delete admin user
   */
  static async deleteAdminUser(id: string): Promise<void> {
    return this.deleteUser(id, "admin");
  }

  /**
   * Delete customer user
   */
  static async deleteCustomer(
    id: string,
    options?: { transferDataTo?: string; hardDelete?: boolean }
  ): Promise<void> {
    return this.deleteUser(id, "customer", options);
  }

  // Private helper methods
  private static getUsersEndpoint(userType?: string): string {
    switch (userType) {
      case "admin":
        return this.ADMIN_URL;
      case "customer":
        return this.CUSTOMERS_URL;
      default:
        return this.BASE_URL;
    }
  }

  /**
   * Validar si existe un email
   */
  static async validateEmail(email: string): Promise<boolean> {
    try {
      const response = await api.post(`${this.BASE_URL}/validate-email`, {
        email,
      });
      return response.data.exists;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Validar si existe un documento
   */
  static async validateDocument(
    type: string,
    number: string
  ): Promise<boolean> {
    try {
      const response = await api.post(`${this.BASE_URL}/validate-document`, {
        type,
        number,
      });

      return response.data.exists;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Obtener estadísticas detalladas del usuario
   */
  static async getUserDetailedStats(
    userId: string
  ): Promise<DetailedUserStats> {
    try {
      const response = await api.get(
        `${this.CUSTOMERS_URL}/${userId}/detailed-stats`
      );

      return response.data.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Obtener historial de actividad del usuario
   */
  static async getUserActivityLog(
    userId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<UserActivity>> {
    try {
      const response = await api.get(
        `${this.CUSTOMERS_URL}/${userId}/activity-log`,
        { params }
      );
      return response.data.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private static formatParams(params: GetUsersParams) {
    const formattedParams = { ...params };
    delete formattedParams.userType;
    return formattedParams;
  }
}

export default UsersService;
