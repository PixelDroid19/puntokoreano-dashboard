import { axiosInstance } from "../utils/axios-interceptor";
import ENDPOINTS from '../api';

// Definición interna del tipo VehicleApplicabilityGroup
export interface VehicleApplicabilityGroup {
  _id: string;
  name: string;
  description?: string;
  criteria: {
    // Criterios jerárquicos de vehículos
    brands?: string[];
    families?: string[];
    models?: string[];
    lines?: string[];
    
    // Criterios técnicos del vehículo
    transmissions?: string[];
    fuels?: string[];
    engineTypes?: string[];
    
    // Sistema mejorado de años/fechas
    minYear?: number;
    maxYear?: number;
    specificYears?: number[];
  };
  includedVehicles?: string[];
  excludedVehicles?: string[];
  category?: 'repuestos' | 'accesorios' | 'servicio' | 'blog' | 'general';
  tags?: string[];
  active: boolean;
  createdAt?: string;  // Cambiado de Date a string para mejor compatibilidad con API
  updatedAt?: string;  // Cambiado de Date a string para mejor compatibilidad con API
  criteriaLevel?: 'basic' | 'medium' | 'detailed';
  criteriaDescription?: string;
  vehicleCount?: number;
  _criteriaHash?: string;
  _lastVehicleCount?: number;
  _lastCountUpdate?: string;  // Cambiado de Date a string para mejor compatibilidad con API
}

