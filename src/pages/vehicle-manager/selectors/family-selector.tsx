// src/pages/selectors/vehicle-manager/FamilySelector.tsx
import React, { useState } from "react";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import {
  FamilieOption,
  FamilieSelectorProps,
} from "../../../types/selectors.types";

// --- API Type Definitions ---
interface ApiFamily {
  _id: string;
  name: string;
  brand_id?: string;
  [key: string]: any;
}

interface FamilyApiData {
  families: ApiFamily[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Adjust based on your actual API response structure
interface FamilyApiResponse {
  success: boolean;
  message?: string;
  data?: FamilyApiData;
}
// Alternative: type FamilyApiResponse = FamilyApiData;

interface PageAdditional {
  page: number;
}
// --- End of Type Definitions ---

const FamilySelector: React.FC<FamilieSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar Familia...",
  ...rest
}) => {
  const [error, setError] = useState<string | null>(null);

  const loadPageOptions: LoadOptions<FamilieOption, any, PageAdditional> =
    async (
      search,
      loadedOptions,
      additional
    ): Promise<{
      options: FamilieOption[];
      hasMore: boolean;
      additional?: PageAdditional;
    }> => {
      const pageToLoad = additional?.page || 1;
      const limit = 10;

      setError(null);

      try {
        const serviceResponse: FamilyApiResponse | FamilyApiData =
          await VehicleFamiliesService.getFamilies({ // Correct service call
            page: pageToLoad,
            limit: limit,
            sortBy: "name",
            sortOrder: "asc",
            search: search,
          });

        console.log(
          "Respuesta RECIBIDA del servicio (Families):",
          serviceResponse
        );

        // *** IMPORTANT: Adapt the following based on your actual API response structure ***
        const responseData: FamilyApiData | null | undefined =
          (serviceResponse as FamilyApiResponse)?.data ??
          (serviceResponse as FamilyApiData);

        if (
          !responseData ||
          !Array.isArray(responseData.families) || // Check for 'families' array
          !responseData.pagination
        ) {
          console.error(
            "Formato de datos de API inválido (Families):",
            responseData
          );
          const apiMessage = (serviceResponse as FamilyApiResponse)?.message;
          throw new Error(
            apiMessage || "Formato de datos inválido de la API de familias"
          );
        }
        // *** End of Structure Adaptation ***

        const { families, pagination } = responseData;

        const newOptions: FamilieOption[] = families.map(
          (family: ApiFamily) => ({
            value: family._id,
            label: family.name, // Simple label
            brand_id: family.brand_id
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
        console.error("Error en loadPageOptions (Families):", err);
        const errorMessage =
          err.message || "Error inesperado al cargar las familias";
        setError(errorMessage);

        return {
          options: [],
          hasMore: false,
        };
      }
    };

  const handleChange = (selectedOption: FamilieOption | null) => {
    if (onChange) {
      onChange(selectedOption);
    }
  };

  return (
    <div>
      <AsyncPaginate<FamilieOption, any, PageAdditional>
        value={value}
        loadOptions={loadPageOptions}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        onChange={handleChange}
        isSearchable={true}
        placeholder={placeholder}
        loadingMessage={() => "Cargando familias..."}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? "No se encontraron familias" : "Escribe para buscar..."
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

export default FamilySelector;