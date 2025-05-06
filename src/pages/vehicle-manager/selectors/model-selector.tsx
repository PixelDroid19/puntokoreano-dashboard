// src/pages/selectors/vehicle-manager/ModelSelector.tsx
import React, { useState } from "react";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import {
  ModelsOption as OriginalModelsOption,
  ModelSelectorProps as OriginalModelSelectorProps,
} from "../../../types/selectors.types";

interface ApiModel {
  _id: string;
  name?: string;
  brand_id?: string;
  family_id?: string;
  engineType?: string;
  year?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;

  [key: string]: any;
}

interface ModelApiData {
  models: ApiModel[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface ModelApiResponse {
  success: boolean;
  message?: string;
  data?: ModelApiData;
}

export interface ModelsOption extends OriginalModelsOption {
  modelData: ApiModel;
}

interface PageAdditional {
  page: number;
}

export interface ModelSelectorProps
  extends Omit<OriginalModelSelectorProps, "value" | "onChange"> {
  value: ModelsOption | null;

  onChange: (selectedOption: ModelsOption | null) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar Modelo...",
  ...rest
}) => {
  const [error, setError] = useState<string | null>(null);

  const loadPageOptions: LoadOptions<
    ModelsOption,
    any,
    PageAdditional
  > = async (
    search,
    loadedOptions,
    additional
  ): Promise<{
    options: ModelsOption[];
    hasMore: boolean;
    additional?: PageAdditional;
  }> => {
    const pageToLoad = additional?.page || 1;
    const limit = 10;

    setError(null);

    try {
      const serviceResponse: ModelApiResponse | ModelApiData =
        await VehicleFamiliesService.getModels({
          page: pageToLoad,
          limit: limit,
          sortBy: "name",
          sortOrder: "asc",
          search: search,
        });

      console.log("Respuesta RECIBIDA del servicio (Models):", serviceResponse);

      const responseData: ModelApiData | null | undefined =
        (serviceResponse as ModelApiResponse)?.data ??
        (serviceResponse as ModelApiData);

      if (
        !responseData ||
        !Array.isArray(responseData.models) ||
        !responseData.pagination
      ) {
        console.error(
          "Formato de datos de API inválido (Models):",
          responseData
        );
        const apiMessage = (serviceResponse as ModelApiResponse)?.message;
        throw new Error(
          apiMessage || "Formato de datos inválido de la API de modelos"
        );
      }

      const { models, pagination } = responseData;

      const newOptions: ModelsOption[] = models.map((model: ApiModel) => {
        console.log("Modelo recibido:", model);
        const modelName =
          (model.name && model.name.trim()) ||
          ((model.engineType || model.engine_type) && model.year
            ? ` ${model.name || ""} ${
                model.engineType || model.engine_type || ""
              } ${model.year || ""}`
            : "Modelo sin nombre");
        return {
          value: model._id,
          label: modelName,
          modelData: model,
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
      console.error("Error en loadPageOptions (Models):", err);
      const errorMessage =
        err.message || "Error inesperado al cargar los modelos";
      setError(errorMessage);

      return {
        options: [],
        hasMore: false,
      };
    }
  };

  const handleChange = (selectedOption: ModelsOption | null) => {
    if (onChange) {
      onChange(selectedOption);
    }
  };

  return (
    <div>
      <AsyncPaginate<ModelsOption, any, PageAdditional>
        value={value}
        loadOptions={loadPageOptions}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        onChange={handleChange}
        isSearchable={true}
        placeholder={placeholder}
        loadingMessage={() => "Cargando Modelos..."}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? "No se encontraron modelos" : "Escribe para buscar..."
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

export default ModelSelector;
