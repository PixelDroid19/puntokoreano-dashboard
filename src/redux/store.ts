// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userSlice";
import navReducer from "./reducers/navSlice";
import brandsReducer from "./reducers/brandsSlice";
import familiesReducer from "./reducers/familiesSlice";
import modelsReducer from "./reducers/ModelsSlice";
import fuelsSlice from "./reducers/FuelsSlice";
import transmissionsSlice from "./reducers/TransmissionsSlice";
import LinesSlice from "./reducers/LinesSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    nav: navReducer,
    brands: brandsReducer,
    families: familiesReducer,
    models: modelsReducer,
    fuels: fuelsSlice,
    transmissions: transmissionsSlice,
    lines: LinesSlice,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Exportar tipos
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
