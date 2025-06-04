import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Statistic,
  Row,
  Col,
  Button,
  Space,
  Progress,
  Tooltip,
  message,
  Divider,
  Typography
} from "antd";
import {
  DashboardOutlined,
  ClearOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import { axiosInstance } from "../../../utils/axios-interceptor";

const { Title, Text } = Typography;

interface PerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  queryCount: number;
  avgQueryTime: number;
  cacheSize: number;
  cacheHitRate: number;
}

const PerformanceMetricsViewer: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);

  const { data: metrics, isLoading, refetch } = useQuery<PerformanceMetrics>({
    queryKey: ["performanceMetrics"],
    queryFn: async () => {
      const response = await axiosInstance.get("/dashboard/vehicles/applicability-groups/performance-metrics");
      return response.data.data;
    },
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await axiosInstance.post("/dashboard/vehicles/applicability-groups/clear-cache");
      message.success("Caché limpiado exitosamente");
      refetch();
    } catch (error: any) {
      message.error(`Error al limpiar caché: ${error.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getCacheHitRateColor = (rate: number) => {
    if (rate >= 0.8) return "#52c41a"; // Verde
    if (rate >= 0.6) return "#faad14"; // Amarillo
    return "#ff4d4f"; // Rojo
  };

  const getQueryPerformanceColor = (avgTime: number) => {
    if (avgTime <= 100) return "#52c41a"; // Verde - Excelente
    if (avgTime <= 500) return "#faad14"; // Amarillo - Bueno
    return "#ff4d4f"; // Rojo - Necesita optimización
  };

  if (isLoading) {
    return (
      <Card loading={true}>
        <div style={{ height: 200 }} />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="mb-0">
          <DashboardOutlined className="mr-2" />
          Métricas de Rendimiento
        </Title>
        <Space>
          <Tooltip title="Actualizar métricas">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => refetch()}
              type="default"
            >
              Actualizar
            </Button>
          </Tooltip>
          <Tooltip title="Limpiar caché para liberar memoria">
            <Button 
              icon={<ClearOutlined />} 
              onClick={handleClearCache}
              loading={isClearing}
              type="primary"
              danger
            >
              Limpiar Caché
            </Button>
          </Tooltip>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Estadísticas de Caché */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tasa de Aciertos de Caché"
              value={metrics?.cacheHitRate ? (metrics.cacheHitRate * 100).toFixed(1) : 0}
              suffix="%"
              valueStyle={{ color: getCacheHitRateColor(metrics?.cacheHitRate || 0) }}
              prefix={<DatabaseOutlined />}
            />
            <Progress
              percent={metrics?.cacheHitRate ? metrics.cacheHitRate * 100 : 0}
              strokeColor={getCacheHitRateColor(metrics?.cacheHitRate || 0)}
              showInfo={false}
              size="small"
            />
            <div className="mt-2">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {metrics?.cacheHits || 0} aciertos / {(metrics?.cacheHits || 0) + (metrics?.cacheMisses || 0)} total
              </Text>
            </div>
          </Card>
        </Col>

        {/* Tiempo Promedio de Consulta */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tiempo Promedio de Consulta"
              value={metrics?.avgQueryTime ? formatTime(metrics.avgQueryTime) : "0ms"}
              valueStyle={{ color: getQueryPerformanceColor(metrics?.avgQueryTime || 0) }}
              prefix={<ClockCircleOutlined />}
            />
            <div className="mt-2">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {metrics?.queryCount || 0} consultas realizadas
              </Text>
            </div>
          </Card>
        </Col>

        {/* Tamaño del Caché */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Elementos en Caché"
              value={metrics?.cacheSize || 0}
              prefix={<DatabaseOutlined />}
            />
            <div className="mt-2">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Entradas almacenadas
              </Text>
            </div>
          </Card>
        </Col>

        {/* Eficiencia General */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Consultas Totales"
              value={metrics?.queryCount || 0}
              prefix={<ThunderboltOutlined />}
            />
            <div className="mt-2">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Desde el último reinicio
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Detalles Adicionales */}
      <Card title="Detalles de Rendimiento">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="space-y-3">
              <div>
                <Text strong>Aciertos de Caché:</Text>
                <div className="flex justify-between">
                  <Text>{metrics?.cacheHits || 0}</Text>
                  <Text type="success">
                    {metrics?.cacheHits && metrics?.queryCount 
                      ? `${((metrics.cacheHits / metrics.queryCount) * 100).toFixed(1)}%`
                      : "0%"
                    }
                  </Text>
                </div>
              </div>
              
              <div>
                <Text strong>Fallos de Caché:</Text>
                <div className="flex justify-between">
                  <Text>{metrics?.cacheMisses || 0}</Text>
                  <Text type="warning">
                    {metrics?.cacheMisses && metrics?.queryCount 
                      ? `${((metrics.cacheMisses / metrics.queryCount) * 100).toFixed(1)}%`
                      : "0%"
                    }
                  </Text>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div className="space-y-3">
              <div>
                <Text strong>Estado del Rendimiento:</Text>
                <div className="mt-1">
                  {metrics?.avgQueryTime && metrics.avgQueryTime <= 100 && (
                    <Text type="success">🚀 Excelente - Consultas muy rápidas</Text>
                  )}
                  {metrics?.avgQueryTime && metrics.avgQueryTime > 100 && metrics.avgQueryTime <= 500 && (
                    <Text type="warning">⚡ Bueno - Rendimiento aceptable</Text>
                  )}
                  {metrics?.avgQueryTime && metrics.avgQueryTime > 500 && (
                    <Text type="danger">🐌 Lento - Considerar optimización</Text>
                  )}
                  {!metrics?.avgQueryTime && (
                    <Text type="secondary">📊 Sin datos suficientes</Text>
                  )}
                </div>
              </div>

              <div>
                <Text strong>Eficiencia del Caché:</Text>
                <div className="mt-1">
                  {metrics?.cacheHitRate && metrics.cacheHitRate >= 0.8 && (
                    <Text type="success">🎯 Excelente - Caché muy efectivo</Text>
                  )}
                  {metrics?.cacheHitRate && metrics.cacheHitRate >= 0.6 && metrics.cacheHitRate < 0.8 && (
                    <Text type="warning">📈 Bueno - Caché moderadamente efectivo</Text>
                  )}
                  {metrics?.cacheHitRate && metrics.cacheHitRate < 0.6 && (
                    <Text type="danger">📉 Bajo - Caché poco efectivo</Text>
                  )}
                  {!metrics?.cacheHitRate && (
                    <Text type="secondary">🔄 Sin actividad de caché</Text>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Divider />

        <div className="text-center">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Las métricas se actualizan automáticamente cada 30 segundos. 
            El caché mejora el rendimiento almacenando resultados de consultas frecuentes.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default PerformanceMetricsViewer; 