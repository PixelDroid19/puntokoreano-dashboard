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
} from "lucide-react";
import { DashboardService } from "../../services/dashboard.service";
import { DashboardAnalytics } from "../../api/types";
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
  const { data, isLoading, error } = useQuery<DashboardAnalytics>({
    queryKey: ["dashboardAnalytics"],
    queryFn: () => DashboardService.getAnalytics(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md flex items-start m-6">
        <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Error</h3>
          <p className="text-sm">
            {error?.message || "No se pudieron cargar los datos del dashboard"}
          </p>
        </div>
      </div>
    );
  }

  // Prepare data safely, defaulting to empty arrays or objects if needed
  const products = data.products ?? {
    total: 0,
    active: 0,
    recentlyAdded: 0,
    categoryDistribution: [],
  };
  const inventory = data.inventory ?? { lowStockAlerts: 0, totalValue: 0 };
  const vehicles = data.vehicles ?? {
    total: 0,
    active: 0,
    recentlyAdded: 0,
    monthlyGrowth: 0,
    growthPercentage: 0,
  };
  const brands = data.brands ?? { total: 0, active: 0, recentlyAdded: 0 };
  const families = data.families ?? { total: 0, active: 0, recentlyAdded: 0 };
  const customers = data.customers ?? {
    total: 0,
    recentlyAdded: 0,
    monthlyGrowth: 0,
    growthPercentage: 0,
  };
  const lines = data.lines ?? {
    total: 0,
    active: 0,
    recentlyAdded: 0,
    brandDistribution: [],
  };
  const recentActivityData = Array.isArray(data.recentActivity)
    ? data.recentActivity
    : [];
  const categoryChartData = Array.isArray(products.categoryDistribution)
    ? products.categoryDistribution
    : [];
  const brandDistributionChartData = Array.isArray(lines.brandDistribution)
    ? lines.brandDistribution
    : [];
  const recentActivityLogsData = Array.isArray(data.recentActivityLogs)
    ? data.recentActivityLogs
    : [];
  const vehicleActivityData = Array.isArray(data.vehicleActivity)
    ? data.vehicleActivity
    : [];

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
            <TabsList className="w-full max-w-md mb-6">
              <TabsTrigger value="products" className="flex-1">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Productos
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="flex-1">
                <Car className="h-4 w-4 mr-2" />
                Vehículos
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
                            <td className="px-4 py-3 border-t">{item.name}</td>
                            <td className="px-4 py-3 border-t">
                              {item.category}
                            </td>
                            <td className="px-4 py-3 border-t">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-4 py-3 border-t">
                              {formatDate(item.updatedAt)}
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
                      key={item.id || index}
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
                              {item.details}
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
