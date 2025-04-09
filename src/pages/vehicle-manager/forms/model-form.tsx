import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import FamilySelector from "../selectors/family-selector";
import { useState } from "react";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormSuccess from "../ui/FormSuccess";

interface ModelFormData {
  name: string;
  active: boolean;

  family_id: string;
  engineType: string;
  year: string;
}

export default function ModelForm() {
  const [formSuccess, setFormSuccess] = useState(false);
  const [selectedFamilyValue, setSelectedFamilyValue] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ModelFormData>({
    defaultValues: {
      active: true,

      family_id: "",
      engineType: "",
      year: "",
    },
  });
  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: ModelFormData) =>
      VehicleFamiliesService.addModel({
        name: data.name,
        engineType: data.engineType!,
        year: data.year!,
        familyId: data.family_id!,
        active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      setFormSuccess(true);

      /*   // Añadir actividad
      addActivity({
        type: "model",
        title: "Nuevo modelo añadido",
        description: data.data.name,
        timestamp: new Date(),
      }); */

      setTimeout(() => {
        reset();
        setFormSuccess(false);
      }, 1500);
    },
    onError: (error: Error) => {
      console.error(error);
    },
  });

  const onSubmit = (data: ModelFormData) => {
    console.log(data);
    mutate({
      ...data,
      family_id: data.family_id.value
    });
  };


  const handleFamilyChange = (value: string | null) => {
    setSelectedFamilyValue(value);
    setValue("family_id", value || "");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formSuccess ? (
        <FormSuccess
          title="Modelo creado con éxito!"
          description="El Modelo ha sido registrada correctamente"
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">


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
              {...register("engineType", {
                required: "El tipo de motor es requerido",
              })}
            />
            {errors.engineType && (
              <p className="text-sm text-red-500 mt-1">
                {errors.engineType.message}
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
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-md"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Creando Modelo..." : "Crear Modelo"}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}
