// src/services/vehicle-families.service.ts
import axios from "axios";
import ENDPOINTS, { BASE_URL } from "../api";
import replaceUrlParams from "../utils/replaceUrlParams.ts";

// Types for the API responses
export interface BrandItem {
  _id: string;
  name: string;
  country?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandResponse {
  brands: BrandItem[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface FamilyItem {
  name: string;
  id: string;
}

export interface OptionItem {
  label: string;
  value: string;
}

export interface VehicleData {
  transmission_id: string;
  fuel_id: string;
  line_id: string;
  color?: string;
  price?: number;
  active?: boolean;
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

interface GetParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  search?: string;
}

interface GetFamiliesResponse {
  families: any[];
  total: number;
  totalPages: number;
}
interface GetModelsResponse {
  models: any[];
  total: number;
  totalPages: number;
}

interface GetFuelsResponse {
  fuels: any[];
  total: number;
  totalPages: number;
}

interface GetLinesResponse {
  lines: any[];
  total: number;
  totalPages: number;
}
interface GetTransmissionsResponse {
  transmissions: any[];
  total: number;
  totalPages: number;
}

interface GetBrandsResponse {
  brands: any[];
  total: number;
  totalPages: number;
}

interface CreateFamilyPayload {
  name: string;
  brand_id: string;
  active: boolean;
}

interface CreateModel {
  name: string;
  familyId: string;
  brandId: string;
  year: string;
  engineType: string;
  active: boolean;
}

class VehicleFamiliesService {
  // GET /brands - Obtiene todas las marcas de vehículos
  static async getBrands(params: GetParams): Promise<GetBrandsResponse> {
    try {
      const response = await axios(`${BASE_URL}/dashboard/vehicle-brands`, {
        method: "GET",
        headers: this.getHeaders(),
        params: params,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Error al obtener las marcas de vehículos"
        );
      }
      throw error;
    }
  }

  // POST /brands - Crea una nueva marca de vehículo
  static async createBrand(data: {
    name: string;
    country?: string;
    active: boolean;
  }): Promise<BrandItem> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicle-brands`,
        method: "POST",
        headers: this.getHeaders(),
        data,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al crear la marca de vehículo"
        );
      }
      throw error;
    }
  }

  // PUT /brands/:id - Actualiza una marca de vehículo
  static async updateBrand(
    id: string,
    data: { name?: string; country?: string; active?: boolean }
  ): Promise<BrandItem> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicle-brands/${id}`,
        method: "PUT",
        headers: this.getHeaders(),
        data,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Error al actualizar la marca de vehículo"
        );
      }
      throw error;
    }
  }

  // DELETE /brands/:id - Elimina una marca de vehículo
  static async deleteBrand(id: string): Promise<void> {
    try {
      await axios({
        url: `${BASE_URL}/dashboard/vehicle-brands/${id}`,
        method: "DELETE",
        headers: this.getHeaders(),
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Error al eliminar la marca de vehículo"
        );
      }
      throw error;
    }
  }
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
  static async getFamilies(params: GetParams): Promise<GetFamiliesResponse> {
    try {
      const response = await axios(`${BASE_URL}/dashboard/vehicle-families`, {
        method: "GET",
        headers: this.getHeaders(),
        params: params,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Error al obtener las marcas de vehículos"
        );
      }
      throw error;
    }
  }

  // GET /families/:familyId/models - Obtiene modelos por familia
  static async getModels(params: GetParams): Promise<GetModelsResponse> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/models`,
        method: "GET",
        headers: this.getHeaders(),
        params: params,
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

  // GET /vehicles/transmissions - Obtiene transmisiones disponibles
  static async getTransmissions(
    params: GetParams
  ): Promise<GetTransmissionsResponse> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/transmissions`,
        method: "GET",
        headers: this.getHeaders(),
        params,
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

  // GET /vehicles/fuels - Obtiene combustibles disponibles
  static async getFuels(params: GetParams): Promise<GetFuelsResponse> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/fuels`,
        method: "GET",
        headers: this.getHeaders(),
        params,
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

  static async getLines(params: GetParams): Promise<GetLinesResponse> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/lines`,
        method: "GET",
        headers: this.getHeaders(),
        params,
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

  // POST /register - Registra un vehículo completo
  static async addVehicle(vehicleData: VehicleData): Promise<any> {
    // Validar campos requeridos
    if (!vehicleData.transmission_id || !vehicleData.fuel_id || !vehicleData.line_id) {
      throw new Error("Los campos transmisión, combustible y línea son requeridos");
    }

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

  // PUT /:id - Actualiza los datos de un vehículo
  static async updateVehicle(
    id: string,
    vehicleData: Partial<VehicleData>
  ): Promise<any> {
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
  
  // POST /api/dashboard/vehicle-families - Create a new vehicle family
  static async createFamily(payload: CreateFamilyPayload): Promise<FamilyItem> {
    // Aceptar un objeto como argumento
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicle-families`,
        method: "POST",
        headers: this.getHeaders(),
        data: payload, // Enviar el objeto payload completo
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Error al crear la familia de vehículos"
        );
      }
      throw error;
    }
  }

  // POST /api/dashboard/vehicles/models - Add a new model to a family
  static async addModel({
    name,
    familyId,
    brandId,
    year,
    engineType,
  }: CreateModel): Promise<any> {
    // Validate inputs
    if (!familyId) {
      throw new Error("El ID de la familia es requerido");
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error("Nombre de modelo inválido: debe ser un texto no vacío");
    }

    // Use current year as default if year is not provided
    const modelYear = year || new Date().getFullYear().toString();
    if (isNaN(parseInt(modelYear)) || parseInt(modelYear) <= 0) {
      throw new Error("Formato de año inválido");
    }

    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/models`,
        method: "POST",
        headers: this.getHeaders(),
        data: {
          family_id: familyId,
          brand_id: brandId,
          engine_type: engineType,
          year: modelYear,
          name: name.trim(),
        },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific error cases from the backend
        if (error.response?.status === 400) {
          throw new Error(
            error.response?.data?.message ||
              "El modelo ya existe para este año o los datos son inválidos"
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

  // POST /api/dashboard/vehicles/transmissions - Add a new transmission to a model
  static async addTransmission(
    transmissionName: string,
    gears?: number
  ): Promise<any> {
    if (
      !transmissionName ||
      typeof transmissionName !== "string" ||
      transmissionName.trim() === ""
    ) {
      throw new Error(
        "Nombre de transmisión inválido: debe ser un texto no vacío"
      );
    }

    if (gears !== undefined && !Number.isInteger(gears)) {
      throw new Error("El número de marchas debe ser un número entero");
    }

    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/transmissions`,
        method: "POST",
        headers: this.getHeaders(),
        data: {
          name: transmissionName.trim(),
          gears: gears, // Include gears in the data payload
        },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific error cases from the backend
        if (error.response?.status === 400) {
          throw new Error(
            error.response?.data?.message ||
              "Datos inválidos. Verifique el nombre y el número de marchas." // More specific error message
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

  // POST /api/dashboard/vehicles/fuels - Add a new fuel type to a model/transmission
  static async addFuel(name: string, octane_rating?: number): Promise<any> {
    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error(
        "Nombre de combustible inválido: debe ser un texto no vacío"
      );
    }

    const upperCaseName = name.trim().toUpperCase();

    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/fuels`,
        method: "POST",
        headers: this.getHeaders(),
        data: {
          name: upperCaseName,
          octane_rating: octane_rating,
        },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error(error.response?.data?.message || "Datos inválidos");
        } else if (error.response?.status === 409) {
          throw new Error(
            error.response?.data?.message || "El combustible ya existe"
          );
        } else {
          throw new Error(
            error.response?.data?.message || "Error al crear el combustible"
          );
        }
      }
      throw error;
    }
  }

  // POST /api/dashboard/vehicles/lines - Add a new line to a model/transmission/fuel
  static async addLine(
    brandId: string,
    modelId: string,
    lineName: string,
    features: string,
    price?: string,
    active: boolean = true
  ): Promise<any> {
    // Validación de inputs
    if (!brandId) {
      throw new Error("El ID de la marca es requerido");
    }

    if (!modelId) {
      throw new Error("El ID del modelo es requerido");
    }

    if (!lineName || typeof lineName !== "string" || lineName.trim() === "") {
      throw new Error("Nombre de línea inválido: debe ser un texto no vacío");
    }

    if (price && isNaN(parseFloat(price))) {
      throw new Error("Formato de precio inválido");
    }

    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/lines`,
        method: "POST",
        headers: this.getHeaders(),
        data: {
          brand_id: brandId,
          model_id: modelId,
          name: lineName.trim(),
          features: features.trim(),
          price: price ? parseFloat(price) : undefined,
          active,
        },
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error(
            error.response?.data?.message ||
              "La línea ya existe o los datos son inválidos"
          );
        } else if (error.response?.status === 404) {
          throw new Error("Marca o modelo no encontrado");
        } else {
          throw new Error(
            error.response?.data?.message || "Error al añadir la línea"
          );
        }
      }
      throw error;
    }
  }

}

export default VehicleFamiliesService;
