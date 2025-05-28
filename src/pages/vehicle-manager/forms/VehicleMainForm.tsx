import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { NumericFormat } from "react-number-format";
import { Check, AlertCircle, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import ModelSelector from "../selectors/model-selector";
import TransmissionSelector from "../selectors/transmission-selector";
import FuelSelector from "../selectors/fuel-selector";
import VehicleFamiliesService from "../../../services/vehicle-families.service";
import FormError from "./FormError";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { ModelsOption, TransmissionsOption, FuelsOption } from "../../../types/selectors.types";

interface VehicleFormData {
  model_id: string;
  transmission_id: string;
  tag_id: string;
  fuel_id: string;
  color?: string;
  precio?: number | null;
  active?: boolean;
}

export default function VehicleMainForm() {
  const [selectedModelValue, setSelectedModelValue] = useState<ModelsOption | null>(null);
  const [selectedTransmissionValue, setSelectedTransmissionValue] = useState<TransmissionsOption | null>(null);
  const [selectedFuelValue, setSelectedFuelValue] = useState<FuelsOption | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<{ message: string; errors?: string[] } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<VehicleFormData>({
    defaultValues: {
      color: "",
      precio: null,
      active: true,
      tag_id: "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: VehicleFormData) => {
      const payload = {
        transmission_id: data.transmission_id,
        fuel_id: data.fuel_id,
        model_id: data.model_id,
        color: data.color?.trim() ? data.color.trim() : undefined,
        price: data.precio,
        active: data.active !== undefined ? data.active : true,
        tag_id: data.tag_id,
      };
      return VehicleFamiliesService.addVehicle(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAnalytics"] });
      setFormSuccess(true);
      setFormError(null);
      setTimeout(() => {
        reset();
        setSelectedModelValue(null);
        setSelectedTransmissionValue(null);
        setSelectedFuelValue(null);
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

  const onSubmit = async (data: VehicleFormData) => {
    if (!selectedModelValue || !selectedTransmissionValue || !selectedFuelValue) {
      return;
    }
    try {
      if (data.tag_id && data.tag_id.trim() !== "") {
        const params = {
          page: 1,
          limit: 1,
          sortBy: "createdAt",
          sortOrder: "desc",
          tag_id: data.tag_id.trim(),
        };
        const response = await VehicleFamiliesService.getVehicles(params);
        const vehicles = response.vehicles || [];
        if (vehicles.length > 0) {
          setFormError({ message: "Ya existe un vehículo con ese identificador único." });
          return;
        }
      }
    } catch (err) {
      // Permitir submit si la validación falla
    }
    const getId = (val: any) => (typeof val === 'string' ? val : val?.value);
    mutate({
      ...data,
      model_id: getId(selectedModelValue),
      transmission_id: getId(selectedTransmissionValue),
      fuel_id: getId(selectedFuelValue),
    });
  };

  // Handlers para los selectores
  const handleModelChange = (selectedOption: ModelsOption | null) => {
    setSelectedModelValue(selectedOption);
    setValue("model_id", selectedOption?.value || "", { shouldValidate: true });
  };
  
  const handleTransmissionChange = (selectedOption: TransmissionsOption | null) => {
    setSelectedTransmissionValue(selectedOption);
    setValue("transmission_id", selectedOption?.value || "", { shouldValidate: true });
  };
  
  const handleFuelChange = (selectedOption: FuelsOption | null) => {
    setSelectedFuelValue(selectedOption);
    setValue("fuel_id", selectedOption?.value || "", { shouldValidate: true });
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
            ¡Vehículo creado con éxito!
          </h3>
          <p className="text-gray-500">
            El vehículo ha sido registrado correctamente
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Modelo <span className="text-red-500">*</span>
                </label>
                <Tooltip title="Selecciona el modelo del vehículo. Este campo es obligatorio y determina el tipo específico del vehículo.">
                  <InfoCircleOutlined className="text-blue-500 cursor-help" />
                </Tooltip>
              </div>
              <ModelSelector onChange={handleModelChange} value={selectedModelValue} />
              {errors.model_id && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 mt-1"
                >
                  El modelo es requerido.
                </motion.p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Transmisión <span className="text-red-500">*</span>
                </label>
                <Tooltip title="Selecciona el tipo de transmisión del vehículo. Este campo es obligatorio.">
                  <InfoCircleOutlined className="text-blue-500 cursor-help" />
                </Tooltip>
              </div>
              <TransmissionSelector onChange={handleTransmissionChange} value={selectedTransmissionValue} />
              {errors.transmission_id && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 mt-1"
                >
                  La transmisión es requerida.
                </motion.p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Combustible <span className="text-red-500">*</span>
                </label>
                <Tooltip title="Selecciona el tipo de combustible que utiliza el vehículo. Este campo es obligatorio.">
                  <InfoCircleOutlined className="text-blue-500 cursor-help" />
                </Tooltip>
              </div>
              <FuelSelector onChange={handleFuelChange} value={selectedFuelValue} />
              {errors.fuel_id && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 mt-1"
                >
                  El combustible es requerido.
                </motion.p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        
            <div>
              <div className="flex items-center gap-2">
                <label htmlFor="tag_id" className="block text-sm font-medium mb-1 text-gray-700">
                  Identificador Único <span className="text-red-500">*</span>
                </label>
                <Tooltip title="Ingresa un identificador único para el vehículo. Solo se permiten letras, números, guiones y guiones bajos. Este campo es obligatorio y no puede repetirse.">
                  <InfoCircleOutlined className="text-blue-500 cursor-help" />
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  id="tag_id"
                  placeholder="Ingrese el identificador único del vehículo"
                  {...register("tag_id", {
                    required: "El identificador único es requerido",
                    pattern: {
                      value: /^[\p{L}0-9_-]+$/u,
                      message: "Solo se permiten letras, números, guiones y guiones bajos",
                    },
                  })}
                  className={`${errors.tag_id ? "border-red-300 focus:border-red-500 pr-10" : "border-gray-300"}`}
                />
                {errors.tag_id && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </motion.div>
                  </div>
                )}
              </div>
              {errors.tag_id && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-500 mt-1">
                  {errors.tag_id.message}
                </motion.p>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Estado
              </label>
              <Tooltip title="Indica si el vehículo está activo o inactivo en el sistema.">
                <InfoCircleOutlined className="text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                {...register("active")}
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Activo
              </label>
            </div>
          </div>
          {formError && (
            <FormError title="Error" description={formError.message} errors={formError.errors} />
          )}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-4">
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-md flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
              disabled={
                isSubmitting ||
                !selectedModelValue ||
                !selectedTransmissionValue ||
                !selectedFuelValue
              }
              isLoading={isSubmitting}
              icon={<Plus className="w-5 h-5" />}
            >
              {isSubmitting ? " Creando Vehículo..." : " Crear Vehículo"}
            </Button>
          </motion.div>
        </form>
      )}
    </>
  );
}