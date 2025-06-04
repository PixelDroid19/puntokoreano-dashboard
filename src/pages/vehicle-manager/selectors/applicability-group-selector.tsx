import React, { useState } from "react";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import VehicleApplicabilityGroupsService from "../../../services/vehicle-applicability-groups.service";
import {
  ApplicabilityGroupOption,
  ApplicabilityGroupSelectorProps,
} from "../../../types/selectors.types";

interface PageAdditional {
  page: number;
}

interface ApiGroup {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  active: boolean;
}

interface GroupApiData {
  groups: ApiGroup[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const ApplicabilityGroupSelector: React.FC<ApplicabilityGroupSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar Grupo de Aplicabilidad...",
  isMulti = false,
  className,
  onFocus,
  onBlur,
}) => {
  const [error, setError] = useState<string | null>(null);

  const loadPageOptions: LoadOptions<
    ApplicabilityGroupOption,
    any,
    PageAdditional
  > = async (
    search,
    loadedOptions,
    additional
  ): Promise<{
    options: ApplicabilityGroupOption[];
    hasMore: boolean;
    additional?: PageAdditional;
  }> => {
    const pageToLoad = additional?.page || 1;
    const limit = 15;

    setError(null);

    try {
      const serviceResponse = await VehicleApplicabilityGroupsService.getApplicabilityGroupsForSelector({
        page: pageToLoad,
        limit: limit,
        search: search,
        activeOnly: true, // Solo grupos activos
      });

      if (
        !serviceResponse ||
        !Array.isArray(serviceResponse.groups) ||
        !serviceResponse.pagination
      ) {
        console.error("Formato de datos de API inválido:", serviceResponse);
        throw new Error("Formato de datos inválido de la API de grupos de aplicabilidad");
      }

      const { groups, pagination } = serviceResponse;

      const newOptions: ApplicabilityGroupOption[] = groups.map(
        (group: ApiGroup) => {
          const categoryLabel = group.category ? ` [${group.category}]` : "";
          const descriptionLabel = group.description ? ` - ${group.description}` : "";
          
          const groupDisplayName = `${group.name}${categoryLabel}${descriptionLabel}`.trim();

          return {
            value: group._id,
            label: groupDisplayName,
            groupData: group,
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
        err.message || "Error inesperado al cargar Grupos de Aplicabilidad";
      setError(errorMessage);
      return {
        options: [],
        hasMore: false,
      };
    }
  };

  const handleChange = (selectedOption: ApplicabilityGroupOption | ApplicabilityGroupOption[] | null) => {
    if (onChange) {
      onChange(selectedOption);
    }
  };

  return (
    <div>
      <AsyncPaginate<ApplicabilityGroupOption, any, PageAdditional>
        value={value}
        loadOptions={loadPageOptions}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        onChange={handleChange}
        isSearchable={true}
        isMulti={isMulti as any}
        placeholder={placeholder}
        loadingMessage={() => "Cargando Grupos de Aplicabilidad..."}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? "No se encontraron grupos" : "Escribe para buscar..."
        }
        debounceTimeout={350}
        className={className || "react-select-container"}
        classNamePrefix="react-select"
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {error && (
        <p style={{ color: "red", fontSize: "0.8em", marginTop: "5px" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default ApplicabilityGroupSelector; 