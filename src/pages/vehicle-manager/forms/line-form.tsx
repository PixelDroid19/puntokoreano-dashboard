// --- START OF FILE line-form.tsx ---

import { useForm, Controller } from "react-hook-form"; // Import Controller
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input"; // Assuming ShadCN UI Input
import { Button } from "../ui/button";
import ModelSelector, { ModelsOption } from "../selectors/model-selector";
import { useState } from "react";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormSuccess from "../ui/FormSuccess";
import { NumericFormat, PatternFormat } from "react-number-format"; // Import NumericFormat
import { AlertCircle } from "lucide-react"; // For error icons

// Interface ajustada: price es number | null | undefined
interface LineFormData {
  name: string;
  model_id: string;
  features?: string; // Ya era opcional
  price?: number | null; // Tipo numérico opcional
  active: boolean;
}

export default function LineForm() {
  const [formSuccess, setFormSuccess] = useState(false);
  const [selectedModelValue, setSelectedModelValue] =
    useState<ModelsOption | null>(null);
  const [apiError, setApiError] = useState<string | null>(null); // State for API errors

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control, // Destructure control for Controller
    formState: { errors },
  } = useForm<LineFormData>({
    defaultValues: {
      active: true,
      model_id: "",
      name: "",
      features: "",
      price: null, // Default price a null o undefined
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    // La función del servicio ahora debe esperar 'price' como número o undefined
    mutationFn: (data: LineFormData) =>
      VehicleFamiliesService.addLine(
        data.model_id,
        data.name,
        data.features,
        data.price, // Pasa el número directamente (o null/undefined)
        data.active
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lines"] });
      setFormSuccess(true);
      setApiError(null); // Clear previous API errors
      setTimeout(() => {
        reset();
        setSelectedModelValue(null);
        setFormSuccess(false);
      }, 1500);
    },
    onError: (error: Error) => {
      console.error("Error creando la línea:", error);
      setApiError(error.message || "Ocurrió un error al crear la línea."); // Set API error message
    },
  });

  const onSubmit = (data: LineFormData) => {
    setApiError(null); // Clear errors before submitting
    if (!data.model_id) {
       // react-hook-form debería manejar esto si model_id es required
       console.error("Modelo no seleccionado");
       return;
    }
    // Price ya es un número (o null/undefined) gracias a NumericFormat
    console.log("Enviando datos de línea:", data);
    mutate(data);
  };

  const handleModelChange = (value: ModelsOption | null) => {
    setSelectedModelValue(value);
    // Registrar model_id como requerido si es necesario en useForm
    setValue("model_id", value?.value || "", { shouldValidate: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formSuccess ? (
        <FormSuccess
          title="Línea creada con éxito!"
          description="La Línea ha sido registrada correctamente"
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Mostrar error de API */}
          {apiError && (
             <div className="bg-destructive/15 border border-destructive text-destructive px-3 py-2 rounded-md flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {apiError}
            </div>
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
                           handleModelChange(selectedOption); // Update local state for selector display
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
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
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
                        ref={ref}       // Propaga ref
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
              className="w-full bg-blue-500 hover:bg-blue-600 text-white" // Removido py-2 rounded-md si tu Button UI ya lo maneja
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2 inline-block"></div>
                  Creando Línea...
                </>
              ) : (
                "Crear Línea"
              )}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}
// --- END OF FILE line-form.tsx ---