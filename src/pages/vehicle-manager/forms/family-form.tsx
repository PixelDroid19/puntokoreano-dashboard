import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import BrandSelector from "../selectors/brand-selector";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import { useState } from "react";
import FormSuccess from "../ui/FormSuccess";

interface FamilyFormData {
  name: string;
  active: boolean;
  brand_id: string;
}

export default function FamilyForm() {
  const [formSuccess, setFormSuccess] = useState(false);
  const [selectedBrandValue, setSelectedBrandValue] = useState<string | null>(
    null
  );
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FamilyFormData>({
    defaultValues: {
      active: true,
      brand_id: "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: FamilyFormData) =>
      VehicleFamiliesService.createFamily({
        name: data.name!,
        brand_id: data.brand_id!,
        active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      setFormSuccess(true);

      setTimeout(() => {
        reset();
        setFormSuccess(false);
      }, 1500);
    },
    onError: (error: Error) => {
      console.error(error);
    },
  });

  const onSubmit = (data: FamilyFormData) => {
    if (!selectedBrandValue) {
      console.error("No brand selected");
      return;
    }

    mutate({
      ...data,
      brand_id: selectedBrandValue,
    });
  };

  const handleBrandChange = (value: string | null) => {
    setSelectedBrandValue(value);
    setValue("brand_id", value || "");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formSuccess ? (
        <FormSuccess
          title="Familia creada con éxito!"
          description="La Familia ha sido registrada correctamente"
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">Marca</label>
            <BrandSelector
              onChange={handleBrandChange}
              value={selectedBrandValue}
            />
            {!selectedBrandValue && (
              <p className="text-sm text-red-500 mt-1">Marca es requerida</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Nombre de la Familia
            </label>
            <Input
              placeholder="Ingrese el nombre de la familia"
              {...register("name", {
                required: "El nombre de la familia es requerido",
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Creando Familia...
                </>
              ) : (
                "Crear Familia"
              )}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}
