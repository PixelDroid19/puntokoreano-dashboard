// src/redux/reducers/LinesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LinesOption } from "../../types/selectors.types";

interface LinesState {
  lines: LinesOption[];
  loading: boolean;
  error: string | null;
}

const initialState: LinesState = {
  lines: [],
  loading: false,
  error: null,
};

const LinesSlice = createSlice({
  name: "lines",
  initialState,
  reducers: {
    fetchLinesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchLinesSuccess: (state, action: PayloadAction<LinesOption[]>) => {
      state.lines = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchLinesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.lines = [];
    },
    clearLines: (state) => {
      state.lines = [];
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  fetchLinesStart,
  fetchLinesSuccess,
  fetchLinesFailure,
  clearLines,
} = LinesSlice.actions;

export const selectLines = (state: { lines: LinesState }) => state.lines?.lines;
export const selectLinesLoading = (state: { lines: LinesState }) =>
  state.lines?.loading;
export const selectLinesError = (state: { lines: LinesState }) =>
  state.lines?.error;

export default LinesSlice.reducer;
