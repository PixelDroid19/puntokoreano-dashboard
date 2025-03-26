// src/pages/selectors/vehicle-manager/line-selector.tsx
import React, { useCallback } from "react";
import Select from "react-select/async";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLinesStart,
  fetchLinesSuccess,
  fetchLinesFailure,
  selectLines,
  selectLinesLoading,
  selectLinesError,
} from "../../../redux/reducers/LinesSlice";
import {
  LinesOption,
  LinesSelectorProps,
} from "../../../types/selectors.types";
import VehicleFamiliesService from "../../../services/vehicle-families.service";

const LineSelector: React.FC<LinesSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar Línea...",
  ...rest
}) => {
  const dispatch = useDispatch();
  const Lines = useSelector(selectLines) as LinesOption[];
  const loading = useSelector(selectLinesLoading);
  const error = useSelector(selectLinesError);

  const loadOptions = useCallback(
    async (inputValue: string) => {
      try {
        dispatch(fetchLinesStart());
        const response = await VehicleFamiliesService.getLines({
          page: 1,
          limit: 10,
          sortBy: "name",
          sortOrder: "asc",
          search: inputValue,
        });

        const LineOptions = response.lines.map((Line) => ({
          value: Line._id,
          label: Line.name,
          brand_id: Line.brand_id,
          features: Line.features,
          model_id: Line.model_id,
          price: Line.price,
        }));

        dispatch(fetchLinesSuccess(LineOptions));
        return LineOptions;
      } catch (error: any) {
        // Especifica el tipo de error
        console.error("Error loading Lines:", error);
        dispatch(
          fetchLinesFailure(error.message || "Error al cargar las líneas")
        );
        return [];
      }
    },
    [dispatch]
  );

  const handleInputChange = (inputValue: string) => {
    return inputValue;
  };

  const handleChange = (selectedOption: LinesOption | null) => {
    if (onChange) {
      onChange(selectedOption ? selectedOption.value : null);
    }
  };

  const getValue = () => {
    if (!value) {
      // console.log("getValue - Value prop is empty, returning null");
      return null;
    }

    if (!Lines || Lines.length === 0) {
      /*    console.log(
        "getValue - Lines array is empty or undefined, returning null"
      ); */
      return null;
    }

    const selectedLine = Lines.find((brand) => brand.value === value);

    if (selectedLine) {
      //  console.log("getValue - Found brand:", selectedLine);
      return selectedLine;
    } else {
      // console.log("getValue - Line NOT found for value:", value);
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
        noOptionsMessage={() => "No se encontraron Líneas"}
        loadingMessage={() => "Cargando Líneas..."}
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
          Error al cargar Líneas: {error}
        </p>
      )}
    </div>
  );
};

export default LineSelector;
