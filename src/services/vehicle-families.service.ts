// src/services/vehicle-families.service.ts
import axios from "axios";
import { BASE_URL } from "../api";

// Types for the API responses
export interface FamilyItem {
  name: string;
  id: string;
}

export interface OptionItem {
  label: string;
  value: string;
}

export interface VehicleData {
  family: string;
  model: string;
  transmission: string;
  fuel: string;
  line: string;
  year: string;
  productData: any; // This could be more specific based on your product structure
}

export interface BulkVehicleData {
  family: string;
  model: string;
  transmissions: OptionItem[];
  fuel: string;
  line: string;
  years: string[];
  productData: any;
}

export interface VehicleImportResult {
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors: string[];
}

export interface VehicleSearchCriteria {
  family?: string;
  model?: string;
  transmission?: string;
  fuel?: string;
  line?: string;
  year?: string;
  keyword?: string;
}

class VehicleFamiliesService {
  private static getToken(): string {
    return localStorage.getItem("auth_dashboard_token") || "";
  }

  private static getHeaders() {
    return {
      Authorization: `Bearer ${this.getToken()}`,
      "Content-Type": "application/json",
    };
  }

  // GET /vehicles - Obtiene todos los vehículos registrados
  static async getVehicles(): Promise<any[]> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles`,
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener los vehículos"
        );
      }
      throw error;
    }
  }

  // GET /families - Obtiene todas las familias de vehículos
  static async getFamilies(): Promise<FamilyItem[]> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/families`,
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener las familias de vehículos"
        );
      }
      throw error;
    }
  }

  // GET /families/:familyName/models - Obtiene modelos por familia
  static async getModelsByFamily(familyName: string): Promise<OptionItem[]> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/families/${familyName}/models`,
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener los modelos"
        );
      }
      throw error;
    }
  }

  // GET /families/:familyName/models/:modelValue/transmissions
  static async getTransmissionsByModel(
    familyName: string,
    modelValue: string
  ): Promise<OptionItem[]> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/families/${familyName}/models/${modelValue}/transmissions`,
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener las transmisiones"
        );
      }
      throw error;
    }
  }

  // GET /families/:familyName/models/:modelValue/transmissions/:transmissionValue/fuels
  static async getFuelsByTransmission(
    familyName: string,
    modelValue: string,
    transmissionValue: string
  ): Promise<OptionItem[]> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/families/${familyName}/models/${modelValue}/transmissions/${transmissionValue}/fuels`,
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener los combustibles"
        );
      }
      throw error;
    }
  }

  // GET /families/:familyName/models/:modelValue/transmissions/:transmissionValue/fuels/:fuelValue/lines
  static async getLinesByFuel(
    familyName: string,
    modelValue: string,
    transmissionValue: string,
    fuelValue: string
  ): Promise<OptionItem[]> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/families/${familyName}/models/${modelValue}/transmissions/${transmissionValue}/fuels/${fuelValue}/lines`,
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener las líneas"
        );
      }
      throw error;
    }
  }

  // GET /families/:familyName/years - Obtiene años por familia
  static async getYearsByFamily(familyName: string): Promise<OptionItem[]> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/families/${familyName}/years`,
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener los años"
        );
      }
      throw error;
    }
  }

  // POST /register - Registra un vehículo completo
  static async registerVehicle(vehicleData: VehicleData): Promise<any> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles`,
        method: "POST",
        headers: this.getHeaders(),
        data: vehicleData,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al registrar el vehículo"
        );
      }
      throw error;
    }
  }

  // POST /bulk - Registra múltiples vehículos con las mismas características pero diferentes años/transmisiones
  static async bulkRegisterVehicles(bulkData: BulkVehicleData): Promise<any> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/bulk`,
        method: "POST",
        headers: this.getHeaders(),
        data: bulkData,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al registrar los vehículos en masa"
        );
      }
      throw error;
    }
  }

  // PUT /:id - Actualiza los datos de un vehículo
  static async updateVehicle(id: string, vehicleData: Partial<VehicleData>): Promise<any> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/${id}`,
        method: "PUT",
        headers: this.getHeaders(),
        data: vehicleData,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al actualizar el vehículo"
        );
      }
      throw error;
    }
  }

  // DELETE /:id - Elimina un vehículo
  static async deleteVehicle(id: string): Promise<any> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/${id}`,
        method: "DELETE",
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al eliminar el vehículo"
        );
      }
      throw error;
    }
  }

  // DELETE /bulk - Elimina múltiples vehículos
  static async bulkDeleteVehicles(ids: string[]): Promise<any> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/bulk`,
        method: "DELETE",
        headers: this.getHeaders(),
        data: { ids },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al eliminar los vehículos en masa"
        );
      }
      throw error;
    }
  }

  // GET /search - Búsqueda avanzada de vehículos con múltiples criterios
  static async searchVehicles(criteria: VehicleSearchCriteria): Promise<any[]> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/search`,
        method: "GET",
        headers: this.getHeaders(),
        params: criteria,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al buscar vehículos"
        );
      }
      throw error;
    }
  }

  // GET /export - Exporta vehículos a Excel
  static async exportToExcel(limit?: number): Promise<Blob> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/export`,
        method: "GET",
        headers: this.getHeaders(),
        responseType: "blob",
        params: { limit },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al exportar vehículos"
        );
      }
      throw error;
    }
  }

  // POST /import - Importa vehículos desde Excel
  static async importFromExcel(file: File): Promise<VehicleImportResult> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/import`,
        method: "POST",
        headers: {
          ...this.getHeaders(),
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al importar vehículos"
        );
      }
      throw error;
    }
  }

  // GET /template - Descarga la plantilla de Excel para importación
  static async downloadTemplate(): Promise<Blob> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/template`,
        method: "GET",
        headers: {
          ...this.getHeaders(),
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al descargar la plantilla"
        );
      }
      throw error;
    }
  }

  // POST /api/dashboard/vehicle-attributes/families - Create a new vehicle family
  static async createFamily(familyName: string): Promise<FamilyItem> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicle-attributes/families`,
        method: "POST",
        headers: this.getHeaders(),
        data: { familyName },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al crear la familia de vehículos"
        );
      }
      throw error;
    }
  }

  // POST /api/dashboard/vehicle-attributes/models - Add a new model to a family
  static async addModel(familyId: string, modelName: string, year?: string): Promise<any> {
    // Validate inputs
    if (!familyId) {
      throw new Error("El ID de la familia es requerido");
    }

    if (!modelName || typeof modelName !== "string" || modelName.trim() === "") {
      throw new Error("Nombre de modelo inválido: debe ser un texto no vacío");
    }

    // Use current year as default if year is not provided
    const modelYear = year || new Date().getFullYear().toString();
    if (isNaN(parseInt(modelYear)) || parseInt(modelYear) <= 0) {
      throw new Error("Formato de año inválido");
    }

    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicle-attributes/models`,
        method: "POST",
        headers: this.getHeaders(),
        data: { familyId, modelName: modelName.trim(), year: modelYear },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific error cases from the backend
        if (error.response?.status === 400) {
          throw new Error(
            error.response?.data?.message || "El modelo ya existe para este año o los datos son inválidos"
          );
        } else if (error.response?.status === 404) {
          throw new Error("Familia de vehículo no encontrada");
        } else {
          throw new Error(
            error.response?.data?.message || "Error al añadir el modelo"
          );
        }
      }
      throw error;
    }
  }

  // POST /api/dashboard/vehicle-attributes/transmissions - Add a new transmission to a model
  static async addTransmission(familyId: string, modelName: string, transmissionName: string, year?: string): Promise<any> {
    // Validate inputs
    if (!familyId) {
      throw new Error("El ID de la familia es requerido");
    }

    if (!modelName || typeof modelName !== "string" || modelName.trim() === "") {
      throw new Error("Nombre de modelo inválido: debe ser un texto no vacío");
    }

    if (!transmissionName || typeof transmissionName !== "string" || transmissionName.trim() === "") {
      throw new Error("Nombre de transmisión inválido: debe ser un texto no vacío");
    }

    // Use current year as default if year is not provided
    const transmissionYear = year || new Date().getFullYear().toString();
    if (isNaN(parseInt(transmissionYear)) || parseInt(transmissionYear) <= 0) {
      throw new Error("Formato de año inválido");
    }

    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicle-attributes/transmissions`,
        method: "POST",
        headers: this.getHeaders(),
        data: { 
          familyId, 
          modelName: modelName.trim(), 
          transmissionName: transmissionName.trim(), 
          year: transmissionYear 
        },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific error cases from the backend
        if (error.response?.status === 400) {
          throw new Error(
            error.response?.data?.message || "La transmisión ya existe para este modelo y año o los datos son inválidos"
          );
        } else if (error.response?.status === 404) {
          throw new Error("Familia de vehículo o modelo no encontrado");
        } else {
          throw new Error(
            error.response?.data?.message || "Error al añadir la transmisión"
          );
        }
      }
      throw error;
    }
  }

  // POST /api/dashboard/vehicle-attributes/fuels - Add a new fuel type to a model/transmission
  static async addFuel(familyId: string, modelName: string, transmissionName: string, fuelName: string, year?: string): Promise<any> {
    // Validate inputs
    if (!familyId) {
      throw new Error("El ID de la familia es requerido");
    }

    if (!modelName || typeof modelName !== "string" || modelName.trim() === "") {
      throw new Error("Nombre de modelo inválido: debe ser un texto no vacío");
    }

    if (!transmissionName || typeof transmissionName !== "string" || transmissionName.trim() === "") {
      throw new Error("Nombre de transmisión inválido: debe ser un texto no vacío");
    }

    if (!fuelName || typeof fuelName !== "string" || fuelName.trim() === "") {
      throw new Error("Nombre de combustible inválido: debe ser un texto no vacío");
    }

    // Use current year as default if year is not provided
    const fuelYear = year || new Date().getFullYear().toString();
    if (isNaN(parseInt(fuelYear)) || parseInt(fuelYear) <= 0) {
      throw new Error("Formato de año inválido");
    }

    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicle-attributes/fuels`,
        method: "POST",
        headers: this.getHeaders(),
        data: { 
          familyId, 
          modelName: modelName.trim(), 
          transmissionName: transmissionName.trim(), 
          fuelName: fuelName.trim(), 
          year: fuelYear 
        },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific error cases from the backend
        if (error.response?.status === 400) {
          throw new Error(
            error.response?.data?.message || "El combustible ya existe para esta transmisión y año o los datos son inválidos"
          );
        } else if (error.response?.status === 404) {
          throw new Error("Familia de vehículo, modelo o transmisión no encontrado");
        } else {
          throw new Error(
            error.response?.data?.message || "Error al añadir el combustible"
          );
        }
      }
      throw error;
    }
  }

  // POST /api/dashboard/vehicle-attributes/lines - Add a new line to a model/transmission/fuel
  static async addLine(familyId: string, modelName: string, transmissionName: string, fuelName: string, lineName: string, year?: string): Promise<any> {
    // Validate inputs
    if (!familyId) {
      throw new Error("El ID de la familia es requerido");
    }

    if (!modelName || typeof modelName !== "string" || modelName.trim() === "") {
      throw new Error("Nombre de modelo inválido: debe ser un texto no vacío");
    }

    if (!transmissionName || typeof transmissionName !== "string" || transmissionName.trim() === "") {
      throw new Error("Nombre de transmisión inválido: debe ser un texto no vacío");
    }

    if (!fuelName || typeof fuelName !== "string" || fuelName.trim() === "") {
      throw new Error("Nombre de combustible inválido: debe ser un texto no vacío");
    }

    if (!lineName || typeof lineName !== "string" || lineName.trim() === "") {
      throw new Error("Nombre de línea inválido: debe ser un texto no vacío");
    }

    // Use current year as default if year is not provided
    const lineYear = year || new Date().getFullYear().toString();
    if (isNaN(parseInt(lineYear)) || parseInt(lineYear) <= 0) {
      throw new Error("Formato de año inválido");
    }

    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicle-attributes/lines`,
        method: "POST",
        headers: this.getHeaders(),
        data: { 
          familyId, 
          modelName: modelName.trim(), 
          transmissionName: transmissionName.trim(), 
          fuelName: fuelName.trim(), 
          lineName: lineName.trim(), 
          year: lineYear 
        },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific error cases from the backend
        if (error.response?.status === 400) {
          throw new Error(
            error.response?.data?.message || "La línea ya existe para este combustible y año o los datos son inválidos"
          );
        } else if (error.response?.status === 404) {
          throw new Error("Familia de vehículo, modelo, transmisión o combustible no encontrado");
        } else {
          throw new Error(
            error.response?.data?.message || "Error al añadir la línea"
          );
        }
      }
      throw error;
    }
  }

  // POST /api/dashboard/vehicle-attributes/years - Add a new year to a family
  static async addYear(familyId: string, year: string): Promise<any> {
    // Validate inputs
    if (!familyId) {
      throw new Error("El ID de la familia es requerido");
    }

    // Validate year
    if (!year || isNaN(parseInt(year)) || parseInt(year) <= 0) {
      throw new Error("Formato de año inválido");
    }

    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicle-attributes/years`,
        method: "POST",
        headers: this.getHeaders(),
        data: { familyId, year },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific error cases from the backend
        if (error.response?.status === 400) {
          throw new Error(
            error.response?.data?.message || "El año ya existe para esta familia o los datos son inválidos"
          );
        } else if (error.response?.status === 404) {
          throw new Error("Familia de vehículo no encontrada");
        } else {
          throw new Error(
            error.response?.data?.message || "Error al añadir el año"
          );
        }
      }
      throw error;
    }
  }

  // Método auxiliar para guardar el archivo Excel
  static saveExcelFile(blob: Blob, filename: string): void {
    
  }
}

export default VehicleFamiliesService;