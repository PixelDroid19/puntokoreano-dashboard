import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormError from "./FormError";

interface BrandFormData {
  name: string;
  active?: boolean;
}

interface BrandFormProps {
  mode?: "create" | "edit";
  initialValues?: Partial<BrandFormData>;
  onSubmit?: (data: BrandFormData) => void;
}

export default function BrandForm({ 
  mode = "create", 
  initialValues, 
  onSubmit 
}: BrandFormProps) {
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<{ message: string; errors?: string[] } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BrandFormData>({
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
  }, [initialValues, mode, setValue]);

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: BrandFormData) => {
      return VehicleFamiliesService.createBrand({
        name: data.name.trim(),
        active: data.active ?? true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["vehicleBrands"] });
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

  const handleFormSubmit = (data: BrandFormData) => {
    setFormError(null);
    const payload = {
      name: data.name.trim(),
      active: data.active ?? true,
    };
    
    if (onSubmit) {
      onSubmit(payload);
    } else {
      mutate(payload);
    }
  };

  return (
    <>
      {formSuccess ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="bg-green-100 text-green-600 rounded-full p-4 mb-4"
          >
            <Check className="w-12 h-12" />
          </motion.div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {mode === "edit" ? "¡Marca actualizada con éxito!" : "¡Marca creada con éxito!"}
          </h3>
          <p className="text-gray-500">
            {mode === "edit" 
              ? "La marca ha sido actualizada correctamente" 
              : "La marca ha sido registrada correctamente"
            }
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
            <div className="flex items-center gap-2">
                <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">
                  * Nombre de la marca
              </label>
                <Tooltip title="Ingresa el nombre de la marca del vehículo. Este campo es obligatorio.">
                <InfoCircleOutlined className="text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <div className="relative">
              <Input
                  id="name"
                  placeholder="Ssangyong"
                {...register("name", {
                  required: "El nombre de la marca es requerido",
                })}
                  className={`${errors.name ? "border-red-300 focus:border-red-500 pr-10" : "border-gray-300"}`}
              />
              {errors.name && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </motion.div>
                </div>
              )}
            </div>
            {errors.name && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-500 mt-1">
                {errors.name.message}
              </motion.p>
            )}
          </div>
          </div>

          {formError && (
            <FormError title="Error" description={formError.message} errors={formError.errors} />
          )}

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-4">
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-md flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting 
                ? (mode === "edit" ? "Actualizando Marca..." : "Creando Marca...") 
                : (mode === "edit" ? "Actualizar Marca" : "Crear Marca")
              }
            </Button>
          </motion.div>
        </form>
      )}
    </>
  );
}
