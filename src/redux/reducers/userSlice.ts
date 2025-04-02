// src/redux/reducers/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../api";
import { RootState } from "../store";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface UserState {
  user: UserData | null;
  accessToken: string | null;
  expiresAt: number | null;
  auth: boolean;
}

const initialState: UserState = {
  user: null,
  accessToken: null,
  expiresAt: null,
  auth: false,
};

interface LoginSuccessPayload {
  user: UserData;
  token: string;
  expiresAt: number;
  auth: boolean;
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<LoginSuccessPayload>) => {
      const { user, token, expiresAt, auth } = action.payload;

      state.user = user;
      state.accessToken = token;
      state.expiresAt = expiresAt;
      state.auth = auth;

      // Persistir Access Token en localStorage
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.expiresAt = null;
      state.auth = false;

      // Limpiar tokens de localStorage (Aunque AuthService.handleLogout también lo hace,
      // es bueno asegurar la limpieza desde Redux como medida defensiva)
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem("refreshTokenExpiresAt"); // Limpiar también si se usa
    },
    // Acción para actualizar solo el token y su expiración (ej. después de un refresh)
    updateToken: (
      state,
      action: PayloadAction<{ token: string; expiresAt: number }>
    ) => {
      state.accessToken = action.payload.token;
      state.expiresAt = action.payload.expiresAt;
      // Importante: No modificar state.auth ni state.user aquí, solo el token
      if (action.payload.token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, action.payload.token);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    },
  },
});

export const { loginSuccess, logout, updateToken } = userSlice.actions;
export default userSlice.reducer;
export const selectAccessToken = (state: RootState) => state.user.accessToken;

// Puedes exportar selectores específicos si los necesitas en varios componentes
// export const selectCurrentUser = (state: RootState) => state.user.user;
// export const selectIsAuthenticated = (state: RootState) => state.user.auth;
// export const selectAccessToken = (state: RootState) => state.user.accessToken;
