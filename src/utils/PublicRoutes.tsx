// src/routes/PublicRoutes.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { login } from '../redux/reducers/userSlice';
import Loading from '../components/shared/loading/Loading.component';

const PublicRoutes = () => {
  const dispatch = useDispatch();
  const { auth } = useSelector((state: Record<string, any>) => state.user);
  
  // Estado local para controlar la carga y errores
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Obtener token del localStorage
  const token = localStorage.getItem('auth_dashboard_token');

  // Mutación para verificar autenticación
  const authMutation = useMutation({
    mutationFn: async () => {
      // Solo hacer la llamada CSRF si es necesario (puede configurarse según el backend)
      // await axios.get(`${import.meta.env.VITE_API_REST_URL}/sanctum/csrf-cookie`);
      
      return axios.get(
        `${import.meta.env.VITE_API_REST_URL}/api/dashboard/user-profile`,
        { 
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    },
    onSuccess: ({ data }) => {
      dispatch(login({ 
        ...data.user, 
        auth: true, 
        auth_dashboard_token: token 
      }));
    },
    onSettled: () => {
      setIsLoading(false);
      setAuthChecked(true);
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      // Solo verificar si hay token y no está autenticado
      if (token && !auth && !authChecked) {
        setIsLoading(true);
        await authMutation.mutateAsync();
      } else {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [token, auth, authChecked]);

  // Mostrar loading solo durante la verificación inicial
  if (isLoading) {
    return <Loading />;
  }

  // Una vez verificada la autenticación, redirigir según corresponda
  if (authChecked) {
    return auth ? <Navigate to="/dashboard" replace /> : <Outlet />;
  }

  // Fallback loading mientras se verifica el estado
  return <Loading />;
};

export default PublicRoutes;