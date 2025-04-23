import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import FamilySelector from "../selectors/family-selector";
import { useState, useEffect } from "react";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormSuccess from "../ui/FormSuccess";
import FormError from "./FormError";

interface ModelFormData {
  name: string;
  active: boolean;
  family_id: string;
  engineType: string;
  year: string;
}

export default function ModelForm() {
  const [formSuccess, setFormSuccess] = useState(false);
  const [selectedFamilyValue, setSelectedFamilyValue] = useState<string>("");
  const [formError, setFormError] = useState<{ message: string; errors?: string[] } | null>(null);

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

  const onSubmit = (data: ModelFormData) => {
    const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);
    if (!data.family_id || typeof data.family_id !== "string" || !isValidObjectId(data.family_id)) {
      setFormError({ message: "Debe seleccionar una familia válida." });
      return;
    }

    const currentYear = new Date().getFullYear();
    const yearNum = Number(data.year);
    if (
      !/^[0-9]{4}$/.test(data.year) ||
      isNaN(yearNum) ||
      yearNum < 1900 ||
      yearNum > currentYear + 1 // Permite hasta el próximo año
    ) {
      setFormError({ message: `Ingrese un año válido entre 1900 y ${currentYear + 1}.` });
      return;
    }
    mutate({
      ...data,
      family_id: data.family_id,
    });
  };

  const handleFamilyChange = (option: any) => {
    // Permite tanto string como objeto, pero siempre guarda el ID string
    let id = "";
    if (typeof option === "object" && option !== null && typeof option.value === "string") {
      id = option.value;
    } else if (typeof option === "string") {
      id = option;
    }
    setSelectedFamilyValue(id);
    setValue("family_id", id, { shouldValidate: true });
  };

  useEffect(() => {
    setFormError(null);
  }, [
    errors.name,
    errors.family_id,
    errors.year,
    errors.engineType
  ]);

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
          {formError && (
            <FormError title="Error" description={formError.message} errors={formError.errors} />
          )}

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
                pattern: {
                  value: /^[0-9]{4}$/,
                  message: "El año debe tener 4 dígitos",
                },
                validate: (value) => {
                  const yearNum = Number(value);
                  const currentYear = new Date().getFullYear();
                  if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
                    return `Ingrese un año válido entre 1900 y ${currentYear + 1}.`;
                  }
                  return true;
                },
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
