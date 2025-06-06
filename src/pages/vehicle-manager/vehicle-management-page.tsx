import DashboardStatistics from "./dashboard-statistics";
import VehicleForm from "./forms/vehicle-form";
import RecentActivity from "./recent-activity";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "../../services/dashboard.service";
import { DashboardAnalytics } from "../../api/types";
import { AlertTriangle, Car, Upload, Settings, LineChart, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import VehicleView from "./vehicle-view";
import ApplicabilityGroupsView from "./applicability-groups-view";

import PerformanceMetricsViewer from "./components/performance-metrics-viewer";

// Importar el archivo CSS de aplicabilidad para tener estilos coherentes
import "./forms/applicability-form.css";

export default function VehicleManagement() {
  const { data, isLoading, error } = useQuery<DashboardAnalytics>({
    queryKey: ["dashboardAnalytics"],
    queryFn: () => DashboardService.getAnalytics(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <span className="mt-6 text-gray-600 text-xl">Cargando gestión de vehículos...</span>
      </div>
    );
  }

  if (error) {
     return (
      <div className="bg-red-50 border border-red-300 text-red-700 px-8 py-6 rounded-lg flex items-start m-6 max-w-7xl mx-auto shadow-sm">
        <AlertTriangle className="h-8 w-8 mr-4 mt-0.5 flex-shrink-0 text-red-500" />
        <div>
          <h3 className="font-semibold text-xl">Error al cargar datos</h3>
          <p className="mt-2 text-lg">
            {error?.message || "No se pudieron cargar las estadísticas del dashboard."}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 text-base rounded-md transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-full mx-auto px-6 sm:px-8 py-8 space-y-10"
    >
      <div className="border-b border-gray-200 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Sistema de Gestión de Vehículos
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Administra, importa y configura los vehículos y sus grupos de aplicabilidad
        </p>
      </div>

      <DashboardStatistics data={data} />

      <Tabs defaultValue="vehicles" className="w-full custom-tabs">
        <TabsList className="mb-8 bg-gray-100 p-2 rounded-lg border border-gray-200">
          <TabsTrigger 
            value="vehicles" 
            className="flex items-center gap-3 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            <Car className="h-5 w-5" />
            <span>Vehículos</span>
          </TabsTrigger>
     
        
          <TabsTrigger 
            value="setup" 
            className="flex items-center gap-3 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            <Settings className="h-5 w-5" />
            <span>Gestión de Vehículos</span>
          </TabsTrigger>

          <TabsTrigger 
            value="metrics" 
            className="flex items-center gap-3 px-6 py-3 text-base data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            <LineChart className="h-5 w-5" />
            <span>Métricas</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehicles" className="fade-in">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <VehicleView />
          </div>
        </TabsContent>
     
        
        <TabsContent value="metrics" className="fade-in">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <PerformanceMetricsViewer />
          </div>
        </TabsContent>
        
        <TabsContent value="setup" className="fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <VehicleForm className="p-8 criteria-card" />
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-0 overflow-hidden">
                <ApplicabilityGroupsView />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="criteria-card bg-white rounded-lg shadow-sm border border-gray-200 p-8 sticky top-4">
                <div className="flex items-center gap-2 mb-4 border-b pb-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <h3 className="text-xl font-semibold text-gray-700">Actividad Reciente (Vehículos)</h3>
                </div>
                <RecentActivity activities={data?.vehicleActivity} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}