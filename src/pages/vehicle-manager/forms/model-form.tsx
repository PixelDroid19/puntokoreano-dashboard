import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import FamilySelector from "../selectors/family-selector";
import { useState, useEffect } from "react";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormSuccess from "../ui/FormSuccess";
import FormError from "./FormError";

interface ModelFormData {
  name: string;
  year: number;
  engine_type: string;
  family_id: string;
  active: boolean;
}

interface ModelFormProps {
  initialValues?: Partial<ModelFormData>;
  mode?: "create" | "edit";
  onSubmit?: (data: ModelFormData) => void;
}

export default function ModelForm({ initialValues, mode = "create", onSubmit }: ModelFormProps) {
  const [formSuccess, setFormSuccess] = useState(false);
  const [selectedFamilyValue, setSelectedFamilyValue] = useState<any>(initialValues?.family_id_obj || null);
  const [formError, setFormError] = useState<{ message: string; errors?: string[] } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ModelFormData>({
    defaultValues: {
      name: initialValues?.name || "",
      year: initialValues?.year ?? new Date().getFullYear(),
      engine_type: initialValues?.engine_type || "",
      family_id: initialValues?.family_id || "",
      active: initialValues?.active ?? true,
    },
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setValue("name", initialValues.name || "");
      setValue("year", initialValues.year ?? new Date().getFullYear());
      setValue("engine_type", initialValues.engine_type || "");
      setValue("family_id", initialValues.family_id || "");
      setValue("active", initialValues.active ?? true);
      if (initialValues.family_id && initialValues.family_label) {
        setSelectedFamilyValue({ value: initialValues.family_id, label: initialValues.family_label, brand_id: initialValues.brand_id });
      } else {
        setSelectedFamilyValue(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, mode]);

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: ModelFormData) =>
      VehicleFamiliesService.addModel(data),
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
            errors = Object.values(error.response.data.errors).map((e: any) => e.message || String(e));
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
    console.log('handleFormSubmit',data);
    if (onSubmit) {
      onSubmit(data);
    } else {
      mutate(data);
    }
  };

  const handleFamilyChange = (option: any) => {
   
    setSelectedFamilyValue(option);
    setValue("family_id", option?.value || "");
  };

  useEffect(() => {
    setFormError(null);
  }, [
    errors.name,
    errors.family_id,
    errors.year,
    errors.engine_type
  ]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formSuccess ? (
        <FormSuccess
          title={mode === "edit" ? "¡Modelo actualizado con éxito!" : "Modelo creado con éxito!"}
          description={mode === "edit" ? "El modelo ha sido actualizado correctamente" : "El Modelo ha sido registrado correctamente"}
        />
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {formError && (
            <FormError title="Error" description={formError.message} errors={formError.errors} />
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">Familia</label>
            <FamilySelector
              onChange={handleFamilyChange}
              value={selectedFamilyValue}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">Año <span className="text-red-500">*</span></label>
            <Input
              placeholder="Ingrese el año del modelo (Ej: 2023)"
              {...register("year", {
                required: "El año es requerido",
                pattern: {
                  value: /^[0-9]{4}$/,
                  message: "El año debe tener 4 dígitos",
                },
                validate: (value) => {
                  const yearNum = Number(value);
                  const currentYear = new Date().getFullYear();
                  if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
                    return `Ingrese un año válido entre 1900 y ${currentYear + 1}.`;
                  }
                  return true;
                },
              })}
            />
            {errors.year && (
              <p className="text-sm text-red-500 mt-1">{errors.year.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Tipo de Motor
            </label>
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

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Nombre del Modelo
            </label>
            <Input
              required={false}
              placeholder="Ingrese el nombre del modelo (Ej: Corolla)"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
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
                  {mode === "edit" ? "Actualizando Modelo..." : "Creando Modelo..."}
                </>
              ) : (
                mode === "edit" ? "Actualizar Modelo" : "Crear Modelo"
              )}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}
