// src/redux/reducers/ModelsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ModelsOption } from "../../types/selectors.types";

interface ModelsState {
  models: ModelsOption[];
  loading: boolean;
  error: string | null;
}

const initialState: ModelsState = {
  models: [],
  loading: false,
  error: null,
};

const ModelsSlice = createSlice({
  name: "models",
  initialState,
  reducers: {
    fetchModelsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchModelsSuccess: (state, action: PayloadAction<ModelsOption[]>) => {
      // Payload is now ModelOption[]
      state.models = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchModelsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.models = [];
    },
    clearModels: (state) => {
      state.models = [];
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  fetchModelsStart,
  fetchModelsSuccess,
  fetchModelsFailure,
  clearModels,
} = ModelsSlice.actions;

export const selectModels = (state: { models: ModelsState }) =>
  state.models?.models; // Selector now returns ModelOption[]
export const selectModelsLoading = (state: { models: ModelsState }) =>
  state.models?.loading;
export const selectModelsError = (state: { models: ModelsState }) =>
  state.models?.error;

export default ModelsSlice.reducer;
