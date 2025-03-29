// src/pages/selectors/vehicle-manager/TransmissionSelector.tsx
import React, { useState } from "react";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import {
  TransmissionsOption, // Use the enhanced option type
  TransmissionSelectorProps,
} from "../../../types/selectors.types"; // Adjust path if needed

// --- Define API types here or import them ---
interface ApiTransmission {
  _id: string;
  name: string;
  gears?: number;
  // Add other potential fields from your API
  [key: string]: any;
}

interface TransmissionApiData {
  transmissions: ApiTransmission[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Adjust this based on your actual API response structure
// Option 1: Response includes success/data wrapper
interface TransmissionApiResponse {
  success: boolean;
  message?: string;
  data?: TransmissionApiData;
}
// Option 2: Response is directly the data
// type TransmissionApiResponse = TransmissionApiData;

interface PageAdditional {
  page: number;
}
// --- End of Type Definitions ---

const TransmissionSelector: React.FC<TransmissionSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar transmisión...", // Updated placeholder
  ...rest
}) => {
  const [error, setError] = useState<string | null>(null);

  const loadPageOptions: LoadOptions<
    TransmissionsOption,
    any, // Replace 'any' with your Group type if using grouped options, e.g., GroupBase<TransmissionsOption>
    PageAdditional
  > = async (
    search,
    loadedOptions, // Not typically used in basic pagination but available
    additional
  ): Promise<{
    options: TransmissionsOption[];
    hasMore: boolean;
    additional?: PageAdditional;
  }> => {
    const pageToLoad = additional?.page || 1;
    const limit = 10; // Or your desired page size

    setError(null); // Reset error on new load attempt

    try {
      // Assuming getTransmissions accepts pagination and search params
      // Adjust the call and response handling based on your actual service method and API structure
      const serviceResponse: TransmissionApiResponse | TransmissionApiData =
        await VehicleFamiliesService.getTransmissions({
          page: pageToLoad,
          limit: limit,
          sortBy: "name", // Or desired sorting
          sortOrder: "asc",
          search: search,
        });

      console.log(
        "Respuesta RECIBIDA del servicio (Transmissions):",
        serviceResponse
      );

      // *** IMPORTANT: Adapt the following based on your actual API response structure ***
      // Example for structure { success: boolean, data: { transmissions: [], pagination: {} } }
      const responseData: TransmissionApiData | null | undefined =
        (serviceResponse as TransmissionApiResponse)?.data ??
        // Example for structure { transmissions: [], pagination: {} }
        (serviceResponse as TransmissionApiData);

      // Validate the received data structure
      if (
        !responseData ||
        !Array.isArray(responseData.transmissions) ||
        !responseData.pagination
      ) {
        console.error(
          "Formato de datos de API inválido (Transmissions):",
          responseData
        );
        const apiMessage = (serviceResponse as TransmissionApiResponse)
          ?.message;
        throw new Error(
          apiMessage ||
            "Formato de datos inválido de la API de transmisiones"
        );
      }
      // *** End of Structure Adaptation ***

      const { transmissions, pagination } = responseData;

      const newOptions: TransmissionsOption[] = transmissions.map(
        (transmission: ApiTransmission) => ({
          value: transmission._id,
          label: `${transmission.name}${
            transmission.gears ? ` (${transmission.gears} Vel.)` : ""
          }`, // Example label enhancement
          gears: transmission.gears,
          transmissionData: transmission, // Store the full data
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
      console.error("Error en loadPageOptions (Transmissions):", err);
      const errorMessage =
        err.message || "Error inesperado al cargar las transmisiones";
      setError(errorMessage);

      // Return empty result on error
      return {
        options: [],
        hasMore: false,
      };
    }
  };

  // No need for separate handleInputChange with AsyncPaginate
  // No need for custom getValue function

  // The handleChange function now receives the full option object or null
  const handleChange = (
    selectedOption: TransmissionsOption | null
  ) => {
    // Pass the full selected option (or null) to the parent component's onChange handler
    if (onChange) {
      onChange(selectedOption);
    }
  };

  return (
    <div>
      <AsyncPaginate<TransmissionsOption, any, PageAdditional>
        value={value} // Pass the full option object directly
        loadOptions={loadPageOptions}
        getOptionValue={(option) => option.value} // How to get the value from an option
        getOptionLabel={(option) => option.label} // How to get the label from an option
        onChange={handleChange} // Use the updated handler
        isSearchable={true}
        placeholder={placeholder}
        loadingMessage={() => "Cargando transmisiones..."} // Updated message
        noOptionsMessage={({ inputValue }) =>
          inputValue
            ? "No se encontraron transmisiones" // Updated message
            : "Escribe para buscar..."
        }
        debounceTimeout={350} // Add debounce like in ModelSelector
        className="react-select-container" // Keep styling consistent
        classNamePrefix="react-select"
        {...rest} // Spread remaining props
      />

      {/* Display local error state */}
      {error && (
        <p style={{ color: "red", fontSize: "0.8em", marginTop: "5px" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default TransmissionSelector;