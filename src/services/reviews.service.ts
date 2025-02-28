// src/services/reviews.service.ts
import { api } from "./auth.service";

export interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
    code: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  order?: {
    _id: string;
    order_number: string;
  };
  rating: number;
  title: string;
  content: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "received"
    | "cancelled"
    | "lost";
  purchase_verified: boolean;
  likes: {
    count: number;
    users: string[];
  };
  reported: {
    count: number;
    reasons: Array<{
      user: string;
      reason: string;
      date: string;
    }>;
  };
  moderation?: {
    moderatedBy: {
      _id: string;
      name: string;
    };
    moderatedAt: string;
    note: string;
  };
  images: Array<{
    url: string;
    approved: boolean;
  }>;
  helpful_votes: {
    positive: number;
    negative: number;
    users: Array<{
      user: string;
      vote: boolean;
      date: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  statusDistribution: {
    [key: string]: {
      count: number;
      avgRating: number;
    };
  };
  ratingDistribution: {
    [key: string]: number;
  };
  reported: number;
  overall: {
    avgRating: number;
    totalReviews: number;
    verifiedCount: number;
  };
  dailyTrend: Array<{
    _id: string;
    count: number;
    avgRating: number;
  }>;
}

class DashboardReviewsService {
  private static readonly BASE_URL = "/dashboard/reviews";

  /**
   * Obtiene todas las reviews con filtros
   */
  static async getReviews(params: {
    page?: number;
    limit?: number;
    status?: string;
    product?: string;
    rating?: number;
    reported?: boolean;
    verified?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    try {
      const { data } = await api.get(this.BASE_URL, { params });
      // @ts-ignore
      return data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener reviews"
      );
    }
  }

  /**
   * Obtiene estadísticas de las reviews
   */
  static async getReviewStats(): Promise<ReviewStats> {
    try {
      const { data } = await api.get(`${this.BASE_URL}/stats`);
      // @ts-ignore
      return data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener estadísticas"
      );
    }
  }

  /**
   * Modera una review
   */
  static async moderateReview(
    reviewId: string,
    moderationData: {
      status:
        | "pending"
        | "approved"
        | "rejected"
        | "received"
        | "cancelled"
        | "lost";
      moderationNote: string;
      approvedImageIds?: string[];
    }
  ) {
    try {
      const { data } = await api.patch(
        `${this.BASE_URL}/${reviewId}/moderate`,
        moderationData
      );
      // @ts-ignore
      return data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al moderar review"
      );
    }
  }

  static async updateReviewStatus(
    reviewId: string,
    statusData: {
      status: Review["status"];
      comment: string;
    }
  ) {
    try {
      const { data } = await api.patch(
        `${this.BASE_URL}/${reviewId}/status`,
        statusData
      );
      return data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error updating review status"
      );
    }
  }

  /**
   * Maneja una review reportada
   */
  static async handleReportedReview(
    reviewId: string,
    reportData: {
      action: "dismiss" | "remove";
      response: string;
    }
  ) {
    try {
      const { data } = await api.patch(
        `${this.BASE_URL}/${reviewId}/handle-report`,
        reportData
      );
      // @ts-ignore
      return data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al manejar reporte"
      );
    }
  }
}

export default DashboardReviewsService;
