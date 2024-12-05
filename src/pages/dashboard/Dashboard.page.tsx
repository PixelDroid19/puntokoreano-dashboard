// src/pages/dashboard/Dashboard.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Row, Col, Card, Statistic, Table, Space, Alert, Spin } from "antd";
import {
  ShoppingOutlined,
  AlertOutlined,
  DollarOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardService } from "../../services/dashboard.service";
import { DashboardAnalytics } from "../../api/types";

const Dashboard: React.FC = () => {
  // Fetch dashboard data using the service
  const { data, isLoading, error } = useQuery<DashboardAnalytics>({
    queryKey: ["dashboardAnalytics"],
    queryFn: () => DashboardService.getAnalytics(),
    staleTime: 5 * 60 * 1000, // Datos considerados frescos por 5 minutos
    refetchOnWindowFocus: false, // No re-fetchear al cambiar de pestaña
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description="No se pudieron cargar los datos del dashboard"
        type="error"
        showIcon
      />
    );
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
      render: (price: number) => `$${price.toLocaleString()}`,
    },
    {
      title: "Última Actualización",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24, fontSize: 24, fontWeight: "bold" }}>
        Dashboard de Analíticas
      </h1>

      {/* Métricas Principales */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Productos"
              value={data?.products.total}
              prefix={<ShoppingOutlined />}
              suffix={`/ ${data?.products.active} activos`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Alertas Stock Bajo"
              value={data?.inventory.lowStockAlerts}
              prefix={<AlertOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Valor del Inventario"
              value={data?.inventory.totalValue}
              prefix={<DollarOutlined />}
              precision={2}
              formatter={(value) => `$${value?.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Filtros Activos"
              value={data?.filters.total}
              prefix={<FilterOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Gráfico de Distribución por Categoría */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title="Distribución por Categoría">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.products.categoryDistribution}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabla de Actividad Reciente */}
      <Row>
        <Col xs={24}>
          <Card title="Actividad Reciente">
            <Table
              columns={columns}
              dataSource={data?.recentActivity}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
