// src/redux/reducers/brandsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { BrandOption } from "../../types/selectors.types";

// Keep Brand interface as it is, representing the raw data from the API
interface Brand {
  _id: string;
  name: string;
  country?: string;
}

interface BrandsState {
  brands: BrandOption[]; // Use BrandOption here to align with the data structure in BrandSelector
  loading: boolean;
  error: string | null;
}

const initialState: BrandsState = {
  brands: [],
  loading: false,
  error: null,
};

const brandsSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {
    fetchBrandsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBrandsSuccess: (state, action: PayloadAction<BrandOption[]>) => { // Payload is now BrandOption[]
      state.brands = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchBrandsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.brands = [];
    },
    clearBrands: (state) => {
      state.brands = [];
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  fetchBrandsStart,
  fetchBrandsSuccess,
  fetchBrandsFailure,
  clearBrands,
} = brandsSlice.actions;

export const selectBrands = (state: { brands: BrandsState }) =>
    state.brands.brands; // Selector now returns BrandOption[]
  export const selectBrandsLoading = (state: { brands: BrandsState }) =>
    state.brands.loading;
  export const selectBrandsError = (state: { brands: BrandsState }) =>
    state.brands.error;

export default brandsSlice.reducer;