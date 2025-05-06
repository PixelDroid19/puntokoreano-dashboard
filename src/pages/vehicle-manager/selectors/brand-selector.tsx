// src/pages/selectors/vehicle-manager/BrandSelector.tsx
import React, { useState } from "react";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import {
  BrandOption,
  BrandSelectorProps as UpdatedBrandSelectorProps,
} from "../../../types/selectors.types";

interface ApiBrand {
  _id: string;
  name: string;
  country?: string;
  [key: string]: any;
}

interface BrandApiData {
  brands: ApiBrand[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface BrandApiResponse {
  success: boolean;
  message?: string;
  data?: BrandApiData;
}

interface PageAdditional {
  page: number;
}

const BrandSelector: React.FC<UpdatedBrandSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar marca...",
  ...rest
}) => {
  const [error, setError] = useState<string | null>(null);

  const loadPageOptions: LoadOptions<BrandOption, any, PageAdditional> = async (
    search,
    loadedOptions,
    additional
  ): Promise<{
    options: BrandOption[];
    hasMore: boolean;
    additional?: PageAdditional;
  }> => {
    const pageToLoad = additional?.page || 1;
    const limit = 10;

    setError(null);

    try {
      const serviceResponse: BrandApiResponse | BrandApiData =
        await VehicleFamiliesService.getBrands({
          page: pageToLoad,
          limit: limit,
          sortBy: "name",
          sortOrder: "asc",
          search: search,
        });

      console.log("Respuesta RECIBIDA del servicio (Brands):", serviceResponse);

      const responseData: BrandApiData | null | undefined =
        (serviceResponse as BrandApiResponse)?.data ??
        (serviceResponse as BrandApiData);

      if (
        !responseData ||
        !Array.isArray(responseData.brands) ||
        !responseData.pagination
      ) {
        console.error(
          "Formato de datos de API inválido (Brands):",
          responseData
        );
        const apiMessage = (serviceResponse as BrandApiResponse)?.message;
        throw new Error(
          apiMessage || "Formato de datos inválido de la API de marcas"
        );
      }
      // *** End of Structure Adaptation ***

      const { brands, pagination } = responseData;

      const newOptions: BrandOption[] = brands.map((brand: ApiBrand) => ({
        value: brand._id,
        label: brand.name, 
        country: brand.country, 
        brandData: brand, 
      }));

      const hasMore = pagination.currentPage < pagination.totalPages;
      const nextPage = hasMore ? pagination.currentPage + 1 : undefined;

      return {
        options: newOptions,
        hasMore: hasMore,
        additional: nextPage ? { page: nextPage } : undefined,
      };
    } catch (err: any) {
      console.error("Error en loadPageOptions (Brands):", err);
      const errorMessage =
        err.message || "Error inesperado al cargar las marcas";
      setError(errorMessage);

      return {
        options: [],
        hasMore: false,
      };
    }
  };

  const handleChange = (selectedOption: BrandOption | null) => {
    if (onChange) {
      onChange(selectedOption);
    }
  };

  return (
    <div>
      <AsyncPaginate<BrandOption, any, PageAdditional>
        value={value}
        loadOptions={loadPageOptions}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        onChange={handleChange}
        isSearchable={true}
        placeholder={placeholder}
        loadingMessage={() => "Cargando marcas..."}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? "No se encontraron marcas" : "Escribe para buscar..."
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

export default BrandSelector;
