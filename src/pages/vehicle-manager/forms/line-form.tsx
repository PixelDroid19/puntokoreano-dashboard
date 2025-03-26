import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import BrandSelector from "../selectors/brand-selector";
import ModelSelector from "../selectors/model-selector";
import { useState } from "react";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormSuccess from "../ui/FormSuccess";

interface LineFormData {
  name: string;
  model_id: string;
  brand_id: string;
  features?: string;
  price?: string;
  active: boolean;
}

export default function LineForm() {
  const [formSuccess, setFormSuccess] = useState(false);
  const [selectedBrandValue, setSelectedBrandValue] = useState<string | null>(
    null
  );
  const [selectedModelValue, setSelectedModelValue] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LineFormData>({
    defaultValues: {
      active: true,
      model_id: "",
      brand_id: "",
      name: "",
      features: "",
      price: "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: LineFormData) =>
      VehicleFamiliesService.addLine(
        data.brand_id,
        data.model_id,
        data.name,
        data.features || "",
        data.price || "",
        data.active
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lines"] });
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

  const onSubmit = (data: LineFormData) => {
    mutate({
      ...data,
      brand_id: selectedBrandValue || "",
      model_id: selectedModelValue || "",
    });
  };

  const handleBrandChange = (value: string | null) => {
    setSelectedBrandValue(value);
    setValue("brand_id", value || "");
  };

  const handleModelChange = (value: string | null) => {
    setSelectedModelValue(value);
    setValue("model_id", value || "");
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
          {/* Selector de Marca */}
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">Marca</label>
            <BrandSelector
              onChange={handleBrandChange}
              value={selectedBrandValue}
            />
          </div>

          {/* Selector de Modelo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">Modelo</label>
            <ModelSelector
              onChange={handleModelChange}
              value={selectedModelValue}
            />
          </div>

          {/* Nombre de la Línea */}
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Nombre de la Línea
            </label>
            <Input
              placeholder="Ingrese el nombre de la línea"
              {...register("name", {
                required: "El nombre de la línea es requerido",
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Características */}
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Características (Opcional)
            </label>
            <Input
              placeholder="Ingrese las características (Ej: tracción)"
              {...register("features")}
            />
          </div>

          {/* Precio */}
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-1">
              Precio (Opcional)
            </label>
            <Input placeholder="Ingrese el precio" {...register("price")} />
          </div>

          {/* Botón de Envío */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
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
