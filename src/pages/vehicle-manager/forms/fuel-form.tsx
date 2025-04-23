import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import { useState, useEffect } from "react";
import FormSuccess from "../ui/FormSuccess";
import FormError from "./FormError";

interface FuelFormData {
  name: string;
  octane_rating: number;
  active: boolean;
}

export default function FuelForm() {
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<{ message: string; errors?: string[] } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FuelFormData>({
    defaultValues: {
      active: true,
      octane_rating: 87,
    },
  });

  // const addActivity = useVehicleStore((state) => state.addActivity);
  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: FuelFormData) =>
      VehicleFamiliesService.addFuel(data.name, data.octane_rating),
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
  }, [
    errors.name,
    errors.octane_rating
  ]);

  const onSubmit = (data: FuelFormData) => {
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
          title="Combustible creado con éxito!"
          description="El Combustible ha sido registrada correctamente"
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <FormError title="Error" description={formError.message} errors={formError.errors} />
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Tipo de Combustible
            </label>
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

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">Octanaje</label>
            <Input
              type="number"
              placeholder="Ingrese el octanaje"
              {...register("octane_rating", {
                valueAsNumber: true,
                min: { value: 0, message: "El octanaje debe ser positivo" },
              })}
            />
            {errors.octane_rating && (
              <p className="text-sm text-red-500 mt-1">
                {errors.octane_rating.message}
              </p>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? " Creando Combustible..." : "Crear Combustible"}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}
