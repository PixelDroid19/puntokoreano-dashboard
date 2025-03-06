// src/services/users.service.ts
// @ts-nocheck
import { api } from "./auth.service";
import ENDPOINTS from "../api";
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
  static async toggleDevelopmentMode(userId: string): Promise<void> {
    try {
      const url =
        ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.TOGGLE_MODE.url.replace(
          ":id",
          userId
        );
      const response = await api.post(url);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getUserMode(userId: string): Promise<void> {
    try {
      const url =
        ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.GET_MODE.url.replace(
          ":id",
          userId
        );
      const response = await api.get(url);
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
      const { url } =
        params.userType === "admin"
          ? ENDPOINTS.DASHBOARD.ANALYTICS.USERS.ADMIN.GET_ALL
          : ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.GET_ALL;
      const response = await api.get(url, {
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
      const url =
        ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.GET_STATS.url.replace(
          ":id",
          userId
        );
      const response = await api.get(url);
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
      const url =
        ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.GET_PURCHASES.url.replace(
          ":id",
          userId
        );
      const response = await api.get(url, { params });
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
      const url =
        ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.GET_REVIEWS.url.replace(
          ":id",
          userId
        );
      const response = await api.get(url, { params });
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
      const { url } =
        userType === "admin"
          ? ENDPOINTS.DASHBOARD.ANALYTICS.USERS.ADMIN.CREATE
          : ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.CREATE;
      const response = await api.post(url, data);
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
          ? ENDPOINTS.DASHBOARD.ANALYTICS.USERS.ADMIN.UPDATE.url.replace(
              ":id",
              id
            )
          : ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.UPDATE.url.replace(
              ":id",
              id
            );
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
      // If active is true, unblock the user, otherwise block the user
      if (userType === "admin") {
        const url = active
          ? ENDPOINTS.DASHBOARD.ANALYTICS.USERS.ADMIN.UNBLOCK.url.replace(
              ":id",
              userId
            )
          : ENDPOINTS.DASHBOARD.ANALYTICS.USERS.ADMIN.BLOCK.url.replace(
              ":id",
              userId
            );
        await api.post(url, active ? {} : { reason: "Blocked by admin" });
      } else {
        const url = active
          ? ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.UNBLOCK.url.replace(
              ":id",
              userId
            )
          : ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.BLOCK.url.replace(
              ":id",
              userId
            );
        await api.post(url, active ? {} : { reason: "Blocked by admin" });
      }
    } catch (error) {
      return this.handleError(error);
    }
  }
  /**
   * Block user with reason
   */
  static async blockUser(userId: string, reason: string): Promise<void> {
    try {
      const url =
        ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.BLOCK.url.replace(
          ":id",
          userId
        );
      await api.post(url, { reason });
    } catch (error) {
      return this.handleError(error);
    }
  }
  /**
   * Unblock user
   */
  static async unblockUser(userId: string): Promise<void> {
    try {
      const url =
        ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.UNBLOCK.url.replace(
          ":id",
          userId
        );
      await api.post(url);
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
      const url =
        userType === "admin"
          ? ENDPOINTS.DASHBOARD.ANALYTICS.USERS.ADMIN.DELETE.url.replace(
              ":id",
              id
            )
          : ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.DELETE.url.replace(
              ":id",
              id
            );
      await api.delete(url, { params: options });
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
      const url =
        ENDPOINTS.DASHBOARD.ANALYTICS.USERS.ADMIN.UPDATE_PERMISSIONS.url.replace(
          ":id",
          userId
        );
      await api.patch(url, { permissions });
    } catch (error) {
      return this.handleError(error);
    }
  }
  /**
   * Refresh user access token
   */
  static async refreshToken(
    userId: string,
    userType: "admin" | "customer" = "customer"
  ): Promise<void> {
    try {
      const url =
        userType === "admin"
          ? ENDPOINTS.DASHBOARD.ANALYTICS.USERS.ADMIN.REFRESH_TOKEN.url.replace(
              ":id",
              userId
            )
          : ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.REFRESH_TOKEN.url.replace(
              ":id",
              userId
            );
      await api.post(url);
    } catch (error) {
      return this.handleError(error);
    }
  }
  /**
   * Invalidate all user sessions
   */
  static async invalidateSessions(
    userId: string,
    userType: "admin" | "customer" = "customer"
  ): Promise<void> {
    try {
      const url =
        userType === "admin"
          ? ENDPOINTS.DASHBOARD.ANALYTICS.USERS.ADMIN.INVALIDATE_SESSIONS.url.replace(
              ":id",
              userId
            )
          : ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.INVALIDATE_SESSIONS.url.replace(
              ":id",
              userId
            );
      await api.post(url);
    } catch (error) {
      return this.handleError(error);
    }
  }
  /**
   * Logout user from current session
   */
  static async logoutUser(userId: string, userType: "customer"): Promise<void> {
    try {
      const url =
        ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.LOGOUT.url.replace(
          ":id",
          userId
        );

      // Make the API call with empty data object to prevent potential undefined issues
      const res =  await api.post(url, {});
      console.log("Logout response:", res);
    } catch (error) {
      console.error("Logout error details:", error);
      // Use a more specific error message for logout failures
      const message =
        error.response?.data?.message || "Error during logout process";
      console.error("UsersService Logout Error:", message);
      throw new Error(message);
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
      const { url } = ENDPOINTS.DASHBOARD.ANALYTICS.USERS.BASE.VALIDATE_EMAIL;
      const response = await api.post(url, { email });
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
      const { url } =
        ENDPOINTS.DASHBOARD.ANALYTICS.USERS.BASE.VALIDATE_DOCUMENT;
      const response = await api.post(url, { type, number });
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
      const url =
        ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.GET_DETAILED_STATS.url.replace(
          ":id",
          userId
        );
      const response = await api.get(url);
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
      const url =
        ENDPOINTS.DASHBOARD.ANALYTICS.USERS.CUSTOMERS.GET_ACTIVITY_LOG.url.replace(
          ":id",
          userId
        );
      const response = await api.get(url, { params });
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
