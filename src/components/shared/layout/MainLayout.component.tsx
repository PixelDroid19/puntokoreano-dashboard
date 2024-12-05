
import { Breadcrumb, Button, Drawer, Flex, Layout, Tooltip } from 'antd';
import '/src/pages/dashboard/Dashboard.styles.css'
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

interface Props {
    children: React.ReactElement
}

const MainLayout = ({ children }: Props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state: Record<string, any>) => state.user);
    const nav = useSelector( (state: Record<string, any>) => state.nav);

    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1023px)' });

    const handleLogout = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('auth_dashboard_token');
            if (!token) {
                throw new Error('No token found');
            }
    
            return axios.post(
                `${import.meta.env.VITE_API_REST_URL}/auth/dashboard/logout`,
                {
                    email:'',
                }, // cuerpo vacío pero necesario
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
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
    }

    React.useEffect(() => {
        dispatch(setRoute({ pathname: location.pathname }));
    }, [location])

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {
                isTabletOrMobile  
                ? <Drawer
                open={nav?.drawer}
                onClose={onClose}
                closable={false}
                placement='left'
                width={200}
                >
                    <SiderMenu />
                </Drawer>
                : <SiderMenu />
            }
            <Layout>
                <Flex
                justify='space-between'
                align='center'
                style={{
                    marginLeft: isTabletOrMobile ? 15 : 232,
                    marginTop: 15,
                    marginRight: isTabletOrMobile ? 15 : 32,
                    backgroundColor: isTabletOrMobile ? "white" : 'inherit',
                    padding: 20,
                    borderRadius: "1rem",
                }}
                >
                    <div style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}>
                        {isTabletOrMobile && <Button size='small' type='text' onClick={showDrawer}><MenuOutlined style={{ fontSize: 20}} /></Button> }
                        <Breadcrumb items={[{ title: user?.name }, { title: nav.item }]} />
                    </div>
                    <Tooltip title="Cerrar sesión">
                        <Button
                        type='text'
                        onClick={ () => handleLogout.mutate() }
                        icon={ <LogoutOutlined style={{ fontSize: 20 }} /> } />
                    </Tooltip>
                </Flex>
                <Content
                style={{
                    marginLeft: isTabletOrMobile ? 15 : 220,
                    marginTop: 15,
                    marginRight: isTabletOrMobile ? 15 : 20 ,
                    overflow: 'initial',
                    backgroundColor: "white",
                    borderRadius: "1rem",
                    padding: 20,
                    marginBottom: 20
                }}
                >
                    { children }
                </Content>
            </Layout>
        </Layout>
    )
}
export default MainLayout;