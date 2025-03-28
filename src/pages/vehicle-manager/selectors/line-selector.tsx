// src/pages/selectors/vehicle-manager/line-selector.tsx
import React, { useState } from "react";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import {
  LinesOption,
  LinesSelectorProps,
} from "../../../types/selectors.types";

interface PageAdditional {
  page: number;
}

interface ApiLine {
  _id: string;
  name?: string;
  model_id?: string;
  brand_id?: string;
  features?: string;
  price?: string | number | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;

  [key: string]: any;
}

interface LineApiData {
  lines: ApiLine[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface LineApiResponse {
  success: boolean;
  message?: string;
  data?: LineApiData;
}

const LineSelector: React.FC<LinesSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar Línea...",
  ...rest
}) => {
  const [error, setError] = useState<string | null>(null);

  const loadPageOptions: LoadOptions<LinesOption, any, PageAdditional> = async (
    search,
    loadedOptions,
    additional
  ): Promise<{
    options: LinesOption[];
    hasMore: boolean;
    additional?: PageAdditional;
  }> => {
    const pageToLoad = additional?.page || 1;

    const limit = 10;

    setError(null);

    try {
      const serviceResponse: LineApiResponse | LineApiData =
        await VehicleFamiliesService.getLines({
          page: pageToLoad,
          limit: limit,
          sortBy: "name",
          sortOrder: "asc",
          search: search,
        });
      console.log("Respuesta RECIBIDA del servicio (Lines):", serviceResponse);

      const responseData: LineApiData | null | undefined =
        (serviceResponse as LineApiResponse)?.data ??
        (serviceResponse as LineApiData);

      if (
        !responseData ||
        !Array.isArray(responseData.lines) ||
        !responseData.pagination
      ) {
        console.error(
          "Formato de datos de API inválido (Lines):",
          responseData
        );

        const apiMessage = (serviceResponse as LineApiResponse)?.message;
        throw new Error(
          apiMessage || "Formato de datos inválido de la API de líneas"
        );
      }

      const { lines, pagination } = responseData;

      const newOptions: LinesOption[] = lines.map((line: ApiLine) => {
        const lineName = line.name || "Línea sin nombre";

        return {
          value: line._id,
          label: lineName,
          lineData: line,
        };
      });

      const hasMore = pagination.currentPage < pagination.totalPages;

      const nextPage = hasMore ? pagination.currentPage + 1 : undefined;

      return {
        options: newOptions,
        hasMore: hasMore,
        additional: nextPage ? { page: nextPage } : undefined,
      };
    } catch (err: any) {
      console.error("Error en loadPageOptions (Lines):", err);
      const errorMessage =
        err.message || "Error inesperado al cargar las líneas";
      setError(errorMessage);

      return {
        options: [],
        hasMore: false,
      };
    }
  };

  const handleChange = (selectedOption: LinesOption | null) => {
    if (onChange) {
      onChange(selectedOption);
    }
  };

  return (
    <div>
      <AsyncPaginate<LinesOption, any, PageAdditional>
        value={value}
        loadOptions={loadPageOptions}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        onChange={handleChange}
        isSearchable={true}
        placeholder={placeholder}
        loadingMessage={() => "Cargando Líneas..."}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? "No se encontraron líneas" : "Escribe para buscar..."
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

export default LineSelector;
