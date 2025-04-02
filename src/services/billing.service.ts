// src/services/billing.service.ts

import {
  BillingSettingsUpdate,
  BillingSettingsResponse,
} from "../types/billing.types";
import { axiosInstance } from "../utils/axios-interceptor";

class BillingService {
  private static readonly BASE_URL = "/dashboard/settings/billing";

  /**
   * Get current billing settings
   */
  static async getSettings(): Promise<BillingSettingsResponse> {
    try {
      const response = await axiosInstance.get(this.BASE_URL);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error fetching billing settings"
      );
    }
  }

  /**
   * Update billing settings
   */
  static async updateSettings(
    settings: BillingSettingsUpdate
  ): Promise<BillingSettingsResponse> {
    try {
      const response = await axiosInstance.patch(this.BASE_URL, settings);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error updating billing settings"
      );
    }
  }

  /**
   * Validate settings before saving
   */
  static validateSettings(settings: BillingSettingsUpdate): string[] {
    const errors: string[] = [];

    if (settings.company_info) {
      const { email, tax_id, phone } = settings.company_info;

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Invalid company email format");
      }

      if (tax_id && !/^[0-9]{9}-[0-9]$/.test(tax_id)) {
        errors.push("Invalid tax ID format (should be: XXXXXXXXX-X)");
      }

      if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) {
        errors.push("Invalid phone number format");
      }
    }

    if (settings.invoice_settings) {
      const { start_number } = settings.invoice_settings;

      if (
        start_number &&
        (start_number < 1 || !Number.isInteger(start_number))
      ) {
        errors.push("Start number must be a positive integer");
      }
    }

    if (settings.tax_settings) {
      const { default_rate } = settings.tax_settings;

      if (default_rate && (default_rate < 0 || default_rate > 100)) {
        errors.push("Tax rate must be between 0 and 100");
      }
    }

    return errors;
  }
}

export default BillingService;
