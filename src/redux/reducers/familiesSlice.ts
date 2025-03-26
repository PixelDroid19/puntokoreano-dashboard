// src/redux/reducers/familiesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FamilieOption } from "../../types/selectors.types";

interface FamilysState {
  families: FamilieOption[]; // Use FamilyOption here to align with the data structure in FamilySelector
  loading: boolean;
  error: string | null;
}

const initialState: FamilysState = {
  families: [],
  loading: false,
  error: null,
};

const familiesSlice = createSlice({
  name: "families",
  initialState,
  reducers: {
    fetchFamilysStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFamilysSuccess: (state, action: PayloadAction<FamilieOption[]>) => { // Payload is now FamilyOption[]
      state.families = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchFamilysFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.families = [];
    },
    clearFamilys: (state) => {
      state.families = [];
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  fetchFamilysStart,
  fetchFamilysSuccess,
  fetchFamilysFailure,
  clearFamilys,
} = familiesSlice.actions;

export const selectFamilys = (state: { families: FamilysState }) =>
    state.families?.families; // Selector now returns FamilyOption[]
  export const selectFamilysLoading = (state: { families: FamilysState }) =>
    state.families?.loading;
  export const selectFamilysError = (state: { families: FamilysState }) =>
    state.families?.error;

export default familiesSlice.reducer;