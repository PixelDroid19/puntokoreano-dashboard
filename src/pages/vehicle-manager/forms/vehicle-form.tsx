import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form"; // Import Controller
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { NumericFormat } from "react-number-format"; // Import NumericFormat
import {
  Car,
  Tag,
  Folder,
  Layers,
  GitBranch,
  Cog,
  Droplet,
  Plus,
  Check,
  AlertCircle,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import LineSelector from "../selectors/line-selector";
import TransmissionSelector from "../selectors/transmission-selector";
import FuelSelector from "../selectors/fuel-selector";
import BrandForm from "./brand-form";
import FamilyForm from "./family-form";
import ModelForm from "./model-form";
import LineForm from "./line-form";
import TransmissionForm from "./transmission-form";
import FuelForm from "./fuel-form";
import VehicleFamiliesService from "../../../services/vehicle-families.service"; // Ensure path is correct
import FormError from "./FormError";

// Defino el tipo localmente para evitar error de importación
interface VehicleGetParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  search?: string;
  tag_id?: string;
}

interface VehicleFormData {
  line_id: string;
  transmission_id: string;
  tag_id: string;
  fuel_id: string;
  color?: string; // Optional string
  precio?: number | null; // Optional number or null
  active?: boolean;
}

export default function VehicleForm() {
  const [activeTab, setActiveTab] = useState("vehiculo");
  const [selectedLineValue, setSelectedLineValue] = useState<string | null>(
    null
  );
  const [selectedTransmissionValue, setSelectedTransmissionValue] = useState<
    string | null
  >(null);
  const [selectedFuelValue, setSelectedFuelValue] = useState<string | null>(
    null
  );
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<{ message: string; errors?: string[] } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control, // Get control from useForm for Controller
    formState: { errors },
  } = useForm<VehicleFormData>({
    defaultValues: {
      // Set default values for optional fields if needed
      color: "",
      precio: null,
      active: true,
      tag_id: "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: VehicleFormData) => {
      // Prepare data for the service, ensuring optional fields are handled
      const payload = {
        transmission_id: data.transmission_id,
        fuel_id: data.fuel_id,
        line_id: data.line_id,
        // Send undefined if color is empty string, otherwise send the color
        color: data.color?.trim() ? data.color.trim() : undefined,
        // Send the numeric price (null/undefined if not set)
        price: data.precio,
        // Default active to true if not provided
        active: data.active !== undefined ? data.active : true,
        tag_id: data.tag_id,
      };
      console.log("Submitting payload:", payload); // Log payload for debugging
      return VehicleFamiliesService.addVehicle(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAnalytics"] });
      setFormSuccess(true);
      setFormError(null);
      setTimeout(() => {
        reset();
        setSelectedLineValue(null);
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
    // Basic validation for selectors (consider adding to RHF rules for better UX)
    if (
      !selectedLineValue ||
      !selectedTransmissionValue ||
      !selectedFuelValue
    ) {
      console.error("Required selectors not filled");
      // Maybe set focus or show a general error message
      return;
    }

    // Validación: no permitir duplicados de tag_id
    try {
      if (data.tag_id && data.tag_id.trim() !== "") {
        // Buscar vehículos con ese tag_id (ignorando mayúsculas/minúsculas)
        const params: VehicleGetParams = {
          page: 1,
          limit: 1,
          sortBy: "createdAt",
          sortOrder: "desc",
          tag_id: data.tag_id.trim(),
        };
        const response = await VehicleFamiliesService.getVehicles(params);
        const vehicles = response.vehicles || [];
        // Si existe alguno, mostrar error y no enviar
        if (vehicles.length > 0) {
          setFormError({ message: "Ya existe un vehículo con ese identificador único." });
          return;
        }
      }
    } catch (err) {
      // Si falla la validación, permitimos el submit y dejamos que el backend lo rechace si corresponde
      console.error("Error validando tag_id existente:", err);
    }

    // Enviar solo el string del ID para cada campo
    const getId = (val: any) => (typeof val === 'string' ? val : val?.value);

    mutate({
      ...data,
      line_id: getId(selectedLineValue),
      transmission_id: getId(selectedTransmissionValue),
      fuel_id: getId(selectedFuelValue),
    });
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  // Handlers remain mostly the same, just ensure they clear RHF state if needed
  const handleLineChange = (value: string | null) => {
    setSelectedLineValue(value);
    setValue("line_id", value || "", { shouldValidate: true }); // Trigger validation if needed
  };

  const handleTransmissionChange = (value: string | null) => {
    setSelectedTransmissionValue(value);
    setValue("transmission_id", value || "", { shouldValidate: true });
  };

  const handleFuelChange = (value: string | null) => {
    setSelectedFuelValue(value);
    setValue("fuel_id", value || "", { shouldValidate: true });
  };

  // Limpia el error si el usuario cambia cualquier campo relevante
  useEffect(() => {
    setFormError(null);
  }, [
    errors.line_id,
    errors.transmission_id,
    errors.fuel_id,
    errors.color,
    errors.precio,
    errors.active,
    errors.tag_id
  ]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-lg shadow"
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Gestión de Vehículos</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 mb-6">
            {" "}
            {/* Adjusted grid for responsiveness */}
            {[
              { id: "vehiculo", icon: Car, label: "Vehículo" },
              { id: "marca", icon: Tag, label: "Marca" },
              { id: "familia", icon: Folder, label: "Familia" },
              { id: "modelo", icon: Layers, label: "Modelo" },
              { id: "linea", icon: GitBranch, label: "Línea" },
              { id: "transmision", icon: Cog, label: "Transmisión" },
              { id: "combustible", icon: Droplet, label: "Combustible" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center justify-center sm:justify-start gap-2 transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600" // Added active styles
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <tab.icon className="w-4 h-4" />
                </motion.div>
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
            >
              <TabsContent value="vehiculo">
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
                    {" "}
                    {/* Increased spacing */}
                    {/* --- Selectors Row --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Line Selector */}
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Línea <span className="text-red-500">*</span>
                        </label>
                        <LineSelector
                          onChange={handleLineChange}
                          value={selectedLineValue}
                        />
                        {/* You might want to add RHF validation error display here if line_id is required */}
                        {errors.line_id && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 mt-1"
                          >
                            La línea es requerida. {/* Example message */}
                          </motion.p>
                        )}
                      </div>

                      {/* Transmission Selector */}
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Transmisión <span className="text-red-500">*</span>
                        </label>
                        <TransmissionSelector
                          onChange={handleTransmissionChange}
                          value={selectedTransmissionValue}
                        />
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

                      {/* Fuel Selector */}
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Combustible <span className="text-red-500">*</span>
                        </label>
                        <FuelSelector
                          onChange={handleFuelChange}
                          value={selectedFuelValue}
                        />
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
                    {/* --- Optional Fields Row --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Color Input */}
                      <div>
                        <label
                          htmlFor="color"
                          className="block text-sm font-medium mb-1 text-gray-700"
                        >
                          Color (Opcional)
                        </label>
                        <div className="relative">
                          <Input
                            id="color"
                            placeholder="Ej: Rojo, Azul Metálico"
                            {...register("color")} // No specific validation needed for optional string
                            className={`${
                              errors.color
                                ? "border-red-300 focus:border-red-500 pr-10"
                                : "border-gray-300"
                            }`}
                          />
                          {/* Error display can remain if you add validation later */}
                          {errors.color && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 15,
                                }}
                              >
                                <AlertCircle className="h-5 w-5 text-red-500" />
                              </motion.div>
                            </div>
                          )}
                        </div>
                        {errors.color && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 mt-1"
                          >
                            {errors.color.message}
                          </motion.p>
                        )}
                      </div>

                      {/* Price Input using NumericFormat */}
                      <div>
                        <label
                          htmlFor="precio"
                          className="block text-sm font-medium mb-1 text-gray-700"
                        >
                          Precio (Opcional)
                        </label>
                        <div className="relative">
                          {/* Use Controller to integrate NumericFormat with RHF */}
                          <Controller
                            name="precio"
                            control={control}
                            rules={{
                              min: {
                                value: 0,
                                message: "El precio no puede ser negativo",
                              },
                              // Add other validation if needed
                            }}
                            render={({
                              field: { onChange, onBlur, value, name },
                              fieldState: { error },
                            }) => (
                              <NumericFormat
                                id="precio"
                                name={name}
                                customInput={Input} // Use your Shadcn Input component
                                value={
                                  value === null || value === undefined
                                    ? ""
                                    : value
                                } // Handle null/undefined for empty display
                                onValueChange={(values) => {
                                  // Pass the numeric float value, or null if empty/invalid
                                  onChange(
                                    values.floatValue === undefined
                                      ? null
                                      : values.floatValue
                                  );
                                }}
                                onBlur={onBlur} // Pass RHF's onBlur
                                thousandSeparator="," // Use comma for thousands
                                decimalSeparator="." // Use dot for decimals (adjust if needed)
                                prefix="$ " // Add currency prefix
                                allowNegative={false}
                                decimalScale={0} // No decimals for price (adjust if needed)
                                placeholder="Ej: $ 25,000,000"
                                className={`${
                                  error
                                    ? "border-red-300 focus:border-red-500 pr-10"
                                    : "border-gray-300"
                                } w-full`} // Apply error styles and ensure full width
                              />
                            )}
                          />
                          {errors.precio && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 15,
                                }}
                              >
                                <AlertCircle className="h-5 w-5 text-red-500" />
                              </motion.div>
                            </div>
                          )}
                        </div>
                        {errors.precio && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 mt-1"
                          >
                            {errors.precio.message}
                          </motion.p>
                        )}
                      </div>

                                {/* Tag ID Input */}
                    <div>
                      <label
                        htmlFor="tag_id"
                        className="block text-sm font-medium mb-1 text-gray-700"
                      >
                        Identificador Único{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="tag_id"
                          placeholder="Ingrese el identificador único del vehículo"
                          {...register("tag_id", {
                            required: "El identificador único es requerido",
                            pattern: {
                              value: /^[\p{L}0-9_-]+$/u,
                              message:
                                "Solo se permiten letras, números, guiones y guiones bajos",
                            },
                          })}
                          className={`${
                            errors.tag_id
                              ? "border-red-300 focus:border-red-500 pr-10"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.tag_id && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 15,
                              }}
                            >
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            </motion.div>
                          </div>
                        )}
                      </div>
                      {errors.tag_id && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-1"
                        >
                          {errors.tag_id.message}
                        </motion.p>
                      )}
                    </div>
                    </div>
                    {/* --- Active Status --- */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Estado
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="active"
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          {...register("active")}
                       
                        />
                        <label
                          htmlFor="active"
                          className="text-sm font-medium text-gray-700"
                        >
                          Activo
                        </label>
                      </div>
                    </div>
                    {formError && (
                      <FormError title="Error" description={formError.message} errors={formError.errors} />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="pt-4"
                    >
                      <Button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-md flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
                        disabled={
                          isSubmitting ||
                          !selectedLineValue ||
                          !selectedTransmissionValue ||
                          !selectedFuelValue
                        }
                        isLoading={isSubmitting}
                        icon={<Plus className="w-5 h-5" />}
                      >
                        {isSubmitting
                          ? " Creando Vehículo..."
                          : " Crear Vehículo"}
                      </Button>
                    </motion.div>
                  </form>
                )}
              </TabsContent>

              {/* Other Tab Contents remain the same */}
              <TabsContent value="marca">
                <BrandForm />
              </TabsContent>
              <TabsContent value="familia">
                <FamilyForm />
              </TabsContent>
              <TabsContent value="modelo">
                <ModelForm />
              </TabsContent>
              <TabsContent value="linea">
                <LineForm />
              </TabsContent>
              <TabsContent value="transmision">
                <TransmissionForm />
              </TabsContent>
              <TabsContent value="combustible">
                <FuelForm />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </motion.div>
  );
}
