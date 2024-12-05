// src/services/users.service.ts
import { api } from "./auth.service";
class UsersService {
    /**
     * Generic error handler for service requests
     */
    static handleError(error) {
        const message = error.response?.data?.message || "An error occurred";
        console.error("UsersService Error:", message);
        throw new Error(message);
    }
    /**
     * Get users based on type and filters
     */
    static async getUsers(params = {}) {
        try {
            const endpoint = this.getUsersEndpoint(params.userType);
            const response = await api.get(endpoint, {
                params: this.formatParams(params),
            });
            return response.data;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Get user statistics
     */
    static async getUserStats(userId) {
        try {
            const response = await api.get(`${this.CUSTOMERS_URL}/${userId}/stats`);
            return response.data.data;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Get user purchases with pagination
     */
    static async getUserPurchases(userId, params = {}) {
        try {
            const response = await api.get(`${this.CUSTOMERS_URL}/${userId}/purchases`, { params });
            return response.data.data;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Get user reviews with pagination
     */
    static async getUserReviews(userId, params = {}) {
        try {
            const response = await api.get(`${this.CUSTOMERS_URL}/${userId}/reviews`, { params });
            return response.data.data;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Create a new user (admin or customer)
     */
    static async createUser(data, userType) {
        try {
            const endpoint = userType === "admin" ? this.ADMIN_URL : this.CUSTOMERS_URL;
            const response = await api.post(endpoint, data);
            return response.data.data;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Update existing user
     */
    static async updateUser(id, data, userType) {
        try {
            const endpoint = userType === "admin"
                ? `${this.ADMIN_URL}/${id}`
                : `${this.CUSTOMERS_URL}/${id}`;
            const response = await api.patch(endpoint, data);
            return response.data.data;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Toggle user status (active/inactive)
     */
    static async toggleStatus(userId, active, userType) {
        try {
            const endpoint = userType === "admin"
                ? `${this.ADMIN_URL}/${userId}/status`
                : `${this.CUSTOMERS_URL}/${userId}/status`;
            await api.patch(endpoint, { active });
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Block user with reason
     */
    static async blockUser(userId, reason) {
        try {
            await api.post(`${this.CUSTOMERS_URL}/${userId}/block`, { reason });
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Unblock user
     */
    static async unblockUser(userId) {
        try {
            await api.post(`${this.CUSTOMERS_URL}/${userId}/unblock`);
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Delete user with optional data transfer
     */
    static async deleteUser(id, userType, options = {}) {
        try {
            const endpoint = userType === "admin"
                ? `${this.ADMIN_URL}/${id}`
                : `${this.CUSTOMERS_URL}/${id}`;
            await api.delete(endpoint, { params: options });
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Update user permissions (admin only)
     */
    static async updatePermissions(userId, permissions) {
        try {
            await api.patch(`${this.ADMIN_URL}/${userId}/permissions`, {
                permissions,
            });
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Create admin user
     */
    static async createAdminUser(data) {
        return this.createUser(data, "admin");
    }
    /**
     * Create customer user
     */
    static async createCustomerUser(data) {
        return this.createUser(data, "customer");
    }
    /**
     * Update admin user
     */
    static async updateAdminUser(id, data) {
        return this.updateUser(id, data, "admin");
    }
    /**
     * Update customer user
     */
    static async updateCustomerUser(id, data) {
        return this.updateUser(id, data, "customer");
    }
    /**
     * Delete admin user
     */
    static async deleteAdminUser(id) {
        return this.deleteUser(id, "admin");
    }
    /**
     * Delete customer user
     */
    static async deleteCustomer(id, options) {
        return this.deleteUser(id, "customer", options);
    }
    // Private helper methods
    static getUsersEndpoint(userType) {
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
    static async validateEmail(email) {
        try {
            const response = await api.post(`${this.BASE_URL}/validate-email`, {
                email,
            });
            return response.data.exists;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
    * Validar si existe un documento
    */
    static async validateDocument(type, number) {
        try {
            const response = await api.post(`${this.BASE_URL}/validate-document`, {
                type,
                number,
            });
            return response.data.exists;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Obtener estadísticas detalladas del usuario
     */
    static async getUserDetailedStats(userId) {
        try {
            const response = await api.get(`${this.CUSTOMERS_URL}/${userId}/detailed-stats`);
            return response.data.data;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Obtener historial de actividad del usuario
     */
    static async getUserActivityLog(userId, params = {}) {
        try {
            const response = await api.get(`${this.CUSTOMERS_URL}/${userId}/activity-log`, { params });
            return response.data.data;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    static formatParams(params) {
        const formattedParams = { ...params };
        delete formattedParams.userType;
        return formattedParams;
    }
}
Object.defineProperty(UsersService, "BASE_URL", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "/dashboard/users"
});
Object.defineProperty(UsersService, "ADMIN_URL", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: `${UsersService.BASE_URL}/admin`
});
Object.defineProperty(UsersService, "CUSTOMERS_URL", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: `${UsersService.BASE_URL}/customers`
});
export default UsersService;
