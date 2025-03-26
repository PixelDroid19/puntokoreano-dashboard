import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormSuccess from "../ui/FormSuccess";

interface brandFormData {
  name: string;
  country: string;
  active: boolean;
}

export default function brandForm() {
  const [formSuccess, setFormSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<brandFormData>({
    defaultValues: {
      active: true,
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: brandFormData) =>
      VehicleFamiliesService.createBrand({
        name: data.name!,
        country: data.country,
        active: true,
      }),
    onSuccess: () => {
      // data contains the response from createBrand
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setFormSuccess(true);

      // Example of using data from onSuccess to customize the success message description
      /* addActivity({
        type: "brand",
        title: "Nueva marca creada",
        description: data.data.name, // Access data.data.name if your response structure is like that
        timestamp: new Date(),
      }); */

      // Resetear el formulario después de un tiempo
      setTimeout(() => {
        reset();
        setFormSuccess(false);
      }, 1500);
    },
    onError: (error: Error) => {
      console.error(error);
    },
  });

  const onSubmit = (data: brandFormData) => {
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
          title="¡Marca creada con éxito!"
          description="La marca ha sido registrada correctamente"
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Nombre de la Marca
            </label>
            <div className="relative">
              <Input
                placeholder="Ingrese el nombre de la marca"
                {...register("name", {
                  required: "El nombre de la marca es requerido",
                })}
                className={`${
                  errors.name ? "border-red-300 focus:border-red-500 pr-10" : ""
                }`}
              />
              {errors.name && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </motion.div>
                </div>
              )}
            </div>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 mt-1"
              >
                {errors.name.message}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              País de Origen
            </label>
            <Input
              placeholder="Ingrese el país de origen"
              {...register("country")}
            />
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md transition-all duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Creando Marca...
                </>
              ) : (
                "Crear Marca"
              )}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}
