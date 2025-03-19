import { useState } from 'react';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import VehicleFamiliesService, { BulkVehicleData } from '../../../services/vehicle-families.service';


interface BulkVehicleFormProps {
  onSuccess?: () => void;
}

export const BulkVehicleForm: React.FC<BulkVehicleFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset
  } = useForm<BulkVehicleData>({
    defaultValues: {
      transmissions: [],
      years: [],
      productData: {}
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const family = watch('family');
  const model = watch('model');
  const transmissions = watch('transmissions') || [];
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

  // Fetch all available transmissions for the selected model
  const { data: availableTransmissions = [] } = useQuery({
    queryKey: ['all-transmissions', family, model],
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
    queryKey: ['fuels', family, model, transmissions],
    queryFn: async () => {
      if (!family || !model || transmissions.length === 0) return [];
      // For bulk registration, we'll use the first transmission to get fuels
      // This is a simplification - in a real app, you might want to handle this differently
      try {
        const data = await VehicleFamiliesService.getFuelsByTransmission(
          family, 
          model, 
          transmissions[0]
        );
        return data;
      } catch (error) {
        console.error('Error fetching fuels:', error);
        return [];
      }
    },
    enabled: !!(family && model && transmissions.length > 0)
  });

  // Fetch lines when fuel changes
  const { data: lines = [] } = useQuery({
    queryKey: ['lines', family, model, transmissions, fuel],
    queryFn: async () => {
      if (!family || !model || transmissions.length === 0 || !fuel) return [];
      // Similar simplification as above
      try {
        const data = await VehicleFamiliesService.getLinesByFuel(
          family, 
          model, 
          transmissions[0], 
          fuel
        );
        return data;
      } catch (error) {
        console.error('Error fetching lines:', error);
        return [];
      }
    },
    enabled: !!(family && model && transmissions.length > 0 && fuel)
  });

  // Reset dependent fields when parent field changes
  useQuery({
    queryKey: ['resetFields', family, model],
    queryFn: async () => {
      if (family && !model) {
        setValue('transmissions', []);
        setValue('fuel', '');
        setValue('line', '');
        setValue('years', []);
      }
      if (family && model) {
        setValue('transmissions', []);
        setValue('fuel', '');
        setValue('line', '');
      }
      return null;
    },
    enabled: true
  });

  // Bulk register vehicles mutation
  const { mutate, isPending: loading } = useMutation({
    mutationFn: async (data: BulkVehicleData) => {
      setIsUploading(true);
      try {
        return await VehicleFamiliesService.bulkRegisterVehicles(data);
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleFamilies'] });
      reset();
      setFile(null);
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      console.error('Error submitting form:', error);
    }
  });

  const onSubmit = (data: BulkVehicleData) => {
    // Convert string arrays to SelectOption arrays for transmissions
    const formattedData = {
      ...data,
      transmissions: data.transmissions.map(value => {
        const option = availableTransmissions.find(opt => opt.value === value);
        return option || { value, label: value };
      })
    };
    mutate(formattedData);
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      className="p-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h2 
        className="text-2xl font-semibold text-gray-800 mb-6"
        variants={itemVariants}
      >
        Registro Masivo de Vehículos
      </motion.h2>

      <motion.div 
        className="p-8"
        variants={itemVariants}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div 
            className="flex flex-col items-center justify-center text-center"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 mb-4"
            >
              <Upload className="w-12 h-12 text-white" />
            </motion.div>
            
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Arrastra y suelta tu archivo aquí
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              o haz clic para seleccionar un archivo
            </p>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <motion.label
              htmlFor="file-upload"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
                text-white px-5 py-2.5 rounded-lg cursor-pointer transition-all duration-200 
                shadow-md shadow-blue-500/30 font-medium"
            >
              Seleccionar Archivo
            </motion.label>
            {file && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100"
              >
                Archivo seleccionado: <span className="font-medium">{file.name}</span>
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-1">Formato requerido:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Archivo CSV o Excel</li>
                <li>Columnas: familia, modelo, año, transmisión, combustible, línea</li>
                <li>Primera fila debe contener los nombres de las columnas</li>
              </ul>
            </div>
          </motion.div>

     
        </form>
      </motion.div>
    </motion.div>
  );
};