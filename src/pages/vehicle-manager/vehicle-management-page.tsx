import DashboardStatistics from "./dashboard-statistics";
import VehicleForm from "./forms/vehicle-form";
import RecentActivity from "./recent-activity";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "../../services/dashboard.service";
import { DashboardAnalytics } from "../../api/types";
import { AlertTriangle } from "lucide-react";

export default function VehicleManagement() {
  const { data, isLoading, error } = useQuery<DashboardAnalytics>({
    queryKey: ["dashboardAnalytics"],
    queryFn: () => DashboardService.getAnalytics(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Cargando datos...</span>
      </div>
    );
  }

  if (error) {
     return (
      <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md flex items-start m-6 max-w-7xl mx-auto">
        <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Error al cargar datos</h3>
          <p className="text-sm">
            {error?.message || "No se pudieron cargar las estadísticas del dashboard."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6"
    >
      <h1 className="text-2xl font-bold">
        Sistema de Gestión de Vehículos
      </h1>

      <DashboardStatistics data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
           <h2 className="text-lg font-semibold mb-4">Registrar Vehículos y Componentes</h2>
           <VehicleForm />
        </div>
        <div>
          <RecentActivity activities={data?.vehicleActivity} />
        </div>
      </div>
    </motion.div>
  );
}