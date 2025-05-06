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
  line_id?: {
    name?: string;
    model_id?: {
      name?: string;
      brand_id?: {
        name?: string;
      };
    };
  };
  [key: string]: any;
}

interface VehicleApiData {
  vehicles: ApiVehicle[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar Vehiculo...",
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
      console.log("Respuesta RECIBIDA del servicio:", serviceResponse);

      const responseData: VehicleApiData | null | undefined =
        serviceResponse?.data ?? serviceResponse;

      if (
        !responseData ||
        !Array.isArray(responseData.vehicles) ||
        !responseData.pagination
      ) {
        console.error("Formato de datos de API inválido:", responseData);
        throw new Error("Formato de datos inválido de la API de vehículos");
      }

      const { vehicles, pagination } = responseData;

      const newOptions: VehiclesOption[] = vehicles.map(
        (vehicle: ApiVehicle) => {
          console.log("Procesando vehículo:", vehicle);
          const brandName =
            vehicle.line_id?.model_id?.family_id?.brand_id?.name || "";
          const modelName = vehicle.line_id?.model_id?.name || "";
          const lineName = vehicle.line_id?.name || "";
          const vehicleDisplayName = `${brandName} ${modelName} ${lineName}`;

          return {
            value: vehicle._id,
            label: vehicleDisplayName,
            vehicleData: vehicle,
          };
        }
      );

      const hasMore = pagination.page < pagination.pages;
      const nextPage = hasMore ? pagination.page + 1 : undefined;

      return {
        options: newOptions,
        hasMore: hasMore,
        additional: nextPage ? { page: nextPage } : undefined,
      };
    } catch (err: any) {
      console.error("Error en loadPageOptions:", err);
      const errorMessage =
        err.message || "Error inesperado al cargar Vehiculos";
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
        loadingMessage={() => "Cargando Vehiculos..."}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? "No se encontraron vehículos" : "Escribe para buscar..."
        }
        
        debounceTimeout={350}
        reloadOptionsOnChange={true}
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
