// src/pages/selectors/vehicle-manager/VehicleSelector.tsx
import React, { useState } from "react";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import {
  VehiclesOption,
  VehicleSelectorProps,
} from "../../../types/selectors.types";

interface PageAdditional {
  page: number;
}

interface ApiVehicle {
  _id: string;
  tag_id?: string;
  color?: string;
  model_id?: {
    displayName?: string;
    engine_type?: string;
    year?: number[];
    family_id?: {
      name?: string;
      brand_id?: {
        name?: string;
      };
    };
  };
  transmission_id?: {
    name?: string;
  };
  fuel_id?: {
    name?: string;
  };
  [key: string]: any;
}

interface VehicleApiData {
  vehicles: ApiVehicle[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar Vehículo...",
  ...rest
}) => {
  const [error, setError] = useState<string | null>(null);

  const loadPageOptions: LoadOptions<
    VehiclesOption,
    any,
    PageAdditional
  > = async (
    search,
    loadedOptions,
    additional
  ): Promise<{
    options: VehiclesOption[];
    hasMore: boolean;
    additional?: PageAdditional;
  }> => {
    const pageToLoad = additional?.page || 1;
    const limit = 15;

    setError(null);

    try {
      const serviceResponse = await VehicleFamiliesService.getVehicles({
        page: pageToLoad,
        limit: limit,
        sortBy: "createdAt",
        sortOrder: "asc",
        search: search,
      });

      if (
        !serviceResponse ||
        !Array.isArray(serviceResponse.vehicles) ||
        !serviceResponse.pagination
      ) {
        console.error("Formato de datos de API inválido:", serviceResponse);
        throw new Error("Formato de datos inválido de la API de vehículos");
      }

      const { vehicles, pagination } = serviceResponse;

      const newOptions: VehiclesOption[] = vehicles.map(
        (vehicle: ApiVehicle) => {
          const brandName = vehicle.model_id?.family_id?.brand_id?.name || "";
          const familyName = vehicle.model_id?.family_id?.name || "";

          // Usar displayName si está disponible, o construir manualmente
          let modelName = vehicle.model_id?.displayName;
          if (!modelName) {
            const engineType = vehicle.model_id?.engine_type || "";

            const years = vehicle.model_id?.year;
            const yearText =
              Array.isArray(years) && years.length > 0
                ? ` (${years.join(", ")})`
                : years
                ? ` (${years})`
                : "";

            modelName = `${familyName} ${engineType} ${yearText}`.trim();
          }

          const tagId = vehicle.tag_id || "";
          const color = vehicle.color || "";
          const transmission = vehicle.transmission_id?.name || "";
          const fuel = vehicle.fuel_id?.name || "";

          const vehicleDisplayName = `${brandName} ${modelName} - ${tagId}${
            color ? ` (${color})` : ""
          } - ${transmission} ${fuel}`.trim();

          return {
            value: vehicle._id,
            label: vehicleDisplayName,
            vehicleData: vehicle,
          };
        }
      );

      const hasMore = pagination.currentPage < pagination.totalPages;
      const nextPage = hasMore ? pagination.currentPage + 1 : undefined;

      return {
        options: newOptions,
        hasMore: hasMore,
        additional: nextPage ? { page: nextPage } : undefined,
      };
    } catch (err: any) {
      console.error("Error en loadPageOptions:", err);
      const errorMessage =
        err.message || "Error inesperado al cargar Vehículos";
      setError(errorMessage);
      return {
        options: [],
        hasMore: false,
      };
    }
  };

  const handleChange = (selectedOption: VehiclesOption | null) => {
    if (onChange) {
      onChange(selectedOption);
    }
  };

  return (
    <div>
      <AsyncPaginate<VehiclesOption, any, PageAdditional>
        value={value}
        loadOptions={loadPageOptions}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        onChange={handleChange}
        isSearchable={true}
        placeholder={placeholder}
        loadingMessage={() => "Cargando Vehículos..."}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? "No se encontraron vehículos" : "Escribe para buscar..."
        }
        debounceTimeout={350}
        className="react-select-container"
        classNamePrefix="react-select"
        {...rest}
      />
      {error && (
        <p style={{ color: "red", fontSize: "0.8em", marginTop: "5px" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default VehicleSelector;
