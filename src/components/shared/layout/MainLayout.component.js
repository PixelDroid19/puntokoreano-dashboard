import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Breadcrumb, Button, Drawer, Flex, Layout, Tooltip } from 'antd';
import '/src/pages/dashboard/Dashboard.styles.css';
import { Content } from 'antd/es/layout/layout';
import { useDispatch, useSelector } from 'react-redux';
import { LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../../redux/reducers/userSlice';
import React from 'react';
import { useMediaQuery } from 'react-responsive';
import SiderMenu from './sider/SiderMenu.component';
import { setDrawer, setRoute } from '../../../redux/reducers/navSlice';
const MainLayout = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state) => state.user);
    const nav = useSelector((state) => state.nav);
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1023px)' });
    const handleLogout = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('auth_dashboard_token');
            if (!token) {
                throw new Error('No token found');
            }
            return axios.post(`${import.meta.env.VITE_API_REST_URL}/auth/dashboard/logout`, {
                email: '',
            }, // cuerpo vacío pero necesario
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
        },
        onSuccess: () => {
            localStorage.removeItem('auth_dashboard_token');
            dispatch(logout());
            navigate('/login');
        },
        onError: (error) => {
            console.error('Error en logout:', error);
            localStorage.removeItem('auth_dashboard_token');
            dispatch(logout());
            navigate('/login');
        }
    });
    const showDrawer = () => {
        dispatch(setDrawer({ open: true }));
    };
    const onClose = () => {
        dispatch(setDrawer({ open: false }));
    };
    React.useEffect(() => {
        dispatch(setRoute({ pathname: location.pathname }));
    }, [location]);
    return (_jsxs(Layout, { style: { minHeight: "100vh" }, children: [isTabletOrMobile
                ? _jsx(Drawer, { open: nav?.drawer, onClose: onClose, closable: false, placement: 'left', width: 200, children: _jsx(SiderMenu, {}) })
                : _jsx(SiderMenu, {}), _jsxs(Layout, { children: [_jsxs(Flex, { justify: 'space-between', align: 'center', style: {
                            marginLeft: isTabletOrMobile ? 15 : 232,
                            marginTop: 15,
                            marginRight: isTabletOrMobile ? 15 : 32,
                            backgroundColor: isTabletOrMobile ? "white" : 'inherit',
                            padding: 20,
                            borderRadius: "1rem",
                        }, children: [_jsxs("div", { style: { display: 'inline-flex', gap: 10, alignItems: 'center' }, children: [isTabletOrMobile && _jsx(Button, { size: 'small', type: 'text', onClick: showDrawer, children: _jsx(MenuOutlined, { style: { fontSize: 20 } }) }), _jsx(Breadcrumb, { items: [{ title: user?.name }, { title: nav.item }] })] }), _jsx(Tooltip, { title: "Cerrar sesi\u00F3n", children: _jsx(Button, { type: 'text', onClick: () => handleLogout.mutate(), icon: _jsx(LogoutOutlined, { style: { fontSize: 20 } }) }) })] }), _jsx(Content, { style: {
                            marginLeft: isTabletOrMobile ? 15 : 220,
                            marginTop: 15,
                            marginRight: isTabletOrMobile ? 15 : 20,
                            overflow: 'initial',
                            backgroundColor: "white",
                            borderRadius: "1rem",
                            padding: 20,
                            marginBottom: 20
                        }, children: children })] })] }));
};
export default MainLayout;
