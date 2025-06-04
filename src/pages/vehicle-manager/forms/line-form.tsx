import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import ModelSelector from "../selectors/model-selector";
import { useState, useEffect } from "react";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormSuccess from "../ui/FormSuccess";
import { AlertCircle } from "lucide-react";
import FormError from "./FormError";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import type { ModelsOption } from "../../../types/selectors.types";

interface LineFormData {
  name: string;
  model_id: string;
  active: boolean;
}

interface LineFormProps {
  initialValues?: Partial<LineFormData>;
  mode?: "create" | "edit";
  onSubmit?: (data: LineFormData) => void;
}

export default function LineForm({
  initialValues,
  mode = "create",
  onSubmit,
}: LineFormProps) {
  const [formSuccess, setFormSuccess] = useState(false);
  const [selectedModelValue, setSelectedModelValue] = useState<ModelsOption | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formError, setFormError] = useState<{
    message: string;
    errors?: string[];
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<LineFormData>({
    defaultValues: {
      name: initialValues?.name || "",
      model_id: initialValues?.model_id || "",
      active: initialValues?.active ?? true,
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setValue("name", initialValues.name || "");
      setValue("model_id", initialValues.model_id || "");
      setValue("active", initialValues.active ?? true);
      
      // Si tenemos model_id inicial, crear el objeto para el selector
      if (initialValues.model_id) {
        setSelectedModelValue({
          value: initialValues.model_id,
          label: "Modelo seleccionado", // Placeholder - será actualizado por el selector
          modelData: {}
        });
      }
    }
  }, [initialValues, mode, setValue]);

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: LineFormData) =>
      VehicleFamiliesService.addLine(
        data.model_id!,
        data.name!,
        data.active
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lines"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAnalytics"] });
      setFormSuccess(true);
      setApiError(null);
      setFormError(null);
      setTimeout(() => {
        reset();
        setSelectedModelValue(null);
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

  const handleFormSubmit = (data: LineFormData) => {
    setFormError(null);
    const payload = {
      ...data,
      model_id: selectedModelValue?.value || data.model_id,
    };
    if (onSubmit) {
      onSubmit(payload);
    } else {
      mutate(payload);
    }
  };

  const handleModelChange = (selectedOption: ModelsOption | null) => {
    setSelectedModelValue(selectedOption);
    setValue("model_id", selectedOption?.value || "");
  };

  // Limpia el error si el usuario cambia los campos relevantes
  useEffect(() => {
    setFormError(null);
  }, [errors.name, errors.model_id]);

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
              ? "¡Línea actualizada con éxito!"
              : "Línea creada con éxito!"
          }
          description={
            mode === "edit"
              ? "La línea ha sido actualizada correctamente"
              : "La Línea ha sido registrada correctamente"
          }
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
            <FormError
              title="Error"
              description={formError.message}
              errors={formError.errors}
            />
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="model_id_field"
                className="block text-sm font-medium mb-1"
              >
                Modelo <span className="text-red-500">*</span>
              </label>
              <Tooltip title="Selecciona el modelo al que pertenece esta línea. Este campo es obligatorio.">
                <InfoCircleOutlined className="text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <Controller
              name="model_id"
              control={control}
              rules={{ required: "Debe seleccionar un modelo" }} 
              render={({ field }) => (
                <ModelSelector
                  value={selectedModelValue}
                  onChange={(selectedOption) => {
                    field.onChange(selectedOption?.value || "");
                    handleModelChange(selectedOption);
                  }}
                  placeholder="Seleccionar modelo"
                />
              )}
            />
            {errors.model_id && (
              <p className="text-sm text-red-500 mt-1">
                {errors.model_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="line_name"
                className="block text-sm font-medium mb-1"
              >
                Nombre de la Línea <span className="text-red-500">*</span>
              </label>
              <Tooltip title="Nombre de la línea de vehículo. Es obligatorio y debe ser único dentro del modelo.">
                <InfoCircleOutlined className="text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <Input
              id="line_name"
              placeholder="Ingrese el nombre de la línea (Ej: XLE, SE)"
              {...register("name", {
                required: "El nombre de la línea es requerido",
              })}
              aria-invalid={errors.name ? "true" : "false"}
              className={
                errors.name ? "border-destructive focus:border-destructive" : ""
              }
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
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
                  {mode === "edit"
                    ? "Actualizando Línea..."
                    : "Creando Línea..."}
                </>
              ) : mode === "edit" ? (
                "Actualizar Línea"
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
