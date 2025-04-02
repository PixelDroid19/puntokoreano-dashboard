// src/routes/PublicRoutes.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { loginSuccess, logout } from "../redux/reducers/userSlice";
import { RootState, store } from "../redux/store";
import Loading from "../components/shared/loading/Loading.component";
import ENDPOINTS, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../api";
import { axiosInstance } from "./axios-interceptor";


const PublicRoutes = () => {
  const dispatch = useDispatch();
  const { auth } = useSelector((state: RootState) => state.user);

  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyExistingAuth = async () => {
      // Optimización: Si Redux ya indica autenticación, evitar llamada API innecesaria.
      if (auth) {
        setIsVerifying(false);
        return;
      }

      const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (!storedToken) {
        setIsVerifying(false);
        return;
      }

      // Hay un token, intentar verificarlo usando la instancia 'api' para activar interceptors.
      try {
        const response = await axiosInstance.get(ENDPOINTS.AUTH.CHECK_SESSION.url);

        if (response.data?.success && response.data?.data?.user) {
          // Token válido: rehidratar estado de Redux.
          const { user, tokenExpires } = response.data.data;
          dispatch(
            loginSuccess({
              user: user,
              token: storedToken,
              // Usar expiración del backend o un default seguro.
              expiresAt: tokenExpires || Date.now() + 3600 * 1000,
              auth: true,
            })
          );
          // La redirección se manejará fuera del effect basado en el estado 'auth' actualizado.
        } else {
          // Respuesta no exitosa o datos faltantes: considerar token inválido y limpiar.
          console.warn(
            "PublicRoutes: Check session responded but was not successful or data missing."
          );
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          dispatch(logout());
        }
      } catch (error) {
        // El interceptor debería manejar 401/403 y limpiar estado/storage.
        // Otros errores (red, etc.) impiden verificar; asumir no autenticado.
        console.error("Error during public route auth verification:", error);
        // Limpieza defensiva si la verificación falla y el interceptor no limpió (ej. error no fue 401/403).
        if (store.getState().user.auth) {
          // Verificar si el logout ya ocurrió (requiere importar 'store')
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          dispatch(logout());
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyExistingAuth();
  }, [dispatch]);

  if (isVerifying) {
    return <Loading />;
  }

  if (auth) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoutes;
