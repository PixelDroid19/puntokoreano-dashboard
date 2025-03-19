import { useForm } from 'react-hook-form';
import { Car, CheckCircle2, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import VehicleFamiliesService from '../../../services/vehicle-families.service';
import { VehicleFormData, Vehicle } from './types';

interface VehicleFormProps {
  initialData?: Vehicle | null;
  onSuccess?: () => void;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({ initialData, onSuccess }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset
  } = useForm<VehicleFormData>({
    defaultValues: initialData || {
      productData: {}
    }
  });

  const family = watch('family');
  const model = watch('model');
  const transmission = watch('transmission');
  const fuel = watch('fuel');

  // Fetch families
  const { data: families = [], isLoading: initialLoading } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      try {
        const data = await VehicleFamiliesService.getFamilies();
        return data;
      } catch (error) {
        console.error('Error fetching families:', error);
        return [];
      }
    }
  });

  // Fetch models and years when family changes
  const { data: models = [] } = useQuery({
    queryKey: ['models', family],
    queryFn: async () => {
      if (!family) return [];
      try {
        const data = await VehicleFamiliesService.getModelsByFamily(family);
        return data;
      } catch (error) {
        console.error('Error fetching models:', error);
        return [];
      }
    },
    enabled: !!family
  });

  const { data: years = [] } = useQuery({
    queryKey: ['years', family],
    queryFn: async () => {
      if (!family) return [];
      try {
        const data = await VehicleFamiliesService.getYearsByFamily(family);
        return data;
      } catch (error) {
        console.error('Error fetching years:', error);
        return [];
      }
    },
    enabled: !!family
  });

  // Fetch transmissions when model changes
  const { data: transmissions = [] } = useQuery({
    queryKey: ['transmissions', family, model],
    queryFn: async () => {
      if (!family || !model) return [];
      try {
        const data = await VehicleFamiliesService.getTransmissionsByModel(family, model);
        return data;
      } catch (error) {
        console.error('Error fetching transmissions:', error);
        return [];
      }
    },
    enabled: !!(family && model)
  });

  // Fetch fuels when transmission changes
  const { data: fuels = [] } = useQuery({
    queryKey: ['fuels', family, model, transmission],
    queryFn: async () => {
      if (!family || !model || !transmission) return [];
      try {
        const data = await VehicleFamiliesService.getFuelsByTransmission(family, model, transmission);
        return data;
      } catch (error) {
        console.error('Error fetching fuels:', error);
        return [];
      }
    },
    enabled: !!(family && model && transmission)
  });

  // Fetch lines when fuel changes
  const { data: lines = [] } = useQuery({
    queryKey: ['lines', family, model, transmission, fuel],
    queryFn: async () => {
      if (!family || !model || !transmission || !fuel) return [];
      try {
        const data = await VehicleFamiliesService.getLinesByFuel(family, model, transmission, fuel);
        return data;
      } catch (error) {
        console.error('Error fetching lines:', error);
        return [];
      }
    },
    enabled: !!(family && model && transmission && fuel)
  });

  // Reset dependent fields when parent field changes
  useQuery({
    queryKey: ['resetFields', family, model, transmission, fuel],
    queryFn: async () => {
      if (!initialData) {
        if (family && !model) {
          setValue('model', '');
          setValue('transmission', '');
          setValue('fuel', '');
          setValue('line', '');
        }
        if (family && model && !transmission) {
          setValue('transmission', '');
          setValue('fuel', '');
          setValue('line', '');
        }
        if (family && model && transmission && !fuel) {
          setValue('fuel', '');
          setValue('line', '');
        }
        if (family && model && transmission && fuel) {
          setValue('line', '');
        }
      }
      return null;
    },
    enabled: !initialData
  });

  // Register or update vehicle mutation
  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      if (initialData?.id) {
        return await VehicleFamiliesService.updateVehicle(initialData.id, data);
      } else {
        return await VehicleFamiliesService.registerVehicle(data);
      }
    },
    onSuccess: () => {
      reset();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      console.error('Error submitting form:', error);
    }
  });

  const onSubmit = (data: VehicleFormData) => {
    mutate(data);
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-8 bg-white rounded-2xl shadow-xl"
    >
      <motion.h2 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2"
      >
        <Car className="h-6 w-6 text-blue-600" />
        {initialData ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}
      </motion.h2>
      
      <motion.form 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-6"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <label className="block text-sm font-medium text-blue-300 mb-1">
              Familia
            </label>
            <select
              {...register('family', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-300 hover:bg-gray-50"
            >
              <option value="">Seleccionar...</option>
              {(families || []).map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            {errors.family && (
              <p className="mt-1 text-sm text-red-400">{errors.family.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <label className="block text-sm font-medium text-blue-300 mb-1">
              Modelo
            </label>
            <select
              {...register('model', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-300 hover:bg-gray-50"
              disabled={!family}
            >
              <option value="">Seleccionar...</option>
              {models.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.model && (
              <p className="mt-1 text-sm text-red-400">{errors.model.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.01 }}
          >
            <label className="block text-sm font-medium text-blue-300 mb-1">
              Año
            </label>
            <select
              {...register('year', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-300 hover:bg-gray-50"
              disabled={!family}
            >
              <option value="">Seleccionar...</option>
              {years.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.year && (
              <p className="mt-1 text-sm text-red-400">{errors.year.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.01 }}
          >
            <label className="block text-sm font-medium text-blue-300 mb-1">
              Transmisión
            </label>
            <select
              {...register('transmission', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-300 hover:bg-gray-50"
              disabled={!model}
            >
              <option value="">Seleccionar...</option>
              {transmissions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.transmission && (
              <p className="mt-1 text-sm text-red-400">{errors.transmission.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.01 }}
          >
            <label className="block text-sm font-medium text-blue-300 mb-1">
              Combustible
            </label>
            <select
              {...register('fuel', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-300 hover:bg-gray-50"
              disabled={!transmission}
            >
              <option value="">Seleccionar...</option>
              {fuels.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.fuel && (
              <p className="mt-1 text-sm text-red-400">{errors.fuel.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <label className="block text-sm font-medium text-blue-300 mb-1">
              Línea
            </label>
            <select
              {...register('line', { required: 'Este campo es requerido' })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-300 hover:bg-gray-50"
              disabled={!fuel}
            >
              <option value="">Seleccionar...</option>
              {lines.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.line && (
              <p className="mt-1 text-sm text-red-400">{errors.line.message}</p>
            )}
          </motion.div>
        </motion.div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium
            hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200
            shadow-lg shadow-indigo-500/30 relative overflow-hidden group"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 
            group-hover:opacity-20 transition-opacity duration-300"></span>
          <span className="relative flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : initialData ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Actualizar Vehículo</span>
              </>
            ) : (
              <>
                <Car className="w-5 h-5" />
                <span>Registrar Vehículo</span>
              </>
            )}
          </span>
        </motion.button>
      </motion.form>
    </motion.div>
  );
};