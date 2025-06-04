import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormSuccess from "../ui/FormSuccess";
import { useState, useEffect } from "react";
import FormError from "./FormError";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

interface TransmissionFormData {
  name: string;
  active: boolean;
}

interface TransmissionFormProps {
  initialValues?: Partial<TransmissionFormData>;
  mode?: "create" | "edit";
  onSubmit?: (data: TransmissionFormData) => void;
}

export default function TransmissionForm({ initialValues, mode = "create", onSubmit }: TransmissionFormProps) {
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<{ message: string; errors?: string[] } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransmissionFormData>({
    defaultValues: {
      name: initialValues?.name || "",
      active: initialValues?.active ?? true,
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setValue("name", initialValues.name || "");
      setValue("active", initialValues.active ?? true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, mode]);

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: TransmissionFormData) =>
      VehicleFamiliesService.addTransmission(data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transmissions"] });
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

  const handleFormSubmit = (data: TransmissionFormData) => {
    setFormError(null);
    if (onSubmit) {
      onSubmit(data);
    } else {
      mutate(data);
    }
  };

  useEffect(() => {
    setFormError(null);
  }, [errors.name]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formSuccess ? (
        <FormSuccess
          title={mode === "edit" ? "¡Transmisión actualizada con éxito!" : "Transmisión creada con éxito!"}
          description={mode === "edit" ? "La transmisión ha sido actualizada correctamente" : "La Transmisión ha sido registrada correctamente"}
        />
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {formError && (
            <FormError title="Error" description={formError.message} errors={formError.errors} />
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium mb-1">
                Nombre de la Transmisión <span className="text-red-500">*</span>
              </label>
              <Tooltip title="Nombre del tipo de transmisión. Este campo es obligatorio y debe ser único (ej. Automática, Manual).">
                <InfoCircleOutlined className="text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <Input
              placeholder="Ingrese el nombre de la transmisión (ej. Automática, Manual)"
              {...register("name", {
                required: "El nombre de la transmisión es requerido",
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  {mode === "edit" ? "Actualizando Transmisión..." : "Creando Transmisión..."}
                </>
              ) : (
                mode === "edit" ? "Actualizar Transmisión" : "Crear Transmisión"
              )}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}
