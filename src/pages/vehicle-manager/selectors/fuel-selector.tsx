// src/pages/selectors/vehicle-manager/FuelSelector.tsx
import React, { useCallback } from "react";
import Select from "react-select/async";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFuelsStart,
  fetchFuelsSuccess,
  fetchFuelsFailure,
  selectFuels,
  selectFuelsLoading,
  selectFuelsError,
} from "../../../redux/reducers/FuelsSlice";
import { FuelsOption, FuelSelectorProps } from "../../../types/selectors.types";
import VehicleFamiliesService from "../../../services/vehicle-families.service";

const FuelSelector: React.FC<FuelSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar combustible...",
  ...rest
}) => {
  const dispatch = useDispatch();
  const Fuels = useSelector(selectFuels) as FuelsOption[];
  const loading = useSelector(selectFuelsLoading);
  const error = useSelector(selectFuelsError);

  const loadOptions = useCallback(
    async (inputValue: string) => {
      try {
        dispatch(fetchFuelsStart());
        const response = await VehicleFamiliesService.getFuels({
          page: 1,
          limit: 10,
          sortBy: "name",
          sortOrder: "asc",
          search: inputValue,
        });

        const FuelOptions = response.fuels.map((fuel) => ({
          value: fuel._id,
          label: `${fuel.name} (${fuel.octane_rating})`,
          octane_rating: fuel.octane_rating,
        }));

        dispatch(fetchFuelsSuccess(FuelOptions));
        return FuelOptions;
      } catch (error: any) {
        // Especifica el tipo de error
        console.error("Error loading Fuels:", error);
        dispatch(
          fetchFuelsFailure(error.message || "Error al cargar combustibles")
        );
        return [];
      }
    },
    [dispatch]
  );

  const handleInputChange = (inputValue: string) => {
    return inputValue;
  };

  const handleChange = (selectedOption: FuelsOption | null) => {
    if (onChange) {
      onChange(selectedOption ? selectedOption.value : null);
    }
  };

  const getValue = () => {
    if (!value) {
      // console.log("getValue - Value prop is empty, returning null");
      return null;
    }

    if (!Fuels || Fuels.length === 0) {
      /*    console.log(
        "getValue - Fuels array is empty or undefined, returning null"
      ); */
      return null;
    }

    const selectedFuel = Fuels.find((fuel) => fuel.value === value);

    if (selectedFuel) {
      //  console.log("getValue - Found fuel:", selectedFuel);
      return selectedFuel;
    } else {
      // console.log("getValue - fuel NOT found for value:", value);
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

export default FuelSelector;
