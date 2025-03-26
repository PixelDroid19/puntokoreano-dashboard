// src/pages/selectors/vehicle-manager/ModelSelector.tsx
import React, { useCallback } from "react";
import Select from "react-select/async";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchModelsStart,
  fetchModelsSuccess,
  fetchModelsFailure,
  selectModels,
  selectModelsLoading,
  selectModelsError,
} from "../../../redux/reducers/ModelsSlice";
import {
  ModelsOption,
  ModelSelectorProps,
} from "../../../types/selectors.types";
import VehicleFamiliesService from "../../../services/vehicle-families.service";

const ModelSelector: React.FC<ModelSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar Modelo...",
  ...rest
}) => {
  const dispatch = useDispatch();
  const Models = useSelector(selectModels) as ModelsOption[];
  const loading = useSelector(selectModelsLoading);
  const error = useSelector(selectModelsError);

  const loadOptions = useCallback(
    async (inputValue: string) => {
      try {
        dispatch(fetchModelsStart());
        const response = await VehicleFamiliesService.getModels({
          page: 1,
          limit: 10,
          sortBy: "name",
          sortOrder: "asc",
          search: inputValue,
        });

        const ModelOptions = response.models.map((Model) => ({
          value: Model._id,
          label: Model.name,
          brand_id: Model.brand_id,
          family_id: Model.family_id,
          engineType: Model.engineType,
          year: Model.year,
          active: Model.active,
        }));

        dispatch(fetchModelsSuccess(ModelOptions));
        return ModelOptions;
      } catch (error: any) {
        // Especifica el tipo de error
        console.error("Error loading Models:", error);
        dispatch(fetchModelsFailure(error.message || "Error al cargar modelos"));
        return [];
      }
    },
    [dispatch]
  );

  const handleInputChange = (inputValue: string) => {
    return inputValue;
  };

  const handleChange = (selectedOption: ModelsOption | null) => {
    if (onChange) {
      onChange(selectedOption ? selectedOption.value : null);
    }
  };

  const getValue = () => {
    if (!value) {
      // console.log("getValue - Value prop is empty, returning null");
      return null;
    }

    if (!Models || Models.length === 0) {
      /*    console.log(
        "getValue - Models array is empty or undefined, returning null"
      ); */
      return null;
    }

    const selectedModel = Models.find((brand) => brand.value === value);

    if (selectedModel) {
      //  console.log("getValue - Found brand:", selectedModel);
      return selectedModel;
    } else {
      // console.log("getValue - Model NOT found for value:", value);
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
        noOptionsMessage={() => "No se encontraron Modelos"}
        loadingMessage={() => "Cargando Modelos..."}
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
          Error al cargar Modelos: {error}
        </p>
      )}
    </div>
  );
};

export default ModelSelector;
