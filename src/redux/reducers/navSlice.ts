import { createSlice } from "@reduxjs/toolkit";

const init = {
  item: "Resumen",
  drawer: false,
  pathname: "",
};

const navSlice = createSlice({
  name: "nav",
  initialState: init,
  reducers: {
    setDrawer: (state, action) => {
      const { open } = action.payload;
      state.drawer = open;
    },
    setRoute: (state, action) => {
      const { pathname } = action.payload;
      switch (pathname) {
        case "/dashboard":
          state.item = "Resumen";
          state.pathname = "/dashboard";
          break;
        case "/products":
        case "/products/add":
          state.item = "Productos";
          state.pathname = "/products";
          break;
        case "/image-manager":
        case "/image-manager/add":
          state.item = "Imagenes";
          state.pathname = "/image-manager";
          break;
        case "/orders":
          state.item = "Pedidos";
          state.pathname = "/orders";
          break;
        case "/users":
          state.item = "Usuarios";
          state.pathname = "/users";
          break;
        case "/blogs":
          state.item = "Blogs";
          state.pathname = "/blogs";
          break;
        case "/reviews":
          state.item = "Reseñas";
          state.pathname = "/reviews";
          break;
        case "/shipping-settings":
          state.item = "Configuración de Envíos";
          state.pathname = "/settings-shipping";
          break;
        case "/settings-billing":
          state.item = "Configuración de Facturación";
          state.pathname = "/settings-billing";
          break;
        default:
          state.item = "";
          state.pathname = "";
          break;
      }
    },
  },
});

export const { setDrawer, setRoute } = navSlice.actions;
export default navSlice.reducer;
