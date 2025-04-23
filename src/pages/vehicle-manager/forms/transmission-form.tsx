import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormSuccess from "../ui/FormSuccess";
import { useState, useEffect } from "react";
import FormError from "./FormError";

interface TransmissionFormData {
  name: string;
  gears?: number;
}

export default function TransmissionForm() {
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<{ message: string; errors?: string[] } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransmissionFormData>({
    defaultValues: {
      name: "",
      gears: 0, 
    },
  });

  //  const addActivity = useVehicleStore((state) => state.addActivity)
  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: TransmissionFormData) =>
      VehicleFamiliesService.addTransmission(
        // Call addTransmission with name and gears
        data.name,
        data.gears
      ),
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

  // Limpia el error si el usuario cambia los campos relevantes
  useEffect(() => {
    setFormError(null);
  }, [
    errors.name,
    errors.gears
  ]);

  const onSubmit = (data: TransmissionFormData) => {
    mutate(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formSuccess ? (
        <FormSuccess
          title="Transmisión creada con éxito!"
          description="La transmisión ha sido registrada correctamente"
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <FormError title="Error" description={formError.message} errors={formError.errors} />
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Nombre de la Transmisión
            </label>
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

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Número de Velocidades (Opcional)
            </label>
            <Input
              type="number"
              placeholder="Ingrese el número de velocidades (opcional)"
              {...register("gears", {
                valueAsNumber: true,
                min: { value: 1, message: "Debe tener al menos 1 velocidad" },
              })}
            />
            {errors.gears && (
              <p className="text-sm text-red-500 mt-1">
                {errors.gears.message}
              </p>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-md"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Creando Transmisión..." : "Crear Transmisión"}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}
