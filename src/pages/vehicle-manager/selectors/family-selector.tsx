// src/pages/selectors/vehicle-manager/FamilySelector.tsx
import React, { useCallback } from "react";
import Select from "react-select/async";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFamilysStart,
  fetchFamilysSuccess,
  fetchFamilysFailure,
  selectFamilys,
  selectFamilysLoading,
  selectFamilysError,
} from "../../../redux/reducers/familiesSlice";
import {
  FamilieOption,
  FamilieSelectorProps,
} from "../../../types/selectors.types";

const FamilySelector: React.FC<FamilieSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar Familia...",
  ...rest
}) => {
  const dispatch = useDispatch();
  const families = useSelector(selectFamilys) as FamilieOption[];
  const loading = useSelector(selectFamilysLoading);
  const error = useSelector(selectFamilysError);

  const loadOptions = useCallback(
    async (inputValue: string) => {
      try {
        dispatch(fetchFamilysStart());
        const response = await VehicleFamiliesService.getFamilies({
          page: 1,
          limit: 10, 
          sortBy: "name",
          sortOrder: "asc",
          search: inputValue,
        });

        const familyOptions = response.families.map((family) => ({
          value: family._id,
          label: family.name,
          brand_id: family.brand_id,
        }));
        dispatch(fetchFamilysSuccess(familyOptions));
        return familyOptions;
      } catch (error: any) {
        // Especifica el tipo de error
        console.error("Error loading families:", error);
        dispatch(
          fetchFamilysFailure(error.message || "Error al cargar Familias")
        );
        return [];
      }
    },
    [dispatch]
  );

  const handleInputChange = (inputValue: string) => {
    return inputValue;
  };

  const handleChange = (selectedOption: FamilieOption | null) => {
    if (onChange) {
      onChange(selectedOption ? selectedOption.value : null);
    }
  };

  const getValue = () => {
    if (!value) {
     // console.log("getValue - Value prop is empty, returning null");
      return null;
    }

    if (!families || families.length === 0) {
   /*    console.log(
        "getValue - Familys array is empty or undefined, returning null"
      ); */
      return null;
    }

    const selectedFamily = families.find((brand) => brand.value === value);

    if (selectedFamily) {
    //  console.log("getValue - Found brand:", selectedFamily);
      return selectedFamily;
    } else {
     // console.log("getValue - Family NOT found for value:", value);
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
        noOptionsMessage={() => "No se encontraron familias"}
        loadingMessage={() => "Cargando familias..."}
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
          Error al cargar Familias: {error}
        </p>
      )}
    </div>
  );
};

export default FamilySelector;
