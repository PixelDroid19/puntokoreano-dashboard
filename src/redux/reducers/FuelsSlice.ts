// src/redux/reducers/FuelsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FuelsOption } from "../../types/selectors.types";

interface FuelsState {
  fuels: FuelsOption[];
  loading: boolean;
  error: string | null;
}

const initialState: FuelsState = {
  fuels: [],
  loading: false,
  error: null,
};

const FuelsSlice = createSlice({
  name: "fuels",
  initialState,
  reducers: {
    fetchFuelsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFuelsSuccess: (state, action: PayloadAction<FuelsOption[]>) => {
      // Payload is now FuelOption[]
      state.fuels = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchFuelsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.fuels = [];
    },
    clearFuels: (state) => {
      state.fuels = [];
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  fetchFuelsStart,
  fetchFuelsSuccess,
  fetchFuelsFailure,
  clearFuels,
} = FuelsSlice.actions;

export const selectFuels = (state: { fuels: FuelsState }) =>
  state.fuels?.fuels; // Selector now returns FuelOption[]
export const selectFuelsLoading = (state: { fuels: FuelsState }) =>
  state.fuels?.loading;
export const selectFuelsError = (state: { fuels: FuelsState }) =>
  state.fuels?.error;

export default FuelsSlice.reducer;
