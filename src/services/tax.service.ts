import { axiosInstance } from "../utils/axios-interceptor";

interface TaxSettings {
  default_rate: number;
  tax_name: string;
  tax_id_label: string;
}

interface TaxCalculation {
  rate: number;
  amount: number;
  taxName: string;
  subtotal: number;
  total: number;
}

class TaxService {
  /**
   * Obtener configuración de impuestos
   */
  static async getSettings(): Promise<{ success: boolean; data: TaxSettings }> {
    try {
      const response = await axiosInstance.get("/dashboard/settings/tax");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching tax settings:", error);
      throw new Error(error.response?.data?.message || "Error al obtener configuración de impuestos");
    }
  }

  /**
   * Actualizar configuración de impuestos
   */
  static async updateSettings(settings: Partial<TaxSettings>): Promise<{ success: boolean; data: TaxSettings }> {
    try {
      const response = await axiosInstance.patch("/dashboard/settings/tax", settings);
      return response.data;
    } catch (error: any) {
      console.error("Error updating tax settings:", error);
      throw new Error(error.response?.data?.message || "Error al actualizar configuración de impuestos");
    }
  }

  /**
   * Calcular impuesto basado en subtotal
   */
  static calculateTax(subtotal: number, rate: number, taxName: string = "IVA"): TaxCalculation {
    const amount = subtotal * (rate / 100);
    return {
      rate,
      amount,
      taxName,
      subtotal,
      total: subtotal + amount
    };
  }

  /**
   * Formatear información de impuesto para mostrar
   */
  static formatTaxInfo(amount: number, rate: number, taxName: string = "IVA"): string {
    return `${taxName} (${rate}%): $${amount.toLocaleString('es-CO')}`;
  }

  /**
   * Validar si una tasa es válida
   */
  static isValidRate(rate: number): boolean {
    return typeof rate === 'number' && rate >= 0 && rate <= 100;
  }

  /**
   * Obtener valores por defecto
   */
  static getDefaultSettings(): TaxSettings {
    return {
      default_rate: 19,
      tax_name: "IVA",
      tax_id_label: "NIT"
    };
  }

  /**
   * Validar configuración de impuestos
   */
  static validateSettings(settings: Partial<TaxSettings>): string[] {
    const errors: string[] = [];

    if (settings.default_rate !== undefined) {
      if (!this.isValidRate(settings.default_rate)) {
        errors.push("La tasa de impuesto debe estar entre 0 y 100");
      }
    }

    if (settings.tax_name !== undefined) {
      if (!settings.tax_name || settings.tax_name.trim().length < 1) {
        errors.push("El nombre del impuesto es requerido");
      }
    }

    if (settings.tax_id_label !== undefined) {
      if (!settings.tax_id_label || settings.tax_id_label.trim().length < 1) {
        errors.push("La etiqueta del ID fiscal es requerida");
      }
    }

    return errors;
  }
}

export default TaxService;
export type { TaxSettings, TaxCalculation }; 