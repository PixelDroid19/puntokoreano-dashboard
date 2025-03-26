
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Car, Tag, Layers, Cog, Droplet, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useVehicleStore } from "../../store/vehicle-store"

export default function RecentActivity() {
  const activities = useVehicleStore((state) => state.activities)

  const getIcon = (type: string) => {
    switch (type) {
      case "vehicle":
        return <Car className="w-5 h-5 text-blue-500" />
      case "brand":
        return <Tag className="w-5 h-5 text-green-500" />
      case "model":
        return <Layers className="w-5 h-5 text-purple-500" />
      case "transmission":
        return <Cog className="w-5 h-5 text-amber-500" />
      case "fuel":
        return <Droplet className="w-5 h-5 text-red-500" />
      default:
        return <Car className="w-5 h-5 text-blue-500" />
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "vehicle":
        return "bg-blue-100"
      case "brand":
        return "bg-green-100"
      case "model":
        return "bg-purple-100"
      case "transmission":
        return "bg-amber-100"
      case "fuel":
        return "bg-red-100"
      default:
        return "bg-gray-100"
    }
  }

  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: es })
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold">Actividad Reciente</h2>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay actividades recientes</p>
        ) : (
          <AnimatePresence initial={false}>
            {activities.slice(0, 5).map((activity, index) => (
              <motion.div
                key={`${activity.type}-${activity.timestamp.getTime()}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors duration-200"
              >
                <motion.div
                  className={`p-2 rounded-full ${getBackgroundColor(activity.type)}`}
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  {getIcon(activity.type)}
                </motion.div>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {activities.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 text-sm text-gray-600 flex items-center justify-center gap-1 py-2 hover:bg-gray-50 rounded-md transition-all duration-200"
        >
          Ver todas las actividades
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </motion.button>
      )}
    </motion.div>
  )
}

