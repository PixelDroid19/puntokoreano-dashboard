// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userSlice";
import navReducer from "./reducers/navSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        nav: navReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        }),
})

// Exportar tipos
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;