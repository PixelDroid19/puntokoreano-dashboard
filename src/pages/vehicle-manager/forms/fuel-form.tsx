import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import { useState, useEffect } from "react";
import FormSuccess from "../ui/FormSuccess";
import FormError from "./FormError";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

interface FuelFormData {
  name: string;
  active: boolean;
}

interface FuelFormProps {
  initialValues?: Partial<FuelFormData>;
  mode?: "create" | "edit";
  onSubmit?: (data: FuelFormData) => void;
}

export default function FuelForm({ initialValues, mode = "create", onSubmit }: FuelFormProps) {
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<{ message: string; errors?: string[] } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FuelFormData>({
    defaultValues: {
      name: initialValues?.name || "",
      active: initialValues?.active ?? true,
    },
  });

  // const addActivity = useVehicleStore((state) => state.addActivity);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setValue("name", initialValues.name || "");
      setValue("active", initialValues.active ?? true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, mode]);

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: FuelFormData) =>
      VehicleFamiliesService.addFuel(data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuels"] });
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

  useEffect(() => {
    setFormError(null);
  }, [errors.name]);

  const handleFormSubmit = (data: FuelFormData) => {
    setFormError(null);
    if (onSubmit) {
      onSubmit(data);
    } else {
      mutate(data);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formSuccess ? (
        <FormSuccess
          title={mode === "edit" ? "¡Combustible actualizado con éxito!" : "Combustible creado con éxito!"}
          description={mode === "edit" ? "El combustible ha sido actualizado correctamente" : "El Combustible ha sido registrado correctamente"}
        />
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {formError && (
            <FormError title="Error" description={formError.message} errors={formError.errors} />
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium mb-1">
                Tipo de Combustible <span className="text-red-500">*</span>
              </label>
              <Tooltip title="Tipo de combustible que utiliza el vehículo. Este campo es obligatorio y debe ser único (ej. Gasolina, Diésel).">
                <InfoCircleOutlined className="text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <Input
              placeholder="Ingrese el tipo de combustible (ej. Gasolina, Diésel)"
              {...register("name", {
                required: "El tipo de combustible es requerido",
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? (mode === "edit" ? " Actualizando Combustible..." : " Creando Combustible...") : (mode === "edit" ? "Actualizar Combustible" : "Crear Combustible")}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}
