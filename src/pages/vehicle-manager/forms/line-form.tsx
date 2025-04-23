// --- START OF FILE line-form.tsx ---

import { useForm, Controller } from "react-hook-form"; // Import Controller
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input"; // Assuming ShadCN UI Input
import { Button } from "../ui/button";
import ModelSelector, { ModelsOption } from "../selectors/model-selector";
import { useState, useEffect } from "react";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormSuccess from "../ui/FormSuccess";
import { NumericFormat } from "react-number-format"; // Import NumericFormat
import { AlertCircle } from "lucide-react"; // For error icons
import FormError from "./FormError";

interface LineFormData {
  name: string;
  features: string;
  price?: number;
  model_id: string;
  active: boolean;
}

interface LineFormProps {
  initialValues?: Partial<LineFormData>;
  mode?: "create" | "edit";
  onSubmit?: (data: LineFormData) => void;
}

export default function LineForm({ initialValues, mode = "create", onSubmit }: LineFormProps) {
  const [formSuccess, setFormSuccess] = useState(false);
  const [selectedModelValue, setSelectedModelValue] = useState<string | null>(initialValues?.model_id || null);
  const [apiError, setApiError] = useState<string | null>(null); // State for API errors
  const [formError, setFormError] = useState<{ message: string; errors?: string[] } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control, // Destructure control for Controller
    formState: { errors },
  } = useForm<LineFormData>({
    defaultValues: {
      name: initialValues?.name || "",
      features: initialValues?.features || "",
      price: initialValues?.price ?? undefined,
      model_id: initialValues?.model_id || "",
      active: initialValues?.active ?? true,
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setValue("name", initialValues.name || "");
      setValue("features", initialValues.features || "");
      setValue("price", initialValues.price ?? undefined);
      setValue("model_id", initialValues.model_id || "");
      setValue("active", initialValues.active ?? true);
      setSelectedModelValue(initialValues.model_id || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, mode]);

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: LineFormData) =>
      VehicleFamiliesService.addLine(
        data.model_id!,
        data.name!,
        data.features!,
        data.price,
        data.active
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lines"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAnalytics"] });
      setFormSuccess(true);
      setApiError(null); // Clear previous API errors
      setFormError(null); // Limpia el error tras éxito
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

  const handleFormSubmit = (data: LineFormData) => {
    setFormError(null);
    const payload = {
      ...data,
      model_id:
        typeof data.model_id === "object" && data.model_id !== null
          ? data.model_id.value
          : data.model_id,
    };
    if (onSubmit) {
      onSubmit(payload);
    } else {
      mutate(payload);
    }
  };

  const handleModelChange = (value: string | null) => {
    setSelectedModelValue(value);
    setValue("model_id", value || "");
  };

  // Limpia el error si el usuario cambia los campos relevantes
  useEffect(() => {
    setFormError(null);
  }, [
    errors.name,
    errors.model_id,
    errors.features,
    errors.price
  ]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formSuccess ? (
        <FormSuccess
          title={mode === "edit" ? "¡Línea actualizada con éxito!" : "Línea creada con éxito!"}
          description={mode === "edit" ? "La línea ha sido actualizada correctamente" : "La Línea ha sido registrada correctamente"}
        />
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Mostrar error de API */}
          {apiError && (
             <div className="bg-destructive/15 border border-destructive text-destructive px-3 py-2 rounded-md flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {apiError}
            </div>
          )}

          {formError && (
            <FormError title="Error" description={formError.message} errors={formError.errors} />
          )}

          <div className="space-y-2">
            <label htmlFor="model_id_field" className="block text-sm font-medium mb-1">Modelo *</label>
            <Controller
                name="model_id"
                control={control}
                rules={{ required: "Debe seleccionar un modelo" }} // Add validation rule
                render={({ field }) => (
                     <ModelSelector
                        // Pass necessary props from field if ModelSelector expects them directly
                        // Or handle it via the onChange wrapper below
                        inputId="model_id_field"
                        value={selectedModelValue} // Keep local state for the selector component itself
                        onChange={(selectedOption) => {
                           field.onChange(selectedOption?.value || ""); // Update RHF state with the ID
                           handleModelChange(selectedOption?.value || null); // Update local state for selector display
                        }}
                        // Add aria-invalid for accessibility
                         aria-invalid={errors.model_id ? "true" : "false"}
                      />
                )}
             />
            {errors.model_id && (
              <p className="text-sm text-red-500 mt-1">{errors.model_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="line_name" className="block text-sm font-medium mb-1">Nombre de la Línea *</label>
            <Input
              id="line_name"
              placeholder="Ingrese el nombre de la línea (Ej: XLE, SE)"
              {...register("name", { required: "El nombre de la línea es requerido" })}
              aria-invalid={errors.name ? "true" : "false"}
              className={errors.name ? "border-destructive focus:border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="features" className="block text-sm font-medium mb-1">Características (Opcional)</label>
            <Input
              id="features"
              placeholder="Ej: Techo solar, Asientos de cuero, GPS"
              {...register("features")} // Es opcional, no necesita validación `required`
            />
             {/* No suele haber errores para campos opcionales a menos que haya otras validaciones */}
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-medium mb-1">Precio Base (Opcional)</label>
             <Controller
                name="price"
                control={control}
                 rules={{ // Opcional: Validaciones adicionales
                    min: { value: 0, message: "El precio no puede ser negativo" },
                 }}
                render={({ field: { onChange, onBlur, value, name } }) => (
                    <NumericFormat
                        id="price"
                        customInput={Input} // Usa tu componente Input de ShadCN/UI
                        placeholder="Ingrese el precio base"
                        thousandSeparator="." // Separador de miles
                        decimalSeparator=","   // Separador decimal
                        prefix="$ "            // Prefijo de moneda
                        allowNegative={false}   // No permitir negativos
                        decimalScale={0}        // Sin decimales (ajusta si necesitas)
                        value={value ?? ""}       // Usa el valor del field, o "" si es null/undefined
                        onValueChange={(values) => {
                             // Actualiza react-hook-form con el valor numérico o null
                            onChange(values.floatValue ?? null);
                        }}
                        onBlur={onBlur} // Propaga onBlur para validación de RHF
                        name={name}     // Propaga name
                        aria-invalid={errors.price ? "true" : "false"}
                        className={errors.price ? "border-destructive focus:border-destructive" : ""}
                    />
                )}
             />
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  {mode === "edit" ? "Actualizando Línea..." : "Creando Línea..."}
                </>
              ) : (
                mode === "edit" ? "Actualizar Línea" : "Crear Línea"
              )}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}
// --- END OF FILE line-form.tsx ---