// Definición de respuesta con vehículos compatibles
export interface CompatibleVehiclesResponse {
  vehicles: Array<{
    _id: string;
    model_id: {
      _id: string;
      name: string;
      year?: number[];  // Mejorado: array de años para manejar múltiples años modelo
      engine_type?: string;
      family_id: {
        _id: string;
        name: string;
        brand_id: {
          _id: string;
          name: string;
          country?: string;
        }
      }
    };
    transmission_id: {
      _id: string;
      name: string;
    };
    fuel_id: {
      _id: string;
      name: string;
    };
    active: boolean;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Definición de respuesta con estadísticas
export interface GroupStatsResponse {
  totalGroups: number;
  activeGroups: number;
  byCategory: Array<{
    _id: string;
    count: number;
  }>;
  byCriteriaLevel?: Array<{
    _id: 'basic' | 'medium' | 'detailed';
    count: number;
  }>;
}

// Interfaz para validación de criterios de años
export interface YearCriteriaValidation {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
}

// Cache local simple para reducir llamadas al servidor
const localCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en ms

class VehicleApplicabilityGroupsService {
  // Método para limpiar caché
  static clearCache() {
    localCache.clear();
  }

  // Método para verificar caché
  private static getFromCache<T>(key: string): T | null {
    const cached = localCache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > CACHE_TTL) {
      localCache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }
  
  // Método para guardar en caché
  private static setCache(key: string, data: any): void {
    localCache.set(key, { data, timestamp: Date.now() });
  }

  // Método para validar criterios de años
  static validateYearCriteria(criteria: VehicleApplicabilityGroup['criteria']): YearCriteriaValidation {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const currentYear = new Date().getFullYear();
    
    // Validar exclusión mutua entre rangos y años específicos
    const hasYearRange = Boolean(criteria.minYear) || Boolean(criteria.maxYear);
    const hasSpecificYears = Boolean(criteria.specificYears?.length);
    
    if (hasYearRange && hasSpecificYears) {
      return {
        isValid: false,
        warnings: ['No se pueden usar rangos de años y años específicos al mismo tiempo'],
        suggestions: ['Elija usar solo rangos de años O años específicos, no ambos']
      };
    }
    
    // Validar rango de años
    if (criteria.minYear && criteria.maxYear) {
      if (criteria.minYear > criteria.maxYear) {
        return {
          isValid: false,
          warnings: ['El año mínimo no puede ser mayor que el año máximo'],
          suggestions: ['Verifique que los años estén en el orden correcto']
        };
      }
      
      // Advertir sobre rangos muy amplios
      if (criteria.maxYear - criteria.minYear > 30) {
        warnings.push(`Rango de años muy amplio (${criteria.maxYear - criteria.minYear} años)`);
        suggestions.push('Considere dividir en múltiples grupos para mayor precisión');
      }
      
      // Advertir sobre años futuros
      if (criteria.maxYear > currentYear + 1) {
        warnings.push('El año máximo incluye años futuros');
        suggestions.push('Verifique que sea intencional incluir modelos futuros');
      }
    }
    
    // Validar años específicos mejorado
    if (criteria.specificYears?.length) {
      // Verificar duplicados (aunque el backend debería manejar esto)
      const uniqueYears = [...new Set(criteria.specificYears)];
      if (uniqueYears.length !== criteria.specificYears.length) {
        warnings.push('Se detectaron años duplicados en la lista');
        suggestions.push('Los años duplicados serán eliminados automáticamente');
      }
      
      // Verificar años futuros
      const futureYears = criteria.specificYears.filter(year => year > currentYear + 1);
      if (futureYears.length > 0) {
        warnings.push(`Años específicos incluyen años futuros: ${futureYears.join(', ')}`);
        suggestions.push('Verifique que sea intencional incluir años futuros');
      }
      
      // Verificar años muy antiguos
      const veryOldYears = criteria.specificYears.filter(year => year < 1990);
      if (veryOldYears.length > 0) {
        warnings.push(`Años muy antiguos detectados: ${veryOldYears.join(', ')}`);
        suggestions.push('Verifique que estos años sean correctos para vehículos modernos');
      }
      
      // Sugerir usar rangos si hay muchos años consecutivos
      if (criteria.specificYears.length > 5) {
        const sortedYears = [...criteria.specificYears].sort((a, b) => a - b);
        let consecutiveCount = 1;
        let maxConsecutive = 1;
        
        for (let i = 1; i < sortedYears.length; i++) {
          if (sortedYears[i] === sortedYears[i-1] + 1) {
            consecutiveCount++;
            maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
          } else {
            consecutiveCount = 1;
          }
        }
        
        if (maxConsecutive >= 4) {
          suggestions.push('Considere usar rangos de años en lugar de años específicos para secuencias largas');
        }
      }
    }
    
    return {
      isValid: true,
      warnings,
      suggestions
    };
  }

  // Obtener todos los grupos con filtros
  static async getGroups(params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    category?: string;
    activeOnly?: boolean;
    useCache?: boolean;
  }) {
    const { useCache = true, ...apiParams } = params;
    
    try {
      // Verificar caché si está habilitado
      if (useCache) {
        const cacheKey = `groups_${JSON.stringify(apiParams)}`;
        const cached = this.getFromCache<any>(cacheKey);
        if (cached) return cached;
      }

      const response = await axiosInstance.get("/dashboard/vehicles/applicability-groups", {
        params: {
          ...apiParams,
          activeOnly: apiParams.activeOnly !== undefined ? String(apiParams.activeOnly) : undefined
        }
      });
      
      const result = response.data.data;
      
      // Guardar en caché si está habilitado
      if (useCache) {
        const cacheKey = `groups_${JSON.stringify(apiParams)}`;
        this.setCache(cacheKey, result);
      }
      
      return result;
    } catch (error: any) {
      console.error("Error fetching applicability groups:", error);
      
      // Agregar detalles del error para mejor depuración
      const errorDetails = error.response?.data?.message || error.message || 'Error desconocido';
      throw new Error(`Error al obtener grupos de aplicabilidad: ${errorDetails}`);
    }
  }

  // Obtener un grupo por ID
  static async getGroupById(id: string, useCache = true) {
    try {
      // Verificar caché si está habilitado
      if (useCache) {
        const cacheKey = `group_${id}`;
        const cached = this.getFromCache<VehicleApplicabilityGroup>(cacheKey);
        if (cached) return cached;
      }
      
      const response = await axiosInstance.get(`/dashboard/vehicles/applicability-groups/${id}`);
      const result = response.data.data;
      
      // Guardar en caché si está habilitado
      if (useCache) {
        const cacheKey = `group_${id}`;
        this.setCache(cacheKey, result);
      }
      
      return result;
    } catch (error: any) {
      console.error(`Error fetching applicability group ${id}:`, error);
      
      // Manejo específico para 404
      if (error.response?.status === 404) {
        throw new Error(`Grupo de aplicabilidad no encontrado (ID: ${id})`);
      }
      
      const errorDetails = error.response?.data?.message || error.message || 'Error desconocido';
      throw new Error(`Error al obtener grupo de aplicabilidad: ${errorDetails}`);
    }
  }

  // Crear un nuevo grupo
  static async createGroup(groupData: Partial<VehicleApplicabilityGroup>) {
    try {
      const response = await axiosInstance.post(
        "/dashboard/vehicles/applicability-groups",
        groupData
      );
      
      // Limpiar caché para reflejar los cambios
      this.clearCache();
      
      return response.data.data;
    } catch (error: any) {
      console.error("Error creating applicability group:", error);
      
      // Manejo específico para errores comunes
      if (error.response?.status === 409) {
        throw new Error("Ya existe un grupo con este nombre");
      }
      
      const errorDetails = error.response?.data?.message || error.message || 'Error desconocido';
      throw new Error(`Error al crear grupo de aplicabilidad: ${errorDetails}`);
    }
  }

  // Actualizar un grupo
  static async updateGroup(id: string, groupData: Partial<VehicleApplicabilityGroup>) {
    try {
      const response = await axiosInstance.put(
        `/dashboard/vehicles/applicability-groups/${id}`,
        groupData
      );
      
      // Limpiar caché para reflejar los cambios
      this.clearCache();
      
      return response.data.data;
    } catch (error: any) {
      console.error(`Error updating applicability group ${id}:`, error);
      
      // Manejo específico para errores comunes
      if (error.response?.status === 404) {
        throw new Error(`Grupo de aplicabilidad no encontrado (ID: ${id})`);
      } else if (error.response?.status === 409) {
        throw new Error("Ya existe otro grupo con este nombre");
      }
      
      const errorDetails = error.response?.data?.message || error.message || 'Error desconocido';
      throw new Error(`Error al actualizar grupo de aplicabilidad: ${errorDetails}`);
    }
  }

  // Eliminar un grupo
  static async deleteGroup(id: string) {
    try {
      const response = await axiosInstance.delete(`/dashboard/vehicles/applicability-groups/${id}`);
      
      // Limpiar caché para reflejar los cambios
      this.clearCache();
      
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting applicability group ${id}:`, error);
      
      // Manejo específico para errores comunes
      if (error.response?.status === 404) {
        throw new Error(`Grupo de aplicabilidad no encontrado (ID: ${id})`);
      }
      
      const errorDetails = error.response?.data?.message || error.message || 'Error desconocido';
      throw new Error(`Error al eliminar grupo de aplicabilidad: ${errorDetails}`);
    }
  }

  // Obtener vehículos compatibles con un grupo
  static async getCompatibleVehicles(
    groupId: string, 
    params: { page?: number; limit?: number; useCache?: boolean } = {}
  ): Promise<CompatibleVehiclesResponse> {
    const { useCache = true, ...apiParams } = params;
    
    try {
      // Verificar caché si está habilitado
      if (useCache) {
        const cacheKey = `vehicles_for_group_${groupId}_${JSON.stringify(apiParams)}`;
        const cached = this.getFromCache<CompatibleVehiclesResponse>(cacheKey);
        if (cached) return cached;
      }
      
      const response = await axiosInstance.get(
        `/dashboard/vehicles/applicability-groups/${groupId}/vehicles`,
        { params: apiParams }
      );
      
      const result = response.data.data;
      
      // Guardar en caché si está habilitado (caché más corto para vehículos)
      if (useCache) {
        const cacheKey = `vehicles_for_group_${groupId}_${JSON.stringify(apiParams)}`;
        this.setCache(cacheKey, result);
        
        // Eliminar de la caché después de 2 minutos
        setTimeout(() => {
          localCache.delete(cacheKey);
        }, 2 * 60 * 1000);
      }
      
      return result;
    } catch (error: any) {
      console.error(`Error fetching compatible vehicles for group ${groupId}:`, error);
      
      // Manejo específico para errores comunes
      if (error.response?.status === 404) {
        throw new Error(`Grupo de aplicabilidad no encontrado (ID: ${groupId})`);
      }
      
      const errorDetails = error.response?.data?.message || error.message || 'Error desconocido';
      throw new Error(`Error al obtener vehículos compatibles: ${errorDetails}`);
    }
  }

  // Verificar si un vehículo está en un grupo
  static async checkVehicleInGroup(groupId: string, vehicleId: string, useCache = true) {
    try {
      // Verificar caché si está habilitado
      if (useCache) {
        const cacheKey = `vehicle_in_group_${groupId}_${vehicleId}`;
        const cached = this.getFromCache<boolean>(cacheKey);
        if (cached !== null) return cached;
      }
      
      const response = await axiosInstance.get(
        `/dashboard/vehicles/applicability-groups/${groupId}/check-vehicle/${vehicleId}`
      );
      
      const result = response.data.data.isInGroup;
      
      // Guardar en caché si está habilitado
      if (useCache) {
        const cacheKey = `vehicle_in_group_${groupId}_${vehicleId}`;
        this.setCache(cacheKey, result);
      }
      
      return result;
    } catch (error: any) {
      console.error(`Error checking vehicle ${vehicleId} in group ${groupId}:`, error);
      
      // Manejo específico para errores comunes
      if (error.response?.status === 404) {
        throw new Error(`Grupo de aplicabilidad o vehículo no encontrado`);
      }
      
      const errorDetails = error.response?.data?.message || error.message || 'Error desconocido';
      throw new Error(`Error al verificar vehículo en grupo: ${errorDetails}`);
    }
  }
  
  // Obtener estadísticas de grupos
  static async getGroupStats(useCache = true): Promise<GroupStatsResponse> {
    try {
      // Verificar caché si está habilitado
      if (useCache) {
        const cacheKey = 'group_stats';
        const cached = this.getFromCache<GroupStatsResponse>(cacheKey);
        if (cached) return cached;
      }
      
      const response = await axiosInstance.get('/dashboard/vehicles/applicability-groups/stats');
      const result = response.data.data;
      
      // Guardar en caché si está habilitado
      if (useCache) {
        const cacheKey = 'group_stats';
        this.setCache(cacheKey, result);
      }
      
      return result;
    } catch (error: any) {
      console.error("Error fetching group stats:", error);
      const errorDetails = error.response?.data?.message || error.message || 'Error desconocido';
      throw new Error(`Error al obtener estadísticas de grupos: ${errorDetails}`);
    }
  }
  
  // Exportar grupos a CSV
  static async exportGroups(filters: any = {}) {
    try {
      const response = await axiosInstance.get('/dashboard/vehicles/applicability-groups/export', {
        params: filters,
        responseType: 'blob'
      });
      
      // Crear un objeto URL para la descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `grupos-aplicabilidad-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error: any) {
      console.error("Error exporting groups:", error);
      const errorDetails = error.response?.data?.message || error.message || 'Error desconocido';
      throw new Error(`Error al exportar grupos: ${errorDetails}`);
    }
  }

  // Método para obtener grupos para el selector (con paginación y búsqueda)
  static async getApplicabilityGroupsForSelector(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    activeOnly?: boolean;
  }): Promise<{
    groups: Array<{
      _id: string;
      name: string;
      description?: string;
      category?: string;
      active: boolean;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.activeOnly !== undefined) queryParams.append('activeOnly', params.activeOnly.toString());

      const response = await axiosInstance.get(`${ENDPOINTS.DASHBOARD.VEHICLE_APPLICABILITY_GROUPS.GET_ALL.url}?${queryParams.toString()}`);

      return response.data.data;
    } catch (error) {
      console.error('Error fetching applicability groups for selector:', error);
      throw new Error('Error al obtener grupos de aplicabilidad');
    }
  }
}

export default VehicleApplicabilityGroupsService; 