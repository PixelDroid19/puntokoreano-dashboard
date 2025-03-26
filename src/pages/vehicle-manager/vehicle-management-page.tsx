import DashboardStatistics from "./dashboard-statistics";
import VehicleForm from "./forms/vehicle-form";
import RecentActivity from "./recent-activity";
import { motion } from "framer-motion";

export default function VehicleManagement() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      <h1 className="text-2xl font-bold mb-6">
        Sistema de Gestión de Vehículos
      </h1>

      <DashboardStatistics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <VehicleForm />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </motion.div>
  );
}
