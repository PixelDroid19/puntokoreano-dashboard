import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import BrandSelector from "../selectors/brand-selector";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import { useState, useEffect } from "react";
import FormSuccess from "../ui/FormSuccess";
import FormError from "./FormError";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

interface FamilyFormData {
  name: string;
  brand_id: string;
  active: boolean;
}

interface FamilyFormProps {
  initialValues?: Partial<{
    name: string;
    active: boolean;
    brand_id: string;
    brand: {
      value: string;
      label: string;
    };
  }>;
  mode?: "create" | "edit";
  onSubmit?: (data: FamilyFormData) => void;
}

export default function FamilyForm({
  initialValues,
  mode = "create",
  onSubmit,
}: FamilyFormProps) {
  const [formSuccess, setFormSuccess] = useState(false);
  const [selectedBrandValue, setSelectedBrandValue] = useState<object | null>();
  const [formError, setFormError] = useState<{
    message: string;
    errors?: string[];
  } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FamilyFormData>({
    defaultValues: {
      name: initialValues?.name || "",
      active: initialValues?.active ?? true,
      brand_id: initialValues?.brand.value || "",
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      setValue("name", initialValues.name || "");
      setValue("brand_id", initialValues.brand.value || "");
      setValue("active", initialValues.active ?? true);
      setSelectedBrandValue({
        value: initialValues?.brand?.value || "",
        label: initialValues?.brand?.label || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, mode]);

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: FamilyFormData) =>
      VehicleFamiliesService.createFamily({
        name: data.name!,
        brand_id: data.brand_id!,
        active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
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
            errors = Object.values(error.response.data.errors).map(
              (e: any) => e.message || String(e)
            );
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

  const handleFormSubmit = (data: FamilyFormData) => {
    setFormError(null);
    const payload = {
      ...data,
    };
    if (onSubmit) {
      onSubmit(payload);
    } else {
      mutate(payload);
    }
  };

  const handleBrandChange = (
    value: {
      value: string;
      label: string;
      country: string;
      brandData: any;
    } | null
  ) => {
    setSelectedBrandValue(value);
    setValue("brand_id", value.value || "");
  };

  useEffect(() => {
    setFormError(null);
  }, [errors.name, errors.brand_id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formSuccess ? (
        <FormSuccess
          title={
            mode === "edit"
              ? "¡Familia actualizada con éxito!"
              : "Familia creada con éxito!"
          }
          description={
            mode === "edit"
              ? "La familia ha sido actualizada correctamente"
              : "La Familia ha sido registrada correctamente"
          }
        />
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {formError && (
            <FormError
              title="Error"
              description={formError.message}
              errors={formError.errors}
            />
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium mb-1">Marca</label>
              <Tooltip title="Marca a la que pertenece esta familia.">
                <InfoCircleOutlined className="text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <BrandSelector
              onChange={handleBrandChange}
              value={selectedBrandValue}
            />
            {!selectedBrandValue && (
              <p className="text-sm text-red-500 mt-1">Marca es requerida</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium mb-1">
                Nombre de la Familia
              </label>
              <Tooltip title="Nombre de la familia del vehículo. Este campo es obligatorio y no puede repetirse si ya existe una familia activa con el mismo nombre.">
                <InfoCircleOutlined className="text-blue-500 cursor-help" />
              </Tooltip>
            </div>
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
                  {mode === "edit"
                    ? "Actualizando Familia..."
                    : "Creando Familia..."}
                </>
              ) : mode === "edit" ? (
                "Actualizar Familia"
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
