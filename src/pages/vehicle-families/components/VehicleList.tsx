import { Loader2, Trash2, Pencil, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import VehicleFamiliesService from '../../../services/vehicle-families.service';
import { motion, AnimatePresence } from 'framer-motion';

// Define the vehicle structure based on the API response
interface VehicleApiResponse {
  family: string;
  model: string;
  model_label: string;
  transmissions: {
    value: string;
    label: string;
  }[];
  fuel: string;
  fuel_label: string;
  line: string;
  line_label: string;
  years: string[];
  id?: string; // Optional ID for existing vehicles
}

interface ApiResponseData {
  success: boolean;
  data: VehicleApiResponse[];
  count: number;
}

interface VehicleListProps {
  onEdit: (vehicle: any) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({ onEdit }) => {
  // Use React Query to fetch and cache the vehicle families data
  const { data:  vehicles = [], isLoading, error } = useQuery({
    queryKey: ['vehicleFamilies'],
    queryFn: async () => {
      const response = await VehicleFamiliesService.getVehicles();
      return response;
    },
  });
  
  // Extract vehicles from the API response
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-blue-600" />
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    console.error('Error loading vehicles:', error);
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 px-4"
      >
        <div className="inline-flex items-center justify-center p-4 mb-4 bg-red-50 rounded-full">
          <Info className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-500 font-medium text-lg">Error al cargar los vehículos</p>
        <p className="text-gray-500 mt-2">Por favor, intenta nuevamente más tarde</p>
      </motion.div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 px-4"
      >
        <div className="inline-flex items-center justify-center p-4 mb-4 bg-blue-50 rounded-full">
          <Info className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-gray-700 font-medium text-lg">No hay vehículos registrados</p>
        <p className="text-gray-500 mt-2">Agrega un vehículo para comenzar</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-8" >
      <motion.h2 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2"
      >
        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
          Listado de Vehículos
        </span>
        <span className="text-sm font-normal text-gray-500 ml-2">({vehicles.length})</span>
      </motion.h2>

      <div className="bg-white rounded-xl overflow-hidden ">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Familia</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Modelo</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Años</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Transmisión</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Combustible</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Línea</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {vehicles.map((vehicle, index) => (
                  <motion.tr 
                    key={vehicle.id || `${vehicle.family}-${vehicle.model}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-4 py-4 text-gray-800 capitalize">{vehicle.family}</td>
                    <td className="px-4 py-4 text-gray-800">{vehicle.model_label || vehicle.model}</td>
                    <td className="px-4 py-4 text-gray-800">
                      {vehicle.years ? (
                        <div className="flex flex-wrap gap-1">
                          {vehicle.years.map(year => (
                            <span key={year} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                              {year}
                            </span>
                          ))}
                        </div>
                      ) : (
                        vehicle.year
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-800">
                      {vehicle.transmissions ? (
                        <div className="flex flex-wrap gap-1">
                          {vehicle.transmissions.map(trans => (
                            <span key={trans.value} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                              {trans.label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        vehicle.transmission
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-800">{vehicle.fuel_label || vehicle.fuel}</td>
                    <td className="px-4 py-4 text-gray-800">{vehicle.line_label || vehicle.line}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onEdit(vehicle)}
                          className="p-1.5 bg-blue-100 rounded-lg text-blue-600 hover:bg-blue-200 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => console.log('Delete:', vehicle.id || `${vehicle.family}-${vehicle.model}`)}
                          className="p-1.5 bg-red-100 rounded-lg text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};