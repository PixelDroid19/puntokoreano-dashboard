import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  Loader2, 
  PlusCircle, 
  Car, 
  Calendar, 
  Settings, 
  Fuel, 
  Tag,
  Building2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { notification } from 'antd';
import VehicleFamiliesService from '../../../services/vehicle-families.service';
type AttributeType = 'family' | 'model' | 'transmission' | 'fuel' | 'line' | 'year';

interface AttributeFormData {
  familyId: string;
  familyName: string;
  modelName: string;
  transmissionName: string;
  fuelName: string;
  lineName: string;
  year: string;
}

interface VehicleAttributesFormProps {
  onSuccess?: () => void;
}

export const VehicleAttributesForm: React.FC<VehicleAttributesFormProps> = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState<AttributeType>('family');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState<Array<{id: AttributeType; label: string}>>([]);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<AttributeFormData>({
    defaultValues: {
      year: new Date().getFullYear().toString()
    }
  });

  useEffect(() => {
    setIsFormVisible(false);
    setTimeout(() => setIsFormVisible(true), 50);

    // Update breadcrumb
    const tabs = [
      { id: 'family', label: 'Familia' },
      { id: 'model', label: 'Modelo' },
      { id: 'transmission', label: 'Transmisión' },
      { id: 'fuel', label: 'Combustible' },
      { id: 'line', label: 'Línea' },
      { id: 'year', label: 'Año' }
    ];
    const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
    setBreadcrumb(tabs.slice(0, currentTabIndex + 1));
  }, [activeTab]);

  const familyId = watch('familyId');
  const modelName = watch('modelName');
  const transmissionName = watch('transmissionName');
  const fuelName = watch('fuelName');

  // Fetch families for dropdown
  const { data: families = [], isLoading: loadingFamilies } = useQuery({
    queryKey: ['families'],
    queryFn: VehicleFamiliesService.getFamilies
  });

  // Fetch models when family changes
  const { data: models = [], isLoading: loadingModels } = useQuery({
    queryKey: ['models', familyId],
    queryFn: () => VehicleFamiliesService.getModelsByFamily(familyId),
    enabled: !!familyId && activeTab !== 'family' && activeTab !== 'year'
  });

  // Fetch transmissions when model changes
  const { data: transmissions = [], isLoading: loadingTransmissions } = useQuery({
    queryKey: ['transmissions', familyId, modelName],
    queryFn: () => VehicleFamiliesService.getTransmissionsByModel(familyId, modelName),
    enabled: !!familyId && !!modelName && (activeTab === 'fuel' || activeTab === 'line')
  });

  // Fetch fuels when transmission changes
  const { data: fuels = [], isLoading: loadingFuels } = useQuery({
    queryKey: ['fuels', familyId, modelName, transmissionName],
    queryFn: () => VehicleFamiliesService.getFuelsByTransmission(familyId, modelName, transmissionName),
    enabled: !!familyId && !!modelName && !!transmissionName && activeTab === 'line'
  });

  // Create attribute mutation
  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: AttributeFormData) => {
      switch (activeTab) {
        case 'family':
          return await VehicleFamiliesService.createFamily(data.familyName);
        case 'model':
          return await VehicleFamiliesService.addModel(data.familyId, data.modelName, data.year);
        case 'transmission':
          return await VehicleFamiliesService.addTransmission(
            data.familyId,
            data.modelName,
            data.transmissionName,
            data.year
          );
        case 'fuel':
          return await VehicleFamiliesService.addFuel(
            data.familyId,
            data.modelName,
            data.transmissionName,
            data.fuelName,
            data.year
          );
        case 'line':
          return await VehicleFamiliesService.addLine(
            data.familyId,
            data.modelName,
            data.transmissionName,
            data.fuelName,
            data.lineName,
            data.year
          );
        case 'year':
          return await VehicleFamiliesService.addYear(data.familyId, parseInt(data.year));
        default:
          throw new Error('Tipo de atributo no válido');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      if (familyId) {
        queryClient.invalidateQueries({ queryKey: ['models', familyId] });
      }
      if (familyId && modelName) {
        queryClient.invalidateQueries({ queryKey: ['transmissions', familyId, modelName] });
      }
      if (familyId && modelName && transmissionName) {
        queryClient.invalidateQueries({ queryKey: ['fuels', familyId, modelName, transmissionName] });
      }
      reset();
      notification.success({
        message: `${activeTab === 'family' ? 'Familia' :
          activeTab === 'model' ? 'Modelo' :
          activeTab === 'transmission' ? 'Transmisión' :
          activeTab === 'fuel' ? 'Combustible' :
          activeTab === 'line' ? 'Línea' : 'Año'} agregado exitosamente`
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      notification.error({
        message: `Error al agregar ${activeTab}`,
        description: error.message
      });
    }
  });

  const getIconForType = (type: AttributeType) => {
    switch (type) {
      case 'family':
        return <Building2 className="w-4 h-4" />;
      case 'model':
        return <Car className="w-4 h-4" />;
      case 'transmission':
        return <Settings className="w-4 h-4" />;
      case 'fuel':
        return <Fuel className="w-4 h-4" />;
      case 'line':
        return <Tag className="w-4 h-4" />;
      case 'year':
        return <Calendar className="w-4 h-4" />;
    }
  };

  const onSubmit = (data: AttributeFormData) => {
    mutate(data);
  };

  if (loadingFamilies) {
    return (
      <div className="flex items-center justify-center min-h-[200px] animate-fade-in">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-in">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          {breadcrumb.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <span
                className={`${index === breadcrumb.length - 1 ? 'text-blue-600 font-medium' : ''}`}
                onClick={() => index !== breadcrumb.length - 1 && setActiveTab(item.id)}
                style={{ cursor: index !== breadcrumb.length - 1 ? 'pointer' : 'default' }}
              >
                {item.label}
              </span>
              {index < breadcrumb.length - 1 && (
                <ChevronRight className="w-4 h-4 mx-2" />
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Gestión de Atributos de Vehículos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { id: 'family', label: 'Familia' },
            { id: 'model', label: 'Modelo' },
            { id: 'transmission', label: 'Transmisión' },
            { id: 'fuel', label: 'Combustible' },
            { id: 'line', label: 'Línea' },
            { id: 'year', label: 'Año' },
          ].map((type, index) => (
            <button
              key={type.id}
              onClick={() => {
                setActiveTab(type.id as AttributeType);
                reset();
              }}
              className={`
                flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium
                transition-all duration-200 transform hover:scale-105
                ${activeTab === type.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                animate-slide-in
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {getIconForType(type.id as AttributeType)}
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {isFormVisible && (
          <div className="space-y-4 animate-slide-in">
            {activeTab !== 'family' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Familia
                </label>
                <select
                  {...register('familyId', { required: 'Este campo es requerido' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Selecciona una familia</option>
                  {families.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
                {errors.familyId && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.familyId.message}</p>
                )}
              </div>
            )}

            {activeTab === 'family' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Familia
                </label>
                <input
                  type="text"
                  {...register('familyName', { required: 'Este campo es requerido' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Ej: Toyota"
                />
                {errors.familyName && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.familyName.message}</p>
                )}
              </div>
            )}

            {activeTab === 'year' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <input
                  type="number"
                  {...register('year', { 
                    required: 'Este campo es requerido',
                    min: {
                      value: 1900,
                      message: 'El año debe ser mayor a 1900'
                    },
                    max: {
                      value: new Date().getFullYear() + 1,
                      message: 'El año no puede ser mayor al próximo año'
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder={new Date().getFullYear().toString()}
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.year.message}</p>
                )}
              </div>
            )}

            {activeTab === 'model' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  {...register('modelName', { 
                    required: 'Este campo es requerido',
                    validate: {
                      notEmpty: (value) => value.trim() !== '' || 'El nombre del modelo no puede estar vacío',
                      validFormat: (value) => typeof value === 'string' || 'El nombre del modelo debe ser texto'
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Ej: Corolla"
                />
                {errors.modelName && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.modelName.message}</p>
                )}
              </div>
            )}

            {activeTab === 'transmission' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transmisión
                </label>
                <input
                  type="text"
                  {...register('transmissionName', { required: 'Este campo es requerido' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Ej: Automática"
                />
                {errors.transmissionName && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in">
                    {errors.transmissionName.message}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'fuel' && (
              <div className="space-y-4">
                {/* Model selection for fuel tab */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <select
                    {...register('modelName', { required: 'Este campo es requerido' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">Selecciona un modelo</option>
                    {models.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                  {errors.modelName && (
                    <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.modelName.message}</p>
                  )}
                  {loadingModels && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cargando modelos...
                    </div>
                  )}
                </div>
                
                {/* Transmission selection for fuel tab */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transmisión
                  </label>
                  <select
                    {...register('transmissionName', { required: 'Este campo es requerido' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">Selecciona una transmisión</option>
                    {transmissions.map((transmission) => (
                      <option key={transmission.value} value={transmission.value}>
                        {transmission.label}
                      </option>
                    ))}
                  </select>
                  {errors.transmissionName && (
                    <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.transmissionName.message}</p>
                  )}
                  {loadingTransmissions && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cargando transmisiones...
                    </div>
                  )}
                </div>
                
                {/* Fuel input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Combustible
                  </label>
                  <input
                    type="text"
                    {...register('fuelName', { 
                      required: 'Este campo es requerido',
                      validate: {
                        notEmpty: (value) => value.trim() !== '' || 'El nombre del combustible no puede estar vacío'
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Ej: Gasolina"
                  />
                  {errors.fuelName && (
                    <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.fuelName.message}</p>
                  )}
                  {transmissions.length === 0 && !!familyId && !!modelName ? (
                    <div className="mt-2 flex items-center text-sm text-amber-600">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      No hay transmisiones disponibles para este modelo. Agregue una transmisión primero.
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {activeTab === 'line' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Línea
                </label>
                <input
                  type="text"
                  {...register('lineName', { required: 'Este campo es requerido' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Ej: GLS"
                />
                {errors.lineName && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.lineName.message}</p>
                )}
              </div>
            )}

            {['model', 'transmission', 'fuel', 'line'].includes(activeTab) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año (opcional)
                </label>
                <input
                  type="number"
                  {...register('year', {
                    validate: {
                      validYear: (value) => {
                        if (!value) return true; // Optional field
                        const yearNum = parseInt(value);
                        if (isNaN(yearNum) || yearNum <= 0) {
                          return 'Formato de año inválido';
                        }
                        if (yearNum < 1900) {
                          return 'El año debe ser mayor a 1900';
                        }
                        if (yearNum > new Date().getFullYear() + 1) {
                          return 'El año no puede ser mayor al próximo año';
                        }
                        return true;
                      }
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder={new Date().getFullYear().toString()}
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.year.message}</p>
                )}
              </div>
            )}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            mt-8 w-full py-3 px-4 rounded-lg font-medium
            transition-all duration-200 transform hover:scale-102
            flex items-center justify-center gap-2
            ${isSubmitting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
            }
            text-white shadow-md
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              Añadir {
                activeTab === 'family' ? 'Familia' :
                activeTab === 'model' ? 'Modelo' :
                activeTab === 'transmission' ? 'Transmisión' :
                activeTab === 'fuel' ? 'Combustible' :
                activeTab === 'line' ? 'Línea' : 'Año'
              }
            </>
          )}
        </button>
      </form>
    </div>
  );
};