import type React from "react";
import { Car, Tag, Folder, Users } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardAnalytics } from "../../api/types";

interface StatItem {
  titulo: string;
  valor: string | number;
  incremento?: string;
  icono: React.ElementType;
  color: string;
}

interface DashboardStatisticsProps {
  data: DashboardAnalytics | undefined;
}

export default function DashboardStatistics({
  data,
}: DashboardStatisticsProps) {
  const estadisticas: StatItem[] = data
    ? [
        {
          titulo: "Total Vehículos (Conf.)",
          valor: data.vehicles?.total ?? 0,
          incremento:
            data.vehicles?.recentlyAdded > 0
              ? `+${data.vehicles.recentlyAdded} últ. 30d`
              : undefined,
          icono: Car,
          color: "bg-purple-100 text-purple-500",
        },
        {
          titulo: "Marcas",
          valor: data.brands?.total ?? 0,
          incremento:
            data.brands?.recentlyAdded > 0
              ? `+${data.brands.recentlyAdded} nuevas`
              : undefined,
          icono: Tag,
          color: "bg-cyan-100 text-cyan-500",
        },
        {
          titulo: "Familias",
          valor: data.families?.total ?? 0,
          incremento:
            data.families?.recentlyAdded > 0
              ? `+${data.families.recentlyAdded} nuevas`
              : undefined,
          icono: Folder,
          color: "bg-green-100 text-green-500",
        },
        {
          titulo: "Clientes",
          valor: data.customers?.total ?? 0,
          incremento:
            data.customers?.recentlyAdded > 0
              ? `+${data.customers.recentlyAdded} últ. 30d`
              : undefined,
          icono: Users,
          color: "bg-blue-100 text-blue-500",
        },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {estadisticas.map((stat, index) => (
        <motion.div
          key={stat.titulo}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          whileHover={{
            y: -5,
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transition: { duration: 0.2 },
          }}
          className="bg-white rounded-lg shadow p-5 flex justify-between items-center cursor-pointer overflow-hidden"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-500">{stat.titulo}</h3>
            <motion.p
              className="text-3xl font-bold mt-1"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {stat.valor}
            </motion.p>
            {stat.incremento && (
              <p className="text-xs text-gray-500 mt-1">{stat.incremento}</p>
            )}
          </div>
          <motion.div
            className={`p-3 rounded-full ${stat.color} flex-shrink-0`}
            whileHover={{ rotate: 15 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <stat.icono className="w-6 h-6" />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
