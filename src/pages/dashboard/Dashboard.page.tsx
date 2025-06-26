import type React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Users,
  Car,
  Tag,
  Folder,
  GitBranch,
  Clock,
  BarChart3,
  FileText,
  Activity,
  Zap,
  TrendingUp,
  Shield,
} from "lucide-react";
import { DashboardService } from "../../services/dashboard.service";
import { DashboardAnalytics } from "../../api/types";
import PaymentSettingsService from "../../services/payment-settings.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../vehicle-manager/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../vehicle-manager/ui/tabs";
import { useState, useEffect } from "react";

const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return "-";
  return `$${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Helper to format date safely
const formatDate = (date: string | null | undefined): string => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString();
  } catch (e) {
    return "-";
  }
};

// Helper to format timestamp safely
const formatTimestamp = (date: string | null | undefined): string => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString();
  } catch (e) {
    return "-";
  }
};

// Helper to get tag color based on activity type
const getActivityTagColor = (type: string): string => {
  switch (type?.toLowerCase()) {
    case "product":
      return "bg-blue-500";
    case "vehicle":
      return "bg-purple-500";
    case "brand":
      return "bg-cyan-500";
    case "family":
      return "bg-green-500";
    case "model":
      return "bg-indigo-600";
    case "line":
      return "bg-pink-500";
    case "transmission":
      return "bg-orange-500";
    case "fuel":
      return "bg-yellow-500";
    case "user":
      return "bg-lime-500";
    case "order":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentVerificationMetrics, setPaymentVerificationMetrics] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsData, paymentData] = await Promise.all([
        DashboardService.getAnalytics(),
        DashboardService.getPaymentVerificationMetrics()
      ]);
      setAnalytics(analyticsData);
      setPaymentVerificationMetrics(paymentData);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Actualizar métricas de verificación de pagos cada 30 segundos
    const paymentInterval = setInterval(async () => {
      try {
        const paymentData = await DashboardService.getPaymentVerificationMetrics();
        setPaymentVerificationMetrics(paymentData);
        
        // Si hubo una verificación reciente, refrescar analytics
        const lastRun = paymentData.lastVerification?.lastRun;
        if (lastRun) {
          const lastRunTime = new Date(lastRun).getTime();
          const now = new Date().getTime();
          const timeDiff = now - lastRunTime;
          
          // Si la verificación fue hace menos de 1 minuto, refrescar datos
          if (timeDiff < 1 * 60 * 1000) {
            const analyticsData = await DashboardService.getAnalytics();
            setAnalytics(analyticsData);
          }
        }
      } catch (err) {
        console.error("Error updating payment metrics:", err);
      }
    }, 30000); // 30 segundos

    return () => {
      clearInterval(paymentInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md flex items-start m-6">
        <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Error</h3>
          <p className="text-sm">
            {error || "No se pudieron cargar los datos del dashboard"}
          </p>
        </div>
      </div>
    );
  }

  // Prepare data safely, defaulting to empty arrays or objects if needed
  const products = analytics.products ?? {
    total: 0,
    active: 0,
    recentlyAdded: 0,
    categoryDistribution: [],
  };
  const inventory = analytics.inventory ?? { lowStockAlerts: 0, totalValue: 0 };
  const vehicles = analytics.vehicles ?? {
    total: 0,
    active: 0,
    recentlyAdded: 0,
    monthlyGrowth: 0,
    growthPercentage: 0,
  };
  const brands = analytics.brands ?? { total: 0, active: 0, recentlyAdded: 0 };
  const families = analytics.families ?? { total: 0, active: 0, recentlyAdded: 0 };
  const customers = analytics.customers ?? {
    total: 0,
    recentlyAdded: 0,
    monthlyGrowth: 0,
    growthPercentage: 0,
  };
  const lines = analytics.lines ?? {
    total: 0,
    active: 0,
    recentlyAdded: 0,
    brandDistribution: [],
  };
  const recentActivityData = Array.isArray(analytics.recentActivityLogs)
    ? analytics.recentActivityLogs
    : [];
  const categoryChartData = Array.isArray(products.categoryDistribution)
    ? products.categoryDistribution
    : [];
  const brandDistributionChartData = Array.isArray(lines.brandDistribution)
    ? lines.brandDistribution
    : [];
  const recentActivityLogsData = Array.isArray(analytics.recentActivityLogs)
    ? analytics.recentActivityLogs
    : [];
  const vehicleActivityData = Array.isArray(analytics.vehicleActivity)
    ? analytics.vehicleActivity
    : [];

  // Datos del sistema de pagos
  const paymentMetricsData = paymentVerificationMetrics;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard de Analíticas
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Actualizado: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Main Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Productos"
          value={products.total}
          icon={<ShoppingCart className="h-5 w-5" />}
          description={`${products.active} activos`}
          trend={
            products.recentlyAdded > 0
              ? `+${products.recentlyAdded} nuevos`
              : undefined
          }
          trendUp={products.recentlyAdded > 0}
        />
        <StatCard
          title="Alertas Stock"
          value={inventory.lowStockAlerts}
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          description="productos con stock bajo"
          alert={inventory.lowStockAlerts > 0}
        />
        <StatCard
          title="Valor Inventario"
          value={formatCurrency(inventory.totalValue)}
          icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
          description="valor total"
        />
        <StatCard
          title="Clientes"
          value={customers.total}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          description="clientes registrados"
          trend={`+${customers.recentlyAdded} últ. 30d`}
          trendUp={customers.recentlyAdded > 0}
        />
      </div>

      {/* Vehicle Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Vehículos"
          value={vehicles.total}
          icon={<Car className="h-5 w-5 text-purple-500" />}
          description={`${vehicles.active} activos`}
          trend={
            vehicles.recentlyAdded > 0
              ? `+${vehicles.recentlyAdded} nuevos`
              : undefined
          }
          trendUp={vehicles.recentlyAdded > 0}
        />
        <StatCard
          title="Marcas"
          value={brands.total}
          icon={<Tag className="h-5 w-5 text-cyan-500" />}
          description={`${brands.active} activas`}
          trend={
            brands.recentlyAdded > 0
              ? `+${brands.recentlyAdded} nuevas`
              : undefined
          }
          trendUp={brands.recentlyAdded > 0}
        />
        <StatCard
          title="Familias"
          value={families.total}
          icon={<Folder className="h-5 w-5 text-green-500" />}
          description={`${families.active} activas`}
          trend={
            families.recentlyAdded > 0
              ? `+${families.recentlyAdded} nuevas`
              : undefined
          }
          trendUp={families.recentlyAdded > 0}
        />
        <StatCard
          title="Líneas"
          value={lines.total}
          icon={<GitBranch className="h-5 w-5 text-pink-500" />}
          description={`${lines.active} activas`}
          trend={
            lines.recentlyAdded > 0
              ? `+${lines.recentlyAdded} nuevas`
              : undefined
          }
          trendUp={lines.recentlyAdded > 0}
        />
      </div>

      {/* Payment System Stats Section - Verificaciones cada 3 minutos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sistema de Verificaciones"
          value={paymentMetricsData?.systemStatus?.isActive ? "Activo" : "Inactivo"}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          description={paymentMetricsData?.systemStatus?.frequency || "cada 3 minutos"}
          alert={!paymentMetricsData?.systemStatus?.isActive}
        />
        <StatCard
          title="Pagos Pendientes"
          value={paymentMetricsData?.systemStatus?.pendingPayments || 0}
          icon={<Zap className="h-5 w-5 text-blue-500" />}
          description="pendientes de verificar"
          trend={paymentMetricsData?.cronService?.isInitialized ? "Cron Activo" : "Cron Inactivo"}
          trendUp={paymentMetricsData?.cronService?.isInitialized}
          alert={(paymentMetricsData?.systemStatus?.pendingPayments || 0) > 10}
        />
        <StatCard
          title="Tasa de Éxito"
          value={`${((paymentMetricsData?.lastVerification?.successRate || 0) * 100).toFixed(1)}%`}
          icon={<Shield className="h-5 w-5 text-indigo-500" />}
          description="verificaciones exitosas"
          alert={(paymentMetricsData?.lastVerification?.successRate || 0) < 0.9}
        />
        <StatCard
          title="Última Verificación"
          value={paymentMetricsData?.lastVerification?.totalProcessed || 0}
          icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
          description="órdenes procesadas"
          trend={paymentMetricsData?.lastVerification?.lastRun ? 
            formatTimestamp(paymentMetricsData.lastVerification.lastRun) : "Nunca"}
          trendUp={paymentMetricsData?.lastVerification?.failed === 0}
          alert={(paymentMetricsData?.lastVerification?.failed || 0) > 0}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Productos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryChartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="_id"
                    angle={-15}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    fontSize={10}
                    tick={{ fill: "#6b7280" }}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    formatter={(value) => Number(value).toLocaleString()}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "6px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    name="Productos"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Líneas por Marca (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={brandDistributionChartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="brandName"
                    angle={-15}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    fontSize={10}
                    tick={{ fill: "#6b7280" }}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    formatter={(value) => Number(value).toLocaleString()}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "6px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#10b981"
                    name="Líneas"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Tabs Section */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="w-full max-w-2xl mb-6">
              <TabsTrigger value="products" className="flex-1">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Productos
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="flex-1">
                <Car className="h-4 w-4 mr-2" />
                Vehículos
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex-1">
                <Zap className="h-4 w-4 mr-2" />
                Pagos
              </TabsTrigger>
              <TabsTrigger value="system" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              {recentActivityData.length > 0 ? (
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left font-medium">
                            Producto
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Categoría
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Precio
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Última Actualización
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivityData.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-muted/20"
                            }
                          >
                            <td className="px-4 py-3 border-t">{item.action}</td>
                            <td className="px-4 py-3 border-t">
                              {item.type}
                            </td>
                            <td className="px-4 py-3 border-t">
                              {item.userName}
                            </td>
                            <td className="px-4 py-3 border-t">
                              {formatTimestamp(item.timestamp)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No hay actividad reciente de productos.
                </div>
              )}
            </TabsContent>

            <TabsContent value="vehicles" className="space-y-4">
              {vehicleActivityData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicleActivityData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:shadow-sm transition-shadow"
                    >
                      <div
                        className={`${getActivityTagColor(
                          item.type
                        )} text-white px-3 py-1 rounded text-xs font-medium w-24 text-center flex-shrink-0`}
                      >
                        {item.type?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(item.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No hay actividad reciente de vehículos.
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              {paymentMetricsData && paymentMetricsData.orders && paymentMetricsData.system && paymentMetricsData.cronStatus ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Métricas de Verificación */}
                  <div className="p-6 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                      Verificaciones
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{paymentMetricsData.orders?.total || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exitosas:</span>
                        <span className="font-medium text-green-600">{paymentMetricsData.orders?.completed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tasa de éxito:</span>
                        <span className="font-medium">{paymentMetricsData.orders?.successRate || "0.0%"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Métricas de Automatización */}
                  <div className="p-6 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-green-600" />
                      Automatización
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tareas activas:</span>
                        <span className="font-medium">{paymentMetricsData.cronStatus?.activeTasks?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pagos procesados:</span>
                        <span className="font-medium text-green-600">{paymentMetricsData.system?.lastVerification?.totalProcessed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pagos actualizados:</span>
                        <span className="font-medium text-blue-600">{paymentMetricsData.system?.lastVerification?.updated || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estado del Cron */}
                  <div className="p-6 rounded-lg border bg-gradient-to-br from-purple-50 to-violet-50">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-purple-600" />
                      Estado del Servicio
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Estado:</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${paymentMetricsData.cronStatus?.isInitialized ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="font-medium">{paymentMetricsData.cronStatus?.isInitialized ? 'Activo' : 'Inactivo'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sistema saludable:</span>
                        <span className="font-medium">{paymentMetricsData.cronStatus?.systemHealth ? 'Sí' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tareas activas:</span>
                        <span className="font-medium">{paymentMetricsData.cronStatus?.activeTasks?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Errores Recientes */}
                  {paymentMetricsData.system?.lastVerification?.errors && paymentMetricsData.system.lastVerification.errors.length > 0 && (
                    <div className="p-6 rounded-lg border bg-gradient-to-br from-red-50 to-pink-50">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                        Errores Recientes
                      </h3>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {paymentMetricsData.system.lastVerification.errors.slice(0, 3).map((error, index) => (
                          <div key={index} className="text-sm p-2 bg-white rounded border">
                            <div className="font-medium text-red-600">{error.type || 'Error de verificación'}</div>
                            <div className="text-gray-600 truncate">{error.message || 'Sin mensaje'}</div>
                            {error.orderId && (
                              <div className="text-xs text-gray-400">Orden: {error.orderId}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No hay datos de métricas de pagos disponibles.
                </div>
              )}
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              {recentActivityLogsData.length > 0 ? (
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left font-medium">
                            Tipo
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Acción
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Usuario
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Detalles
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Fecha
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivityLogsData.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-muted/20"
                            }
                          >
                            <td className="px-4 py-3 border-t">
                              <span
                                className={`${getActivityTagColor(
                                  item.type
                                )} text-white px-2 py-1 rounded text-xs`}
                              >
                                {item.type?.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 border-t">
                              {item.action}
                            </td>
                            <td className="px-4 py-3 border-t">
                              {item.userName}
                            </td>
                            <td className="px-4 py-3 border-t max-w-xs truncate">
                              {typeof item.details === 'string' ? item.details : JSON.stringify(item.details)}
                            </td>
                            <td className="px-4 py-3 border-t whitespace-nowrap">
                              {formatTimestamp(item.timestamp)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No hay logs de actividad recientes.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  trendUp,
  alert = false,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: string;
  trendUp?: boolean;
  alert?: boolean;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div
            className={`p-2 rounded-full ${
              alert ? "bg-destructive/10" : "bg-muted"
            }`}
          >
            {icon}
          </div>
        </div>
        <p className={`text-2xl font-bold ${alert ? "text-destructive" : ""}`}>
          {value}
        </p>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                trendUp
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
