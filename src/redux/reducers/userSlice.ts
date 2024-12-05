// src/redux/reducers/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: string;
  name: string;
  email: string;
  role: string;
  auth_dashboard_token: string;
  auth: boolean;
}

// Obtener estado inicial
const getInitialState = (): UserState => {
  const userData = localStorage.getItem("user_data");
  return userData
    ? JSON.parse(userData)
    : {
        id: "",
        name: "",
        email: "",
        role: "",
        auth_dashboard_token: "",
        auth: false,
      };
};

const userSlice = createSlice({
  name: "user",
  initialState: getInitialState(),
  reducers: {
    login: (state, action: PayloadAction<any>) => {
      const userData = {
        id: action.payload.user._id,
        name: action.payload.user.name,
        email: action.payload.user.email,
        role: action.payload.user.role,
        auth_dashboard_token: action.payload.token,
        auth: action.payload.auth,
      };

      // Actualizar estado
      Object.assign(state, userData);

      // Persistir datos
      localStorage.setItem("user_data", JSON.stringify(userData));
      localStorage.setItem(
        "auth_dashboard_token",
        userData.auth_dashboard_token
      );
    },
    logout: (state) => {
      // Limpiar estado
      state.id = "";
      state.name = "";
      state.email = "";
      state.role = "";
      state.auth_dashboard_token = "";
      state.auth = false;

      // Limpiar storage
      localStorage.removeItem("user_data");
      localStorage.removeItem("auth_dashboard_token");
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
