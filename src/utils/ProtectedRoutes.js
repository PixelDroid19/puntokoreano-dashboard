import { jsx as _jsx } from "react/jsx-runtime";
// src/routes/ProtectedRoutes.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { login } from "../redux/reducers/userSlice";
import Loading from "../components/shared/loading/Loading.component";
import MainLayout from "../components/shared/layout/MainLayout.component";
const ProtectedRoutes = () => {
    const dispatch = useDispatch();
    const { auth } = useSelector((state) => state.user);
    // Estado local para control de carga y verificación
    const [isLoading, setIsLoading] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    // Obtener token del localStorage
    const token = localStorage.getItem("auth_dashboard_token");
    // Mutación para verificar autenticación
    const authMutation = useMutation({
        mutationFn: async () => {
            return axios.get(`${import.meta.env.VITE_API_REST_URL}/api/dashboard/user-profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: ({ data }) => {
            dispatch(login({
                ...data.user,
                auth: true,
                auth_dashboard_token: token,
            }));
        },
        onError: () => {
            // En caso de error, limpiar el token inválido
            localStorage.removeItem("auth_dashboard_token");
        },
        onSettled: () => {
            setIsLoading(false);
            setAuthChecked(true);
        },
    });
    useEffect(() => {
        const verifyAuth = async () => {
            // Verificar solo si hay token y no está autenticado
            if (token && !auth && !authChecked) {
                setIsLoading(true);
                await authMutation.mutateAsync();
            }
            else {
                setAuthChecked(true);
            }
        };
        verifyAuth();
    }, [token, auth, authChecked]);
    // Mostrar loading durante la verificación inicial
    if (isLoading) {
        return _jsx(Loading, {});
    }
    // Una vez verificada la autenticación, redirigir o mostrar contenido
    if (authChecked) {
        if (!auth) {
            return _jsx(Navigate, { to: "/login", replace: true });
        }
        return (_jsx(MainLayout, { children: _jsx(Outlet, {}) }));
    }
    // Fallback loading mientras se verifica el estado
    return _jsx(Loading, {});
};
export default ProtectedRoutes;
