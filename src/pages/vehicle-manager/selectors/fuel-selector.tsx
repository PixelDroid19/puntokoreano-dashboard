// src/pages/selectors/vehicle-manager/FuelSelector.tsx
import React, { useState } from "react";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import {
  FuelsOption,
  FuelSelectorProps,
} from "../../../types/selectors.types";

// --- API Type Definitions ---
interface ApiFuel {
  _id: string;
  name: string;
  octane_rating?: number;
  [key: string]: any;
}

interface FuelApiData {
  fuels: ApiFuel[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Adjust based on your actual API response structure
interface FuelApiResponse {
  success: boolean;
  message?: string;
  data?: FuelApiData;
}
// Alternative: type FuelApiResponse = FuelApiData;

interface PageAdditional {
  page: number;
}
// --- End of Type Definitions ---

const FuelSelector: React.FC<FuelSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar combustible...",
  ...rest
}) => {
  const [error, setError] = useState<string | null>(null);

  const loadPageOptions: LoadOptions<FuelsOption, any, PageAdditional> =
    async (
      search,
      loadedOptions,
      additional
    ): Promise<{
      options: FuelsOption[];
      hasMore: boolean;
      additional?: PageAdditional;
    }> => {
      const pageToLoad = additional?.page || 1;
      const limit = 10;

      setError(null);

      try {
        const serviceResponse: FuelApiResponse | FuelApiData =
          await VehicleFamiliesService.getFuels({
            page: pageToLoad,
            limit: limit,
            sortBy: "name",
            sortOrder: "asc",
            search: search,
          });

        console.log(
          "Respuesta RECIBIDA del servicio (Fuels):",
          serviceResponse
        );

        // *** IMPORTANT: Adapt the following based on your actual API response structure ***
        const responseData: FuelApiData | null | undefined =
          (serviceResponse as FuelApiResponse)?.data ??
          (serviceResponse as FuelApiData);

        if (
          !responseData ||
          !Array.isArray(responseData.fuels) ||
          !responseData.pagination
        ) {
          console.error(
            "Formato de datos de API inválido (Fuels):",
            responseData
          );
          const apiMessage = (serviceResponse as FuelApiResponse)?.message;
          throw new Error(
            apiMessage || "Formato de datos inválido de la API de combustibles"
          );
        }
        // *** End of Structure Adaptation ***

        const { fuels, pagination } = responseData;

        const newOptions: FuelsOption[] = fuels.map(
          (fuel: ApiFuel) => ({
            value: fuel._id,
            label: `${fuel.name}${
              fuel.octane_rating ? ` (${fuel.octane_rating} Oct.)` : ""
            }`,
            octane_rating: fuel.octane_rating,
            fuelData: fuel,
          })
        );

        const hasMore = pagination.currentPage < pagination.totalPages;
        const nextPage = hasMore ? pagination.currentPage + 1 : undefined;

        return {
          options: newOptions,
          hasMore: hasMore,
          additional: nextPage ? { page: nextPage } : undefined,
        };
      } catch (err: any) {
        console.error("Error en loadPageOptions (Fuels):", err);
        const errorMessage =
          err.message || "Error inesperado al cargar los combustibles";
        setError(errorMessage);

        return {
          options: [],
          hasMore: false,
        };
      }
    };

  const handleChange = (selectedOption: FuelsOption | null) => {
    if (onChange) {
      onChange(selectedOption);
    }
  };

  return (
    <div>
      <AsyncPaginate<FuelsOption, any, PageAdditional>
        value={value}
        loadOptions={loadPageOptions}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        onChange={handleChange}
        isSearchable={true}
        placeholder={placeholder}
        loadingMessage={() => "Cargando combustibles..."}
        noOptionsMessage={({ inputValue }) =>
          inputValue
            ? "No se encontraron combustibles"
            : "Escribe para buscar..."
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

export default FuelSelector;