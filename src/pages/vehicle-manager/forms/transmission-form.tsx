import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormSuccess from "../ui/FormSuccess";
import { useState } from "react";

interface TransmissionFormData {
  name: string;
  gears?: number;
}

export default function TransmissionForm() {
  const [formSuccess, setFormSuccess] = useState(false);
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
      setFormSuccess(true);

      /*    // Añadir actividad -  This section is commented out, keeping it as is
      addActivity({
        type: "transmission",
        title: "Transmisión creada",
        description: `${data.data.name} (${data.data.gears} velocidades)`,
        timestamp: new Date(),
      })*/
      setTimeout(() => {
        reset();
        setFormSuccess(false);
      }, 1500);
    },
    onError: (error: Error) => {
      console.error("Error creating transmission:", error);
    },
  });

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
