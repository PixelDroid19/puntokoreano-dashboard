import { createSlice } from "@reduxjs/toolkit"

const init = {
    item: "Resumen",
    drawer: false,
    pathname: ""
}

const navSlice = createSlice({
    name: "nav",
    initialState: init,
    reducers: {
        setDrawer: (state, action) => {
            const { open } = action.payload;
            state.drawer = open
        },
        setRoute: (state, action) => {
            const { pathname } = action.payload;
            switch (pathname) {
                case '/dashboard':
                    state.item = 'Resumen'
                    state.pathname = '/dashboard'
                    break;
                case '/products':
                case '/products/add':
                    state.item = 'Productos'
                    state.pathname = '/products'
                    break;
                case '/images':
                    case '/images/add':
                    state.item = 'Imagenes'
                    state.pathname = '/images'
                    break;
                default:
                    state.item = '';
                    state.pathname = '';
                    break;
            }
        }
    }
});

export const { setDrawer, setRoute } = navSlice.actions;
export default navSlice.reducer;