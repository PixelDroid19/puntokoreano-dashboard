import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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
import BrandSelector from "../selectors/brand-selector";
import FamilySelector from "../selectors/family-selector";
import ModelSelector from "../selectors/model-selector";
import LineSelector from "../selectors/line-selector";
import TransmissionSelector from "../selectors/transmission-selector";
import FuelSelector from "../selectors/fuel-selector";
import BrandForm from "./brand-form";
import FamilyForm from "./family-form";
import ModelForm from "./model-form";
import LineForm from "./line-form";
import TransmissionForm from "./transmission-form";
import FuelForm from "./fuel-form";
import VehicleFamiliesService from "../../../services/vehicle-families.service";

interface VehicleFormData {
  line_id: string;
  transmission_id: string;
  fuel_id: string;
  color?: string;
  precio?: number;
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
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormData>();

  const queryClient = useQueryClient();

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (data: VehicleFormData) =>
      VehicleFamiliesService.addVehicle({
        transmission_id: data.transmission_id,
        fuel_id: data.fuel_id,
        line_id: data.line_id,
        color: data.color,
        price: data.precio,
        active: data.active
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setFormSuccess(true);

      // Añadir actividad
      /*      addActivity({
        type: "model",
        title: "Nuevo modelo añadido",
        description: data.data.name,
        timestamp: new Date(),
      });
 */
      setTimeout(() => {
        reset();
        setFormSuccess(false);
      }, 1500);
    },
    onError: (error: Error) => {
      console.error(error);
    },
  });

  const onSubmit = (data: VehicleFormData) => {
    if (!selectedLineValue || !selectedTransmissionValue || !selectedFuelValue) {
      return;
    }

    mutate({
      ...data,
      line_id: selectedLineValue,
      transmission_id: selectedTransmissionValue,
      fuel_id: selectedFuelValue,
      active: data.active !== undefined ? data.active : true,
    });
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };



  const handleLineChange = (value: string | null) => {
    setSelectedLineValue(value);
    setValue("line_id", value || "");
  };

  const handleTransmissionChange = (value: string | null) => {
    setSelectedTransmissionValue(value);
    setValue("transmission_id", value || "");
  };

  const handleFuelChange = (value: string | null) => {
    setSelectedFuelValue(value);
    setValue("fuel_id", value || "");
  };

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
          <TabsList className="grid grid-cols-7 mb-6">
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
                className="flex items-center gap-2 transition-all duration-200 hover:bg-gray-100"
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
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Línea
                        </label>
                        <LineSelector
                          onChange={handleLineChange}
                          value={selectedLineValue}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Transmisión
                        </label>
                        <TransmissionSelector
                          onChange={handleTransmissionChange}
                          value={selectedTransmissionValue}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Combustible
                        </label>
                        <FuelSelector
                          onChange={handleFuelChange}
                          value={selectedFuelValue}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Color (Opcional)
                        </label>
                        <div className="relative">
                          <Input
                            placeholder="Color del vehículo"
                            {...register("color")}
                            className={`${errors.color ? "border-red-300 focus:border-red-500 pr-10" : ""}`}
                          />
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Precio (Opcional)
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="Precio del vehículo"
                            {...register("precio", {
                              valueAsNumber: true,
                              min: {
                                value: 0,
                                message: "El precio debe ser positivo",
                              },
                            })}
                            className={`${
                              errors.precio
                                ? "border-red-300 focus:border-red-500 pr-10"
                                : ""
                            }`}
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
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Estado
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="active"
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            {...register("active")}
                            defaultChecked={true}
                          />
                          <label htmlFor="active" className="text-sm text-gray-700">
                            Activo
                          </label>
                        </div>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-md flex items-center justify-center gap-2 transition-all duration-300"
                        disabled={isSubmitting}
                        icon={<Plus className="w-4 h-4" />}
                        isLoading={isSubmitting}
                      >
                        {isSubmitting
                          ? "Creando Vehículo..."
                          : "Crear Vehículo"}
                      </Button>
                    </motion.div>
                  </form>
                )}
              </TabsContent>

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
