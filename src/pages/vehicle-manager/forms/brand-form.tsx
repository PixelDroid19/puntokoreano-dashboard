import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormSuccess from "../ui/FormSuccess";
import FormError from "./FormError";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

interface BrandFormData {
  name: string;
  country: string;
  active: boolean;
}

interface BrandFormProps {
  initialValues?: Partial<BrandFormData>;
  mode?: "create" | "edit";
  onSubmit?: (data: BrandFormData) => void;
}

export default function BrandForm({ initialValues, mode = "create", onSubmit }: BrandFormProps) {
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
      country: initialValues?.country || "",
      active: initialValues?.active ?? true,
    },
  });

  const queryClient = useQueryClient();

  // Si el formulario se usa en modo edición y cambian los initialValues, actualiza los valores
  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setValue("name", initialValues.name || "");
      setValue("country", initialValues.country || "");
      setValue("active", initialValues.active ?? true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, mode]);

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: BrandFormData) =>
      VehicleFamiliesService.createBrand({
        name: data.name!,
        country: data.country,
        active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
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

  const handleFormSubmit = (data: BrandFormData) => {
    setFormError(null);
    if (onSubmit) {
      onSubmit(data);
    } else {
      mutate(data);
    }
  };

  useEffect(() => {
    setFormError(null);
  }, [errors.name, errors.country]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formSuccess ? (
        <FormSuccess
          title={mode === "edit" ? "¡Marca actualizada con éxito!" : "¡Marca creada con éxito!"}
          description={mode === "edit" ? "La marca ha sido actualizada correctamente" : "La marca ha sido registrada correctamente"}
        />
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {formError && (
            <FormError title="Error" description={formError.message} errors={formError.errors} />
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium mb-1">
                Nombre de la Marca <span className="text-red-500">*</span>
              </label>
              <Tooltip title="Nombre de la marca. Este campo es obligatorio y debe ser único entre las marcas activas.">
                <InfoCircleOutlined className="text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <div className="relative">
              <Input
                placeholder="Ingrese el nombre de la marca"
                {...register("name", {
                  required: "El nombre de la marca es requerido",
                })}
                className={`${errors.name ? "border-red-300 focus:border-red-500 pr-10" : ""}`}
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
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium mb-1">
                País de Origen
              </label>
              <Tooltip title="País de origen de la marca (opcional). Puedes dejar este campo vacío si no aplica.">
                <InfoCircleOutlined className="text-blue-500 cursor-help" />
              </Tooltip>
            </div>
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
                  {mode === "edit" ? "Actualizando Marca..." : "Creando Marca..."}
                </>
              ) : (
                mode === "edit" ? "Actualizar Marca" : "Crear Marca"
              )}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}
