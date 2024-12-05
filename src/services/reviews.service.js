// src/services/reviews.service.ts
import { api } from "./auth.service";
class DashboardReviewsService {
    /**
     * Obtiene todas las reviews con filtros
     */
    static async getReviews(params) {
        try {
            const { data } = await api.get(this.BASE_URL, { params });
            return data.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || "Error al obtener reviews");
        }
    }
    /**
     * Obtiene estadísticas de las reviews
     */
    static async getReviewStats() {
        try {
            const { data } = await api.get(`${this.BASE_URL}/stats`);
            return data.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || "Error al obtener estadísticas");
        }
    }
    /**
     * Modera una review
     */
    static async moderateReview(reviewId, moderationData) {
        try {
            const { data } = await api.patch(`${this.BASE_URL}/${reviewId}/moderate`, moderationData);
            return data.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || "Error al moderar review");
        }
    }
    /**
     * Maneja una review reportada
     */
    static async handleReportedReview(reviewId, reportData) {
        try {
            const { data } = await api.patch(`${this.BASE_URL}/${reviewId}/handle-report`, reportData);
            return data.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.message || "Error al manejar reporte");
        }
    }
}
Object.defineProperty(DashboardReviewsService, "BASE_URL", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "/dashboard/reviews"
});
export default DashboardReviewsService;
