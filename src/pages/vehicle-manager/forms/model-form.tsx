import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import FamilySelector from "../selectors/family-selector";
import { useState, useEffect } from "react";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormSuccess from "../ui/FormSuccess";
import FormError from "./FormError";
import { Tooltip, Select, Tag } from "antd";
import { InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";

interface ModelFormData {
  years: number[];
  engine_type: string;
  family_id: string;
  active: boolean;
}

interface ModelFormProps {
  initialValues?: Partial<ModelFormData> & {
    // Propiedades adicionales que pueden estar presentes en initialValues
    year?: number | number[];
    family_id_obj?: any;
    family_label?: string;
    brand_id?: string;
  };
  mode?: "create" | "edit";
  onSubmit?: (data: ModelFormData) => void;
}

export default function ModelForm({
  initialValues,
  mode = "create",
  onSubmit,
}: ModelFormProps) {
  const [formSuccess, setFormSuccess] = useState(false);
  const [selectedFamilyValue, setSelectedFamilyValue] = useState<any>(
    initialValues?.family_id_obj || null
  );
  const [formError, setFormError] = useState<{
    message: string;
    errors?: string[];
  } | null>(null);
  const [inputYearVisible, setInputYearVisible] = useState(false);
  const [inputYearValue, setInputYearValue] = useState('');

  // Generamos años para el selector
  const currentYear = new Date().getFullYear();
  const [yearOptions, setYearOptions] = useState(() => {
    const years = [];
    for (let i = currentYear + 1; i >= 1980; i--) {
      years.push({ label: i.toString(), value: i });
    }
    return years;
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ModelFormData>({
    defaultValues: {
      years: initialValues?.years || initialValues?.year ? 
        Array.isArray(initialValues.year) ? 
          initialValues.year : [initialValues.year] : 
        [currentYear],
      engine_type: initialValues?.engine_type || "",
      family_id: initialValues?.family_id || "",
      active: initialValues?.active ?? true,
    },
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setValue("engine_type", initialValues.engine_type || "");
      setValue("family_id", initialValues.family_id || "");
      setValue("active", initialValues.active ?? true);
      
      // Manejamos años como array siempre
      if (initialValues.years) {
        setValue("years", initialValues.years);
      } else if (initialValues.year) {
        const yearArray = Array.isArray(initialValues.year) ? 
          initialValues.year : [initialValues.year];
        setValue("years", yearArray);
      }
      
      if (initialValues.family_id && initialValues.family_label) {
        setSelectedFamilyValue({
          value: initialValues.family_id,
          label: initialValues.family_label,
          brand_id: initialValues.brand_id,
        });
      } else {
        setSelectedFamilyValue(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, mode]);

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: ModelFormData) => VehicleFamiliesService.addModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAnalytics"] });
      setFormSuccess(true);
      setFormError(null);
      setTimeout(() => {
        reset();
        setFormSuccess(false);
      }, 1500);
    },
    onError: (error: any) => {
      let message = "Ocurrió un error inesperado.";
      let errors: string[] | undefined = undefined;
      if (error?.response?.data) {
        message = error.response.data.message || message;
        if (error.response.data.errors) {
          if (typeof error.response.data.errors === "object") {
            errors = Object.values(error.response.data.errors).map(
              (e: any) => e.message || String(e)
            );
          } else if (Array.isArray(error.response.data.errors)) {
            errors = error.response.data.errors;
          }
        }
      } else if (error?.message) {
        message = error.message;
      }
      setFormError({ message, errors });
    },
  });

  const handleFormSubmit = (data: ModelFormData) => {
    setFormError(null);
    const payload = {
      ...data,
      // Asegurarnos de que years sea un array de números
      years: data.years.map(y => Number(y))
    };
    if (onSubmit) {
      onSubmit(payload);
    } else {
      mutate(payload);
    }
  };

  const handleFamilyChange = (option: any) => {
    setSelectedFamilyValue(option);
    setValue("family_id", option?.value || "");
  };

  // Métodos para el input de años personalizado
  const addCustomYear = () => {
    const year = parseInt(inputYearValue);
    if (!isNaN(year) && year >= 1950 && year <= currentYear + 2) {
      // Verificamos si el año ya existe en las opciones
      if (!yearOptions.some(y => y.value === year)) {
        // Añadimos al principio para mostrar los años más recientes primero
        setYearOptions(prev => [{label: year.toString(), value: year}, ...prev]);
      }
      // Actualizamos el formulario con el nuevo año
      const currentYears = control._formValues.years || [];
      if (!currentYears.includes(year)) {
        setValue("years", [...currentYears, year]);
      }
      setInputYearValue('');
      setInputYearVisible(false);
    }
  };

  useEffect(() => {
    setFormError(null);
  }, [errors.family_id, errors.years, errors.engine_type]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formSuccess ? (
        <FormSuccess
          title={
            mode === "edit"
              ? "¡Modelo actualizado con éxito!"
              : "Modelo creado con éxito!"
          }
          description={
            mode === "edit"
              ? "El modelo ha sido actualizado correctamente"
              : "El Modelo ha sido registrado correctamente"
          }
        />
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {formError && (
            <FormError
              title="Error"
              description={formError.message}
              errors={formError.errors}
            />
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium mb-1">Familia</label>
              <Tooltip title="Selecciona la familia del vehículo. Este campo es obligatorio y debe tener un formato válido.">
                <InfoCircleOutlined className="text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <FamilySelector
              onChange={handleFamilyChange}
              value={selectedFamilyValue}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium mb-1">
                Años <span className="text-red-500">*</span>
              </label>
              <Tooltip
                title="Selecciona los años en que este modelo está disponible. Puedes añadir años personalizados."
              >
                <InfoCircleOutlined className="text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <Controller
              name="years"
              control={control}
              rules={{ 
                required: "Debes seleccionar al menos un año",
                validate: {
                  minLength: (value) => 
                    Array.isArray(value) && value.length > 0 || "Debe seleccionar al menos un año",
                }
              }}
              render={({ field }) => (
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Selecciona los años"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  options={yearOptions}
                  className={errors.years ? "border-red-500" : ""}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div className="border-t border-gray-200 mt-2 pt-2 px-2">
                        {inputYearVisible ? (
                          <div className="flex space-x-2">
            <Input
                              placeholder="Añadir año (1950-2025)"
                              value={inputYearValue}
                              onChange={(e) => setInputYearValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addCustomYear();
                                }
                              }}
                              className="flex-1"
                            />
                            <Button 
                              onClick={addCustomYear}
                              type="button"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              Añadir
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => setInputYearVisible(true)}
                            className="flex items-center w-full justify-center bg-gray-50 text-gray-600 hover:bg-gray-100"
                          >
                            <PlusOutlined className="mr-1" /> Añadir año
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                  tagRender={(props) => {
                    const { label, value, closable, onClose } = props;
                    return (
                      <Tag 
                        color="blue" 
                        closable={closable} 
                        onClose={onClose} 
                        className="mr-1 my-1"
                      >
                        {label}
                      </Tag>
                    );
                  }}
                />
              )}
            />
            {errors.years && (
              <p className="text-sm text-red-500 mt-1">{errors.years.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium mb-1">
                Tipo de Motor
              </label>
              <Tooltip title="Tipo de motor del modelo (ej. Diesel, Eléctrico). Es obligatorio y no puede estar vacío.">
                <InfoCircleOutlined className="text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <Input
              placeholder="Ingrese el tipo de motor (Ej: 1.8L Híbrido)"
              {...register("engine_type", {
                required: "El tipo de motor es requerido",
              })}
            />
            {errors.engine_type && (
              <p className="text-sm text-red-500 mt-1">
                {errors.engine_type.message}
              </p>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  {mode === "edit"
                    ? "Actualizando Modelo..."
                    : "Creando Modelo..."}
                </>
              ) : mode === "edit" ? (
                "Actualizar Modelo"
              ) : (
                "Crear Modelo"
              )}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}
