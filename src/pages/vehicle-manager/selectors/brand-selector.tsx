// src/pages/selectors/vehicle-manager/BrandSelector.tsx
import React, { useCallback } from "react";
import Select from "react-select/async";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrandsStart,
  fetchBrandsSuccess,
  fetchBrandsFailure,
  selectBrands,
  selectBrandsLoading,
  selectBrandsError,
} from "../../../redux/reducers/brandsSlice";
import {
  BrandOption,
  BrandSelectorProps,
} from "../../../types/selectors.types";

const BrandSelector: React.FC<BrandSelectorProps> = ({
  onChange,
  value,
  placeholder = "Buscar marca...",
  ...rest
}) => {
  const dispatch = useDispatch();
  const brands = useSelector(selectBrands) as BrandOption[];
  const loading = useSelector(selectBrandsLoading);
  const error = useSelector(selectBrandsError);

  const loadOptions = useCallback(
    async (inputValue: string) => {
      try {
        dispatch(fetchBrandsStart());
        const response = await VehicleFamiliesService.getBrands({
          page: 1,
          limit: 10, // Ajusta según necesidad
          sortBy: "name",
          sortOrder: "asc",
          search: inputValue,
        });
        const brandOptions = response.brands.map((brand) => ({
          value: brand._id,
          label: brand.name,
          country: brand.country,
        }));
        dispatch(fetchBrandsSuccess(brandOptions));
        return brandOptions;
      } catch (error: any) {
        // Especifica el tipo de error
        console.error("Error loading brands:", error);
        dispatch(fetchBrandsFailure(error.message || "Error al cargar marcas"));
        return [];
      }
    },
    [dispatch]
  );

  const handleInputChange = (inputValue: string) => {
    return inputValue;
  };

  const handleChange = (selectedOption: BrandOption | null) => {
    if (onChange) {
      onChange(selectedOption ? selectedOption.value : null);
    }
  };

  const getValue = () => {
    if (!value) {
     // console.log("getValue - Value prop is empty, returning null");
      return null; 
    }

    if (!brands || brands.length === 0) {
    /*   console.log(
        "getValue - Brands array is empty or undefined, returning null"
      ); */
      return null;
    }

    const selectedBrand = brands.find((brand) => brand.value === value);

    if (selectedBrand) {
      //console.log("getValue - Found brand:", selectedBrand);
      return selectedBrand;
    } else {
      //console.log("getValue - Brand NOT found for value:", value);
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
        noOptionsMessage={() => "No se encontraron marcas"}
        loadingMessage={() => "Cargando marcas..."}
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
          Error al cargar marcas: {error}
        </p>
      )}
    </div>
  );
};

export default BrandSelector;
