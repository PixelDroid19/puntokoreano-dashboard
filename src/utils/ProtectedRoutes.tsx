// src/routes/ProtectedRoutes.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { loginSuccess, logout } from "../redux/reducers/userSlice";
import { RootState, store } from "../redux/store"; 
import Loading from "../components/shared/loading/Loading.component";
import MainLayout from "../components/shared/layout/MainLayout.component";
import ENDPOINTS, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../api";
import { axiosInstance } from "./axios-interceptor";


const ProtectedRoutes = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { auth } = useSelector((state: RootState) => state.user);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAuthOnLoad = async () => {
      // Si ya estamos autenticados en Redux, no necesitamos verificar de nuevo
      if (auth) {
        setIsVerifying(false);
        return;
      }

      const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (!storedToken) {
        setIsVerifying(false);
        return;
      }

      try {
        // Usar el endpoint CHECK_SESSION que debería validar el token y devolver datos del usuario
        const response = await axiosInstance.get(ENDPOINTS.AUTH.CHECK_SESSION.url);

        if (response.data?.success && response.data?.data?.user) {
          // El token es válido, rehidratar el estado de Redux
          const { user, tokenExpires } = response.data.data; // Asume que check-session devuelve user y tokenExpires
          dispatch(
            loginSuccess({
              user: user,
              token: storedToken,
              // Usar expiración del backend o un default seguro (ej. 1 hora)
              expiresAt: tokenExpires || Date.now() + 3600 * 1000,
              auth: true,
            })
          );
        } else {
          // El endpoint respondió pero no fue exitoso o faltan datos
          console.warn(
            "Check session responded but was not successful or data missing."
          );
          // El interceptor de AuthService debería haber manejado 401/403,
          // pero por si acaso, limpiamos aquí también si la respuesta no es válida.
          // No llamamos a handleLogout directamente para evitar bucles si el error no fue 401/403.
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY); // Limpiar ambos si existe
          dispatch(logout());
        }
      } catch (error) {
        // El interceptor de AuthService debería haber manejado errores 401/403
        // y llamado a handleLogout (que a su vez llama a dispatch(logout)).
        // Si llegamos aquí, podría ser otro error (red, etc.) o el interceptor falló.
        console.error("Error during initial auth verification:", error);
        // Asegurarse de limpiar el estado si la verificación falla por cualquier motivo
        // y el interceptor no lo hizo (por ejemplo, si no fue un error 401/403).
        // Verificar si el logout ya ocurrió a través del estado de Redux es más seguro que usar store.getState() directamente aquí.
        // Nota: Acceder a store.getState() aquí puede no ser ideal en componentes,
        // verificar el estado 'auth' de Redux antes de despachar de nuevo podría ser una alternativa.
        // Sin embargo, si el interceptor ya limpió, el estado `auth` podría ya ser `false`.
        // Una opción segura es simplemente despachar logout si aún no está autenticado tras el error.
        // Si se usa store.getState(), asegurarse que 'store' esté importado correctamente.
        if (store.getState().user.auth) {
          // Verificar si el logout ya ocurrió vía store (si está disponible)
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          dispatch(logout());
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuthOnLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]); // Depender solo de 'dispatch'. 'auth' se usa solo para la optimización inicial.

  if (isVerifying) {
    return <Loading />;
  }

  if (!auth) {
    // Guardar la ruta a la que se intentaba acceder para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default ProtectedRoutes;
