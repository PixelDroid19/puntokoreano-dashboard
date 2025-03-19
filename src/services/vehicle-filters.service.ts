// src/services/vehicle-filters.service.ts
import axios from "axios";
import { BASE_URL } from "../api";
import { Filter } from "../api/types";

// Types for the filter management
export interface FilterSyncStatus {
  lastSynced: Date;
  status: 'success' | 'failed' | 'in-progress';
  message?: string;
}

export interface FilterTreeNode {
  id: string;
  label: string;
  value: string;
  children?: FilterTreeNode[];
  parentId?: string;
  level: number;
  type: 'family' | 'model' | 'transmission' | 'fuel' | 'line';
}

export interface SavedFilterSearch {
  id: string;
  name: string;
  criteria: {
    family?: string;
    model?: string;
    transmission?: string;
    fuel?: string;
    line?: string;
    year?: string;
  };
  createdAt: Date;
}

class VehicleFiltersService {
  private static getToken(): string {
    return localStorage.getItem("auth_dashboard_token") || "";
  }

  private static getHeaders() {
    return {
      Authorization: `Bearer ${this.getToken()}`,
      "Content-Type": "application/json",
    };
  }

  // GET /filters - Obtiene todos los filtros de vehículos
  static async getFilters(): Promise<Filter[]> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/filters`,
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener los filtros de vehículos"
        );
      }
      throw error;
    }
  }

  // GET /filters/:id - Obtiene un filtro específico
  static async getFilterById(id: string): Promise<Filter> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/filters/${id}`,
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener el filtro"
        );
      }
      throw error;
    }
  }

  // POST /filters - Crea un nuevo filtro
  static async createFilter(filterData: Omit<Filter, '_id'>): Promise<Filter> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/filters`,
        method: "POST",
        headers: this.getHeaders(),
        data: filterData,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al crear el filtro"
        );
      }
      throw error;
    }
  }

  // PUT /filters/:id - Actualiza un filtro existente
  static async updateFilter(id: string, filterData: Partial<Filter>): Promise<Filter> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/filters/${id}`,
        method: "PUT",
        headers: this.getHeaders(),
        data: filterData,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al actualizar el filtro"
        );
      }
      throw error;
    }
  }

  // DELETE /filters/:id - Elimina un filtro
  static async deleteFilter(id: string): Promise<void> {
    try {
      await axios({
        url: `${BASE_URL}/dashboard/vehicles/filters/${id}`,
        method: "DELETE",
        headers: this.getHeaders(),
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al eliminar el filtro"
        );
      }
      throw error;
    }
  }

  // POST /filters/sync - Sincroniza los filtros con los vehículos existentes
  static async syncFilters(): Promise<FilterSyncStatus> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/filters/sync`,
        method: "POST",
        headers: this.getHeaders(),
      });

      return {
        lastSynced: new Date(),
        status: 'success',
        message: response.data.message || "Sincronización completada con éxito"
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          lastSynced: new Date(),
          status: 'failed',
          message: error.response?.data?.message || "Error al sincronizar los filtros"
        };
      }
      throw error;
    }
  }

  // GET /filters/sync/status - Obtiene el estado de la última sincronización
  static async getSyncStatus(): Promise<FilterSyncStatus> {
    try {
      const response = await axios({
        url: `${BASE_URL}/dashboard/vehicles/filters/sync/status`,
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Error al obtener el estado de sincronización"
        );
      }
      throw error;
    }
  }

  // Convierte los filtros a una estructura de árbol para visualización jerárquica
  static convertToTreeView(filter: Filter): FilterTreeNode[] {
    const treeNodes: FilterTreeNode[] = [];
    
    // Agregar familias como nodos raíz
    Object.keys(filter.families).forEach(familyKey => {
      const familyNode: FilterTreeNode = {
        id: `family-${familyKey}`,
        label: familyKey,
        value: familyKey,
        level: 0,
        type: 'family',
        children: []
      };
      
      // Agregar modelos como hijos de la familia
      filter.families[familyKey].forEach(model => {
        const modelNode: FilterTreeNode = {
          id: `model-${model.value}`,
          label: model.label,
          value: model.value,
          parentId: familyNode.id,
          level: 1,
          type: 'model',
          children: []
        };
        
        // Agregar transmisiones si existen para este modelo
        if (filter.transmissions[familyKey] && filter.transmissions[familyKey][model.value]) {
          filter.transmissions[familyKey][model.value].forEach(transmission => {
            const transmissionNode: FilterTreeNode = {
              id: `transmission-${transmission.value}`,
              label: transmission.label,
              value: transmission.value,
              parentId: modelNode.id,
              level: 2,
              type: 'transmission',
              children: []
            };
            
            // Agregar combustibles si existen para esta transmisión
            if (filter.fuels[familyKey] && 
                filter.fuels[familyKey][model.value] && 
                filter.fuels[familyKey][model.value][transmission.value]) {
              filter.fuels[familyKey][model.value][transmission.value].forEach(fuel => {
                const fuelNode: FilterTreeNode = {
                  id: `fuel-${fuel.value}`,
                  label: fuel.label,
                  value: fuel.value,
                  parentId: transmissionNode.id,
                  level: 3,
                  type: 'fuel',
                  children: []
                };
                
                // Agregar líneas si existen para este combustible
                if (filter.lines[familyKey] && 
                    filter.lines[familyKey][model.value] && 
                    filter.lines[familyKey][model.value][transmission.value] && 
                    filter.lines[familyKey][model.value][transmission.value][fuel.value]) {
                  filter.lines[familyKey][model.value][transmission.value][fuel.value].forEach(line => {
                    const lineNode: FilterTreeNode = {
                      id: `line-${line.value}`,
                      label: line.label,
                      value: line.value,
                      parentId: fuelNode.id,
                      level: 4,
                      type: 'line',
                      children: []
                    };
                    fuelNode.children?.push(lineNode);
                  });
                }
                
                transmissionNode.children?.push(fuelNode);
              });
            }
            
            modelNode.children?.push(transmissionNode);
          });
        }
        
        familyNode.children?.push(modelNode);
      });
      
      treeNodes.push(familyNode);
    });
    
    return treeNodes;
  }

  // Guarda una búsqueda de filtros para uso posterior
  static saveFilterSearch(name: string, criteria: SavedFilterSearch['criteria']): SavedFilterSearch {
    const savedSearches = this.getSavedSearches();
    const newSearch: SavedFilterSearch = {
      id: Date.now().toString(),
      name,
      criteria,
      createdAt: new Date()
    };
    
    savedSearches.push(newSearch);
    localStorage.setItem('saved_filter_searches', JSON.stringify(savedSearches));
    
    return newSearch;
  }

  // Obtiene todas las búsquedas guardadas
  static getSavedSearches(): SavedFilterSearch[] {
    const savedSearchesJson = localStorage.getItem('saved_filter_searches');
    if (!savedSearchesJson) return [];
    
    try {
      return JSON.parse(savedSearchesJson);
    } catch (error) {
      console.error('Error parsing saved searches:', error);
      return [];
    }
  }

  // Elimina una búsqueda guardada
  static deleteSavedSearch(id: string): void {
    const savedSearches = this.getSavedSearches();
    const updatedSearches = savedSearches.filter(search => search.id !== id);
    localStorage.setItem('saved_filter_searches', JSON.stringify(updatedSearches));
  }
}

export default VehicleFiltersService;
