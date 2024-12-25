// src/services/shipping.settings.service.ts
import ENDPOINTS from "../api";
import { ApiResponse, ShippingSettings } from "../api/types";
import { api } from "./auth.service";

class ShippingSettingsService {
  private static readonly BASE_URL = "/dashboard/shipping-settings";

  /**
   * Get all shipping settings
   */
  static async getSettings(): Promise<ShippingSettings> {
    try {
      const { url } = ENDPOINTS.DASHBOARD.SHIPPING_SETTINGS.GET_ALL;
      const response = await api.get<ApiResponse<ShippingSettings>>(url);
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
    standard_cost: number;
    express_cost: number;
  }): Promise<ApiResponse<ShippingSettings["base_costs"]>> {
    try {
      const { url } = ENDPOINTS.DASHBOARD.SHIPPING_SETTINGS.UPDATE_BASE_COSTS;
      const response = await api.patch<
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
      const response = await api.patch<
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
      const response = await api.patch<
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
      const response = await api.patch<
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
      const response = await api.patch<
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
   * Validate shipping settings
   */
  private static validateSettings(settings: Partial<ShippingSettings>): void {
    if (settings.base_costs) {
      if (settings.base_costs.standard < 0 || settings.base_costs.express < 0) {
        throw new Error("Los costos base no pueden ser negativos");
      }
    }

    if (settings.weight_rules) {
      if (
        settings.weight_rules.base_weight < 0 ||
        settings.weight_rules.extra_cost_per_kg < 0
      ) {
        throw new Error("Los valores de peso no pueden ser negativos");
      }
    }

    if (settings.delivery_times) {
      const { standard, express } = settings.delivery_times;
      if (standard.min > standard.max || express.min > express.max) {
        throw new Error("El tiempo mínimo no puede ser mayor al máximo");
      }
      if (
        standard.min < 0 ||
        express.min < 0 ||
        standard.max < 0 ||
        express.max < 0
      ) {
        throw new Error("Los tiempos de entrega no pueden ser negativos");
      }
    }

    if (settings.free_shipping_rules) {
      if (
        settings.free_shipping_rules.threshold < 0 ||
        settings.free_shipping_rules.min_purchase < 0
      ) {
        throw new Error("Los montos no pueden ser negativos");
      }
    }
  }

  /**
   * Calculate shipping cost
   */
  static calculateShippingCost(
    weight: number,
    location: string,
    method: "standard" | "express",
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
