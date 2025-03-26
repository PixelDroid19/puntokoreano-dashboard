// src/redux/reducers/TransmissionsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TransmissionsOption } from "../../types/selectors.types";

interface TransmissionsState {
  transmissions: TransmissionsOption[];
  loading: boolean;
  error: string | null;
}

const initialState: TransmissionsState = {
  transmissions: [],
  loading: false,
  error: null,
};

const TransmissionsSlice = createSlice({
  name: "transmissions",
  initialState,
  reducers: {
    fetchTransmissionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTransmissionsSuccess: (
      state,
      action: PayloadAction<TransmissionsOption[]>
    ) => {
      state.transmissions = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchTransmissionsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.transmissions = [];
    },
    clearTransmissions: (state) => {
      state.transmissions = [];
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  fetchTransmissionsStart,
  fetchTransmissionsSuccess,
  fetchTransmissionsFailure,
  clearTransmissions,
} = TransmissionsSlice.actions;

export const selectTransmissions = (state: {
  transmissions: TransmissionsState;
}) => state.transmissions?.transmissions;
export const selectTransmissionsLoading = (state: {
  transmissions: TransmissionsState;
}) => state.transmissions?.loading;
export const selectTransmissionsError = (state: {
  transmissions: TransmissionsState;
}) => state.transmissions?.error;

export default TransmissionsSlice.reducer;
