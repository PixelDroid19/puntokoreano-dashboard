// src/services/vehicle-families.service.ts
import axios from "axios";
import ENDPOINTS, { BASE_URL } from "../api";
import { axiosInstance } from "../utils/axios-interceptor";

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
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface GetVehiclesResponse {
  vehicles: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
interface GetModelsResponse {
  models: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface GetFuelsResponse {
  fuels: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface GetLinesResponse {
  lines: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
interface GetTransmissionsResponse {
  transmissions: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface GetBrandsResponse {
  brands: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface CreateFamilyPayload {
  name: string;
  brand_id: string;
  active: boolean;
}

interface CreateModel {
  name?: string;
  family_id: string;
  year: string;
  engine_type: string;
  active: boolean;
}

class VehicleFamiliesService {
  static async getBrands(params: GetParams): Promise<GetBrandsResponse> {
    try {
      const response = await axiosInstance(
        `${BASE_URL}/dashboard/vehicle-brands`,
        {
          method: "GET",

          params: params,
        }
      );

      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida de la API de marcas"
        );
      }
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

  static async createBrand(data: {
    name: string;
    country?: string;
    active: boolean;
  }): Promise<BrandItem> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicle-brands`,
        method: "POST",
        data,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida al crear marca"
        );
      }
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

  static async updateBrand(
    id: string,
    data: { name?: string; country?: string; active?: boolean }
  ): Promise<BrandItem> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicle-brands/${id}`,
        method: "PUT",
        data,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida al actualizar marca"
        );
      }
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

  static async deleteBrand(id: string): Promise<void> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicle-brands/${id}`,
        method: "DELETE",
      });
      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Respuesta inválida al eliminar marca"
        );
      }
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

  static async getVehicles(params: GetParams): Promise<GetVehiclesResponse> {
    try {
      const response = await axiosInstance({
        url: ENDPOINTS.VEHICLES.CREATE.url,
        method: "GET",
        params: params,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida de la API de vehículos"
        );
      }
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

  static async getFamilies(params: GetParams): Promise<GetFamiliesResponse> {
    try {
      const response = await axiosInstance(
        `${BASE_URL}/dashboard/vehicle-families`,
        {
          method: "GET",
          params: params,
        }
      );
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida de la API de familias"
        );
      }
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Error al obtener las familias de vehículos"
        );
      }
      throw error;
    }
  }

  static async getModels(params: GetParams): Promise<GetModelsResponse> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/models`,
        method: "GET",
        params: params,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida de la API de modelos"
        );
      }
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

  static async getTransmissions(
    params: GetParams
  ): Promise<GetTransmissionsResponse> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/transmissions`,
        method: "GET",
        params,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message ||
            "Respuesta inválida de la API de transmisiones"
        );
      }
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

  static async getFuels(params: GetParams): Promise<GetFuelsResponse> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/fuels`,
        method: "GET",
        params,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message ||
            "Respuesta inválida de la API de combustibles"
        );
      }
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
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/lines`,
        method: "GET",
        params,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida de la API de líneas"
        );
      }
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

  static async addVehicle(vehicleData: VehicleData): Promise<any> {
    if (
      !vehicleData.transmission_id ||
      !vehicleData.fuel_id 
    ) {
      throw new Error(
        "Los campos transmisión, combustible son requeridos"
      );
    }

    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles`,
        method: "POST",
        data: vehicleData,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida al registrar vehículo"
        );
      }
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

  static async updateVehicle(
    id: string,
    vehicleData: Partial<VehicleData>
  ): Promise<any> {
    try {
      if (!id) {
        throw new Error('El ID del vehículo es obligatorio');
      }
      
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/${id}`,
        method: "PUT",
        data: vehicleData,
      });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al actualizar vehículo');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error en updateVehicle:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al actualizar vehículo');
    }
  }

  static async deleteVehicle(id: string): Promise<void> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/${id}`,
        method: "DELETE",
      });
      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Respuesta inválida al eliminar vehículo"
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al eliminar el vehículo"
        );
      }
      throw error;
    }
  }

  static async createFamily(payload: CreateFamilyPayload): Promise<FamilyItem> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicle-families`,
        method: "POST",
        data: payload,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida al crear familia"
        );
      }
      return response.data.data as FamilyItem;
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

  static async addModel(payload: CreateModel): Promise<any> {
    if (!payload.family_id) throw new Error("El ID de la familia es requerido");
    if (!payload.engine_type || typeof payload.engine_type !== 'string' || !payload.engine_type.trim()) {
      throw new Error("Tipo de motor inválido");
    }
    console.log(!payload.year || isNaN(parseInt(payload.year)) || payload.year.length !== 4);
  
    if (!payload.year || isNaN(parseInt(payload.year)) || payload.year.toString().length !== 4) {
      throw new Error("Año inválido");
    }

    const data: any = {
      family_id: payload.family_id,
      year: parseInt(payload.year),
      engine_type: payload.engine_type.trim(),
      active: payload.active !== undefined ? payload.active : true,
    };
    if (typeof payload.name === 'string' && payload.name.trim() !== '') {
      data.name = payload.name.trim();
    }

    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/models`,
        method: "POST",
        data,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida al añadir modelo"
        );
      }
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al añadir el modelo"
        );
      }
      throw error;
    }
  }

  static async addTransmission(
    transmissionName: string,
    gears?: number
  ): Promise<any> {
    if (!transmissionName?.trim()) {
      throw new Error("Nombre de transmisión inválido");
    }
    if (gears !== undefined && (!Number.isInteger(gears) || gears < 0)) {
      throw new Error("El número de marchas debe ser un entero no negativo");
    }

    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/transmissions`,
        method: "POST",
        data: {
          name: transmissionName.trim(),
          ...(gears !== undefined &&
            gears !== null &&
            !isNaN(gears) && { gears: gears }),
          active: true,
        },
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida al añadir transmisión"
        );
      }
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al añadir la transmisión"
        );
      }
      throw error;
    }
  }

  static async addFuel(name: string, octane_rating?: number): Promise<any> {
    try {
      if (!name || name.trim() === '') {
        throw new Error('El nombre del combustible es obligatorio');
      }
      
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/fuels`,
        method: "POST",
        data: {
          name: name.toUpperCase(),
          octane_rating
        },
      });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al crear combustible');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error en addFuel:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al crear combustible');
    }
  }

  static async addLine(
    modelId: string,
    lineName: string,
    features?: string,
    price?: string | number,
    active: boolean = true
  ): Promise<any> {
    if (!modelId) throw new Error("El ID del modelo es requerido");
    if (!lineName?.trim()) throw new Error("Nombre de línea inválido");

    let numericPrice: number | undefined = undefined;
    if (price !== undefined && price !== null && price !== "") {
      numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        throw new Error("Formato de precio inválido");
      }
    }

    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/lines`,
        method: "POST",
        data: {
          model_id: modelId,
          name: lineName.trim(),
          features: features?.trim() || "",
          price: numericPrice,
          active,
        },
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida al añadir línea"
        );
      }
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al añadir la línea"
        );
      }
      throw error;
    }
  }

  static async deleteFamily(id: string): Promise<void> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicle-families/${id}`,
        method: "DELETE",
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Error al eliminar la familia");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al eliminar la familia"
        );
      }
      throw error;
    }
  }

  static async updateFamily(id: string, data: { name?: string; brand_id?: string; active?: boolean }): Promise<any> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicle-families/${id}`,
        method: "PUT",
        data,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida al actualizar familia"
        );
      }
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al actualizar la familia"
        );
      }
      throw error;
    }
  }

  static async updateFuel(id: string, data: { name?: string; octane_rating?: number; active?: boolean }): Promise<any> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/fuels/${id}`,
        method: "PUT",
        data,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida al actualizar combustible"
        );
      }
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al actualizar el combustible"
        );
      }
      throw error;
    }
  }

  static async deleteFuel(id: string): Promise<void> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/fuels/${id}`,
        method: "DELETE",
      });
      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Respuesta inválida al eliminar combustible"
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al eliminar el combustible"
        );
      }
      throw error;
    }
  }

  static async updateLine(id: string, data: { model_id?: string; name?: string; features?: string; price?: number; active?: boolean }): Promise<any> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/lines/${id}`,
        method: "PUT",
        data,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida al actualizar línea"
        );
      }
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al actualizar la línea"
        );
      }
      throw error;
    }
  }

  static async deleteLine(id: string): Promise<void> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/lines/${id}`,
        method: "DELETE",
      });
      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Respuesta inválida al eliminar línea"
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al eliminar la línea"
        );
      }
      throw error;
    }
  }

  static async updateModel(id: string, data: { name?: string; family_id?: string; year?: number; engine_type?: string; active?: boolean }): Promise<any> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/models/${id}`,
        method: "PUT",
        data,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida al actualizar modelo"
        );
      }
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al actualizar el modelo"
        );
      }
      throw error;
    }
  }

  static async deleteModel(id: string): Promise<void> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/models/${id}`,
        method: "DELETE",
      });
      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Respuesta inválida al eliminar modelo"
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al eliminar el modelo"
        );
      }
      throw error;
    }
  }

  static async updateTransmission(id: string, data: { name?: string; gears?: number; active?: boolean }): Promise<any> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/transmissions/${id}`,
        method: "PUT",
        data,
      });
      if (!response.data?.success || !response.data?.data) {
        throw new Error(
          response.data?.message || "Respuesta inválida al actualizar transmisión"
        );
      }
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al actualizar la transmisión"
        );
      }
      throw error;
    }
  }

  static async deleteTransmission(id: string): Promise<void> {
    try {
      const response = await axiosInstance({
        url: `${BASE_URL}/dashboard/vehicles/transmissions/${id}`,
        method: "DELETE",
      });
      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Respuesta inválida al eliminar transmisión"
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al eliminar la transmisión"
        );
      }
      throw error;
    }
  }
}

export default VehicleFamiliesService;
