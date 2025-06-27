// src/services/shipping.settings.service.ts
import ENDPOINTS from "../api";
import { ApiResponse, ShippingSettings } from "../api/types";
import { axiosInstance } from "../utils/axios-interceptor";

class ShippingSettingsService {
  /**
   * Get all shipping settings
   */
  static async getSettings(): Promise<ShippingSettings> {
    try {
      const { url } = ENDPOINTS.DASHBOARD.SHIPPING_SETTINGS.GET_ALL;
      const response = await axiosInstance.get<ApiResponse<ShippingSettings>>(url);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error al obtener la configuración de envíos"
      );
    }
  }

  /**
   * Update base shipping costs
   */
  static async updateBaseCosts(data: {
    pickup_cost: number;
    cod_cost: number;
  }): Promise<ApiResponse<ShippingSettings["base_costs"]>> {
    try {
      const { url } = ENDPOINTS.DASHBOARD.SHIPPING_SETTINGS.UPDATE_BASE_COSTS;
      const response = await axiosInstance.patch<
        ApiResponse<ShippingSettings["base_costs"]>
      >(url, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar los costos base"
      );
    }
  }

  /**
   * Update weight-based rules
   */
  static async updateWeightRules(data: {
    base_weight: number;
    extra_cost_per_kg: number;
  }): Promise<ApiResponse<ShippingSettings["weight_rules"]>> {
    try {
      const { url } = ENDPOINTS.DASHBOARD.SHIPPING_SETTINGS.UPDATE_WEIGHT_RULES;
      const response = await axiosInstance.patch<
        ApiResponse<ShippingSettings["weight_rules"]>
      >(url, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error al actualizar las reglas de peso"
      );
    }
  }

  /**
   * Update location multipliers
   */
  static async updateLocationMultipliers(data: {
    multipliers: Record<string, number>;
  }): Promise<ApiResponse<ShippingSettings["location_multipliers"]>> {
    try {
      const { url } =
        ENDPOINTS.DASHBOARD.SHIPPING_SETTINGS.UPDATE_LOCATION_MULTIPLIERS;
      const response = await axiosInstance.patch<
        ApiResponse<ShippingSettings["location_multipliers"]>
      >(url, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error al actualizar los multiplicadores por ubicación"
      );
    }
  }

  /**
   * Update delivery time estimates
   */
  static async updateDeliveryTimes(data: {
    delivery_times: ShippingSettings["delivery_times"];
  }): Promise<ApiResponse<ShippingSettings["delivery_times"]>> {
    try {
      const { url } =
        ENDPOINTS.DASHBOARD.SHIPPING_SETTINGS.UPDATE_DELIVERY_TIMES;
      const response = await axiosInstance.patch<
        ApiResponse<ShippingSettings["delivery_times"]>
      >(url, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error al actualizar los tiempos de entrega"
      );
    }
  }

  /**
   * Update free shipping rules
   */
  static async updateFreeShipping(
    data: ShippingSettings["free_shipping_rules"]
  ): Promise<ApiResponse<ShippingSettings["free_shipping_rules"]>> {
    try {
      const { url } =
        ENDPOINTS.DASHBOARD.SHIPPING_SETTINGS.UPDATE_FREE_SHIPPING;
      const response = await axiosInstance.patch<
        ApiResponse<ShippingSettings["free_shipping_rules"]>
      >(url, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error al actualizar las reglas de envío gratis"
      );
    }
  }

  /**
   * 🆕 Get processing fees configuration
   */
  static async getProcessingFees(): Promise<any> {
    try {
      const { url } = ENDPOINTS.DASHBOARD.SHIPPING_SETTINGS.GET_PROCESSING_FEES;
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error al obtener la configuración de cuotas de procesamiento"
      );
    }
  }

  /**
   * 🆕 Update processing fees configuration
   */
  static async updateProcessingFees(data: any): Promise<any> {
    try {
      const { url } = ENDPOINTS.DASHBOARD.SHIPPING_SETTINGS.UPDATE_PROCESSING_FEES;
      const response = await axiosInstance.patch(url, {
        processing_fees: data
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error al actualizar las cuotas de procesamiento"
      );
    }
  }

  /**
   * 🆕 Toggle processing fees (enable/disable)
   */
  static async toggleProcessingFees(enabled: boolean): Promise<any> {
    try {
      const { url } = ENDPOINTS.DASHBOARD.SHIPPING_SETTINGS.TOGGLE_PROCESSING_FEES;
      const response = await axiosInstance.patch(url, {
        enabled
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error al cambiar el estado de las cuotas de procesamiento"
      );
    }
  }

  /**
   * Calculate shipping cost
   */
  static calculateShippingCost(
    weight: number,
    location: string,
    method: "pickup" | "cod",
    orderTotal: number,
    settings: ShippingSettings
  ): number {
    try {
      // Check if order qualifies for free shipping
      if (this.checkFreeShipping(orderTotal, location, method, settings)) {
        return 0;
      }

      // Get base cost for shipping method
      const baseCost = settings.base_costs[method];

      // Calculate extra cost for weight
      let weightCost = 0;
      if (weight > settings.weight_rules.base_weight) {
        const extraWeight = weight - settings.weight_rules.base_weight;
        weightCost = extraWeight * settings.weight_rules.extra_cost_per_kg;
      }

      // Get location multiplier (default if location not found)
      const multiplier =
        settings.location_multipliers[location] ||
        settings.location_multipliers.default ||
        1;

      // Calculate total cost
      const totalCost = (baseCost + weightCost) * multiplier;

      return Math.round(totalCost); // Round to nearest peso
    } catch (error) {
      console.error("Error calculating shipping cost:", error);
      throw error;
    }
  }

  /**
   * Check if order qualifies for free shipping
   */
  private static checkFreeShipping(
    orderTotal: number,
    location: string,
    method: string,
    settings: ShippingSettings
  ): boolean {
    const rules = settings.free_shipping_rules;

    return (
      orderTotal >= rules.threshold &&
      orderTotal >= rules.min_purchase &&
      rules.eligible_locations.includes(location) &&
      rules.eligible_methods.includes(method)
    );
  }
}

export default ShippingSettingsService;
