import { motion, AnimatePresence } from "framer-motion";
import { Clock, Car, Tag, Layers, Cog, Droplet, ChevronRight, Folder, GitBranch } from "lucide-react"; // Added Folder, GitBranch
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { VehicleActivity } from "../../api/types";

interface RecentActivityProps {
  activities: VehicleActivity[] | undefined; // Accept fetched data as prop
  showTitle?: boolean; // Añadir opción para mostrar u ocultar el título
}

export default function RecentActivity({ activities = [], showTitle = false }: RecentActivityProps) { // Default to empty array

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "vehicle":
        return <Car className="w-5 h-5 text-purple-500" />;
      case "brand":
        return <Tag className="w-5 h-5 text-cyan-500" />;
      case "family": // Added family
         return <Folder className="w-5 h-5 text-green-500" />;
      case "model":
        return <Layers className="w-5 h-5 text-indigo-600" />;
      case "line": // Added line
        return <GitBranch className="w-5 h-5 text-pink-500" />;
      case "transmission":
        return <Cog className="w-5 h-5 text-orange-500" />;
      case "fuel":
        return <Droplet className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />; // Default icon
    }
  };

  const getBackgroundColor = (type: string) => {
     switch (type?.toLowerCase()) {
        case "vehicle": return "bg-purple-100";
        case "brand": return "bg-cyan-100";
        case "family": return "bg-green-100";
        case "model": return "bg-indigo-100";
        case "line": return "bg-pink-100";
        case "transmission": return "bg-orange-100";
        case "fuel": return "bg-yellow-100";
        default: return "bg-gray-100";
    }
  };

  const formatTimeAgo = (date: Date | string | undefined) => { // Accept string or Date
    if (!date) return '-';
    try {
        // Ensure date is a Date object before formatting
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return '-'; // Invalid date check
        return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
    } catch (e) {
        console.error("Error formatting date:", e);
        return '-';
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }} // Slightly faster delay
    >
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Actividad Reciente (Vehículos)</h2>
        </div>
      )}

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2"> {/* Added max-height and scroll */}
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No hay actividades recientes</p>
        ) : (
          <AnimatePresence initial={false}>
            {activities.map((activity, index) => (
              <motion.div
                // Use a more robust key if API provides unique IDs for activities
                key={activity.details?.id || `${activity.type}-${activity.timestamp}-${index}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }} // Faster delay for lists
                className="flex items-start gap-3 p-2 hover:bg-gray-50/80 rounded-md transition-colors duration-150"
              >
                <motion.div
                  className={`p-2 rounded-full ${getBackgroundColor(activity.type)} flex-shrink-0`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {getIcon(activity.type)}
                </motion.div>
                <div className="flex-1 min-w-0"> {/* Ensure text doesn't overflow */}
                  <p className="font-medium text-sm truncate">{activity.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {activities.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 text-sm text-gray-600 flex items-center justify-center gap-1 py-2 hover:bg-gray-100 rounded-md transition-all duration-200"
        >
          Ver más actividades {/* Adjusted text */}
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
}