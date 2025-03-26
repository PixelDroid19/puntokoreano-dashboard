// src/pages/selectors/vehicle-manager/TransmissionSelector.tsx
import React, { useCallback } from "react";
import Select from "react-select/async";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTransmissionsStart,
  fetchTransmissionsSuccess,
  fetchTransmissionsFailure,
  selectTransmissions,
  selectTransmissionsLoading,
  selectTransmissionsError,
} from "../../../redux/reducers/TransmissionsSlice";
import {
  TransmissionsOption,
  TransmissionSelectorProps,
} from "../../../types/selectors.types";
import VehicleFamiliesService from "../../../services/vehicle-families.service";

const TransmissionSelector: React.FC<TransmissionSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar combustible...",
  ...rest
}) => {
  const dispatch = useDispatch();
  const Transmissions = useSelector(
    selectTransmissions
  ) as TransmissionsOption[];
  const loading = useSelector(selectTransmissionsLoading);
  const error = useSelector(selectTransmissionsError);

  const loadOptions = useCallback(
    async (inputValue: string) => {
      try {
        dispatch(fetchTransmissionsStart());
        const response = await VehicleFamiliesService.getTransmissions({
          page: 1,
          limit: 10,
          sortBy: "name",
          sortOrder: "asc",
          search: inputValue,
        });

        const TransmissionOptions = response.transmissions.map(
          (transmission) => ({
            value: transmission._id,
            label: `${transmission.name}`,
            gears: transmission.gears,
          })
        );

        dispatch(fetchTransmissionsSuccess(TransmissionOptions));
        return TransmissionOptions;
      } catch (error: any) {
        // Especifica el tipo de error
        console.error("Error loading Transmissions:", error);
        dispatch(
          fetchTransmissionsFailure(
            error.message || "Error al cargar combustibles"
          )
        );
        return [];
      }
    },
    [dispatch]
  );

  const handleInputChange = (inputValue: string) => {
    return inputValue;
  };

  const handleChange = (selectedOption: TransmissionsOption | null) => {
    if (onChange) {
      onChange(selectedOption ? selectedOption.value : null);
    }
  };

  const getValue = () => {
    if (!value) {
      // console.log("getValue - Value prop is empty, returning null");
      return null;
    }

    if (!Transmissions || Transmissions.length === 0) {
      /*    console.log(
        "getValue - Transmissions array is empty or undefined, returning null"
      ); */
      return null;
    }

    const selectedTransmission = Transmissions.find(
      (transmission) => transmission.value === value
    );

    if (selectedTransmission) {
      //  console.log("getValue - Found transmission:", selectedTransmission);
      return selectedTransmission;
    } else {
      // console.log("getValue - transmission NOT found for value:", value);
      return null;
    }
  };

  return (
    <div>
      <Select
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        placeholder={placeholder}
        noOptionsMessage={() => "No se encontraron combustibles"}
        loadingMessage={() => "Cargando combustible..."}
        onInputChange={handleInputChange}
        onChange={handleChange}
        value={getValue()}
        isLoading={loading}
        className="react-select-container"
        classNamePrefix="react-select"
        {...rest}
      />
      {error && (
        <p style={{ color: "red", fontSize: "0.8em", marginTop: "5px" }}>
          Error al cargar combustible: {error}
        </p>
      )}
    </div>
  );
};

export default TransmissionSelector;
