import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Row, Col, Card, Statistic, Table, Alert, Spin } from "antd";
import { ShoppingOutlined, AlertOutlined, DollarOutlined, FilterOutlined, } from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
import { DashboardService } from "../../services/dashboard.service";
const Dashboard = () => {
    // Fetch dashboard data using the service
    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboardAnalytics"],
        queryFn: () => DashboardService.getAnalytics(),
        staleTime: 5 * 60 * 1000, // Datos considerados frescos por 5 minutos
        refetchOnWindowFocus: false, // No re-fetchear al cambiar de pestaña
    });
    if (isLoading) {
        return (_jsx("div", { style: { textAlign: "center", padding: "50px" }, children: _jsx(Spin, { size: "large" }) }));
    }
    if (error) {
        return (_jsx(Alert, { message: "Error", description: "No se pudieron cargar los datos del dashboard", type: "error", showIcon: true }));
    }
    // Table columns for recent activity
    const columns = [
        {
            title: "Producto",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Categoría",
            dataIndex: "category",
            key: "category",
        },
        {
            title: "Precio",
            dataIndex: "price",
            key: "price",
            render: (price) => `$${price.toLocaleString()}`,
        },
        {
            title: "Última Actualización",
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: (date) => new Date(date).toLocaleDateString(),
        },
    ];
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("h1", { style: { marginBottom: 24, fontSize: 24, fontWeight: "bold" }, children: "Dashboard de Anal\u00EDticas" }), _jsxs(Row, { gutter: 16, style: { marginBottom: 24 }, children: [_jsx(Col, { xs: 24, sm: 12, lg: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Total Productos", value: data?.products.total, prefix: _jsx(ShoppingOutlined, {}), suffix: `/ ${data?.products.active} activos` }) }) }), _jsx(Col, { xs: 24, sm: 12, lg: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Alertas Stock Bajo", value: data?.inventory.lowStockAlerts, prefix: _jsx(AlertOutlined, { style: { color: "#ff4d4f" } }), valueStyle: { color: "#ff4d4f" } }) }) }), _jsx(Col, { xs: 24, sm: 12, lg: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Valor del Inventario", value: data?.inventory.totalValue, prefix: _jsx(DollarOutlined, {}), precision: 2, formatter: (value) => `$${value?.toLocaleString()}` }) }) }), _jsx(Col, { xs: 24, sm: 12, lg: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Filtros Activos", value: data?.filters.total, prefix: _jsx(FilterOutlined, {}) }) }) })] }), _jsx(Row, { gutter: 16, style: { marginBottom: 24 }, children: _jsx(Col, { xs: 24, children: _jsx(Card, { title: "Distribuci\u00F3n por Categor\u00EDa", children: _jsx("div", { style: { height: 300 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data?.products.categoryDistribution, margin: {
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "_id" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "count", fill: "#1890ff" })] }) }) }) }) }) }), _jsx(Row, { children: _jsx(Col, { xs: 24, children: _jsx(Card, { title: "Actividad Reciente", children: _jsx(Table, { columns: columns, dataSource: data?.recentActivity, rowKey: "id", pagination: { pageSize: 5 } }) }) }) })] }));
};
export default Dashboard;
