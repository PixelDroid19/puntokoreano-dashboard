

import { Car, Tag, Layers, Users } from "lucide-react"
import { motion } from "framer-motion"

const estadisticas = [
  {
    titulo: "Total Vehículos",
    valor: "243",
    incremento: "+12% este mes",
    icono: Car,
    color: "bg-blue-100 text-blue-500",
  },
  {
    titulo: "Marcas",
    valor: "18",
    incremento: "+2 nuevas",
    icono: Tag,
    color: "bg-green-100 text-green-500",
  },
  {
    titulo: "Modelos",
    valor: "56",
    incremento: "+5 este mes",
    icono: Layers,
    color: "bg-purple-100 text-purple-500",
  },
  {
    titulo: "Clientes",
    valor: "1,204",
    incremento: "+8% este mes",
    icono: Users,
    color: "bg-amber-100 text-amber-500",
  },
]

export default function DashboardStatistics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {estadisticas.map((stat, index) => (
        <motion.div
          key={stat.titulo}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            transition: { duration: 0.2 },
          }}
          className="bg-white rounded-lg shadow p-6 flex justify-between items-center cursor-pointer"
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
            <p className="text-sm text-gray-500 mt-1">{stat.incremento}</p>
          </div>
          <motion.div
            className={`p-3 rounded-full ${stat.color}`}
            whileHover={{ rotate: 15 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <stat.icono className="w-6 h-6" />
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

