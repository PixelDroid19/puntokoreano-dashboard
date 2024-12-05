// src/services/auth.service.ts
import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/reducers/userSlice';
// Crear instancia de axios
const api = axios.create({
    baseURL: import.meta.env.VITE_API_REST_URL,
});
// Setup interceptors
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_dashboard_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
        AuthService.handleLogout();
    }
    return Promise.reject(error);
});
class AuthService {
    static async login(credentials) {
        return api.post('/auth/dashboard/login', credentials);
    }
    static async verifyToken() {
        try {
            const token = localStorage.getItem('auth_dashboard_token');
            if (!token)
                return false;
            const response = await api.get('/api/dashboard/user-profile');
            return response.status === 200;
        }
        catch {
            return false;
        }
    }
    static async handleLogout() {
        try {
            const token = localStorage.getItem('auth_dashboard_token');
            if (token) {
                await api.get('/api/dashboard/logout');
            }
        }
        catch (error) {
            console.error('Error during logout:', error);
        }
        finally {
            store.dispatch(logout());
            window.location.href = '/login';
        }
    }
}
export default AuthService;
export { api };
