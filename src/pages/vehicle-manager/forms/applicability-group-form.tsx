import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, AlertCircle, Plus, Minus } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Tooltip,
  Select as AntSelect,
  Switch,
  Tag,
  Tabs,
  Input as AntInput,
  Alert,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import VehicleApplicabilityGroupsService from "../../../services/vehicle-applicability-groups.service";
import type { VehicleApplicabilityGroup } from "../../../services/vehicle-applicability-groups.service";
import FormError from "./FormError";
import FormSuccess from "../ui/FormSuccess";

// Importar componentes nuevos
import CompatibleVehiclesViewer from "../components/compatible-vehicles-viewer";
import CriteriaHelper from "../components/criteria-helper";

// Importar selectores personalizados
import BrandSelector from "../selectors/brand-selector";
import FamilySelector from "../selectors/family-selector";
import ModelSelector from "../selectors/model-selector";
import LineSelector from "../selectors/line-selector";
import TransmissionSelector from "../selectors/transmission-selector";
import FuelSelector from "../selectors/fuel-selector";
import VehicleSelector from "../selectors/vehicle-selector";

// Importar tipos de los selectores
import { 
  BrandOption, 
  FamilieOption, 
  ModelsOption, 
  LinesOption,
  TransmissionsOption,
  FuelsOption,
  VehiclesOption,
} from "../../../types/selectors.types";

// Importar estilos CSS personalizados
import "./applicability-form.css";

const { Option } = AntSelect;
const { TabPane } = Tabs;
const { TextArea } = AntInput;

interface ApplicabilityGroupFormData {
  name: string;
  description?: string;
  category: "general" | "repuestos" | "accesorios" | "servicio" | "blog";
  tags: string[];
  active: boolean;
  criteria: {
    brands?: string[];
    families?: string[];
    models?: string[];
    lines?: string[];
    transmissions?: string[];
    fuels?: string[];
    minYear?: number;
    maxYear?: number;
    specificYears?: number[];
  };
  includedVehicles?: string[];
  excludedVehicles?: string[];
}

interface ApplicabilityGroupFormProps {
  initialData?: VehicleApplicabilityGroup | null;
  onCancel: () => void;
  onSuccess: () => void;
  mode?: "create" | "edit";
}

export default function ApplicabilityGroupForm({
  initialData,
  onCancel,
  onSuccess,
  mode = "create",
}: ApplicabilityGroupFormProps) {
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<{
    message: string;
    errors?: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState("1");
  const [showVehiclesViewer, setShowVehiclesViewer] = useState(false);
  
  // Estados para los selectores
  const [selectedBrands, setSelectedBrands] = useState<BrandOption[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<FamilieOption[]>([]);
  const [selectedModels, setSelectedModels] = useState<ModelsOption[]>([]);
  const [selectedLines, setSelectedLines] = useState<LinesOption[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<
    TransmissionsOption[]
  >([]);
  const [selectedFuels, setSelectedFuels] = useState<FuelsOption[]>([]);
  const [selectedIncludedVehicles, setSelectedIncludedVehicles] = useState<
    VehiclesOption[]
  >([]);
  const [selectedExcludedVehicles, setSelectedExcludedVehicles] = useState<
    VehiclesOption[]
  >([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
    watch,
  } = useForm<ApplicabilityGroupFormData>({
    defaultValues: {
      name: "",
      description: "",
      category: "general",
      tags: [],
      active: true,
      criteria: {
        brands: [],
        families: [],
        models: [],
        lines: [],
        transmissions: [],
        fuels: [],
        specificYears: [],
      },
      includedVehicles: [],
      excludedVehicles: [],
    },
  });

  const queryClient = useQueryClient();

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData && mode === "edit") {
      setValue("name", initialData.name || "");
      setValue("description", initialData.description || "");
      setValue("category", initialData.category || "general");
      setValue("tags", initialData.tags || []);
      setValue(
        "active",
        initialData.active !== undefined ? initialData.active : true
      );
      
      // Cargar criterios
      if (initialData.criteria) {
        setValue("criteria.minYear", initialData.criteria.minYear);
        setValue("criteria.maxYear", initialData.criteria.maxYear);
        setValue(
          "criteria.specificYears",
          initialData.criteria.specificYears || []
        );
      }
      
      setValue("includedVehicles", initialData.includedVehicles || []);
      setValue("excludedVehicles", initialData.excludedVehicles || []);
    }
  }, [initialData, mode, setValue]);

  // Mutación para crear/actualizar
  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (values: ApplicabilityGroupFormData) => {
      // Preparar los datos
      const formData = {
        ...values,
        criteria: {
          ...values.criteria,
          brands: selectedBrands.map((brand) => brand.value),
          families: selectedFamilies.map((family) => family.value),
          models: selectedModels.map((model) => model.value),
          lines: selectedLines.map((line) => line.value),
          transmissions: selectedTransmissions.map(
            (transmission) => transmission.value
          ),
          fuels: selectedFuels.map((fuel) => fuel.value),
        },
        includedVehicles: selectedIncludedVehicles.map(
          (vehicle) => vehicle.value
        ),
        excludedVehicles: selectedExcludedVehicles.map(
          (vehicle) => vehicle.value
        ),
      };

      if (mode === "edit" && initialData) {
        return VehicleApplicabilityGroupsService.updateGroup(
          initialData._id,
          formData
        );
      } else {
        return VehicleApplicabilityGroupsService.createGroup(formData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicleApplicabilityGroups"],
      });
      setFormSuccess(true);
      setFormError(null);
      setTimeout(() => {
        if (mode === "create") {
          reset();
          setSelectedBrands([]);
          setSelectedFamilies([]);
          setSelectedModels([]);
          setSelectedLines([]);
          setSelectedTransmissions([]);
          setSelectedFuels([]);
          setSelectedIncludedVehicles([]);
          setSelectedExcludedVehicles([]);
        }
        setFormSuccess(false);
        onSuccess();
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

  const onSubmit = (data: ApplicabilityGroupFormData) => {
    setFormError(null);
    mutate(data);
  };

  // Handlers para selectores múltiples
  const handleBrandAdd = (brand: BrandOption | null) => {
    if (brand && !selectedBrands.find((b) => b.value === brand.value)) {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleFamilyAdd = (family: FamilieOption | null) => {
    if (family && !selectedFamilies.find((f) => f.value === family.value)) {
      setSelectedFamilies([...selectedFamilies, family]);
    }
  };

  const handleModelAdd = (model: ModelsOption | null) => {
    if (model && !selectedModels.find((m) => m.value === model.value)) {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const handleLineAdd = (line: LinesOption | null) => {
    if (line && !selectedLines.find((l) => l.value === line.value)) {
      setSelectedLines([...selectedLines, line]);
    }
  };

  const handleTransmissionAdd = (transmission: TransmissionsOption | null) => {
    if (
      transmission &&
      !selectedTransmissions.find((t) => t.value === transmission.value)
    ) {
      setSelectedTransmissions([...selectedTransmissions, transmission]);
    }
  };

  const handleFuelAdd = (fuel: FuelsOption | null) => {
    if (fuel && !selectedFuels.find((f) => f.value === fuel.value)) {
      setSelectedFuels([...selectedFuels, fuel]);
    }
  };

  const handleIncludedVehicleAdd = (vehicle: VehiclesOption | null) => {
    if (
      vehicle &&
      !selectedIncludedVehicles.find((v) => v.value === vehicle.value)
    ) {
      setSelectedIncludedVehicles([...selectedIncludedVehicles, vehicle]);
    }
  };

  const handleExcludedVehicleAdd = (vehicle: VehiclesOption | null) => {
    if (
      vehicle &&
      !selectedExcludedVehicles.find((v) => v.value === vehicle.value)
    ) {
      setSelectedExcludedVehicles([...selectedExcludedVehicles, vehicle]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm"
    >
      {formSuccess ? (
        <FormSuccess
          title={
            mode === "edit"
              ? "¡Grupo actualizado con éxito!"
              : "¡Grupo creado con éxito!"
          }
          description={
            mode === "edit"
              ? "El grupo de aplicabilidad ha sido actualizado correctamente"
              : "El grupo de aplicabilidad ha sido creado correctamente"
          }
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {formError && (
            <FormError
              title="Error"
              description={formError.message}
              errors={formError.errors}
            />
          )}

          {/* Encabezado del formulario */}
          <div className="border-b border-gray-200 pb-4">
            <p className="mt-1 text-sm text-gray-500">
              Define criterios para determinar qué vehículos son compatibles con
              este grupo.
            </p>
          </div>

          {/* Indicador de progreso */}
          <div className="pt-2 pb-4">
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <span>Progreso:</span>
              <div className="flex-1 bg-gray-200 h-1 rounded-full overflow-hidden">
                <motion.div
                  className="bg-blue-500 h-full"
                  initial={{ width: "10%" }}
                  animate={{
                    width:
                      activeTab === "1"
                        ? "25%"
                        : activeTab === "2"
                        ? "50%"
                        : activeTab === "3"
                        ? "75%"
                        : "100%",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="font-medium">
                {activeTab === "1"
                  ? "Paso 1/4"
                  : activeTab === "2"
                  ? "Paso 2/4"
                  : activeTab === "3"
                  ? "Paso 3/4"
                  : "Paso 4/4"}
              </span>
            </div>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            className="custom-tabs"
            animated={true}
            tabBarExtraContent={
              <div className="text-xs text-gray-500 flex items-center">
                <span className="mr-2">Campos obligatorios marcados con</span>
                <span className="text-red-500">*</span>
              </div>
            }
          >
            <TabPane
              tab={
                <span className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      activeTab === "1"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    1
                  </div>
                  <span>Información Básica</span>
                </span>
              }
              key="1"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                <div className="space-y-4 md:col-span-2">
                <div>
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium mb-1">
                      Nombre del Grupo <span className="text-red-500">*</span>
                    </label>
                    <Tooltip title="Nombre identificador del grupo de aplicabilidad. Debe ser único.">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <Input
                    placeholder="Ej: Vehículos Eléctricos 2020+"
                      className="rounded-md"
                      {...register("name", {
                        required: "El nombre es requerido",
                      })}
                  />
                  {errors.name && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.name.message}
                      </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium mb-1">
                        Descripción
                      </label>
                    <Tooltip title="Descripción opcional del propósito de este grupo">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <TextArea
                    rows={3}
                    placeholder="Descripción del propósito de este grupo"
                      className="rounded-md"
                    {...register("description")}
                  />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium mb-1">
                      Categoría
                    </label>
                    <Tooltip title="Categoría del grupo para organización">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <AntSelect
                        {...field}
                        placeholder="Seleccione una categoría"
                        className="w-full rounded-md"
                      >
                        <Option value="general">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                            <span>General</span>
                          </div>
                        </Option>
                        <Option value="repuestos">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span>Repuestos</span>
                          </div>
                        </Option>
                        <Option value="accesorios">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span>Accesorios</span>
                          </div>
                        </Option>
                        <Option value="servicio">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                            <span>Servicio</span>
                          </div>
                        </Option>
                        <Option value="blog">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                            <span>Blog</span>
                          </div>
                        </Option>
                      </AntSelect>
                    )}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium mb-1">
                      Estado
                    </label>
                    <Tooltip title="Estado del grupo (activo/inactivo)">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <Controller
                    name="active"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-3">
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        checkedChildren="Activo"
                        unCheckedChildren="Inactivo"
                      />
                        <span
                          className={`text-sm ${
                            field.value ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {field.value ? "Grupo activo" : "Grupo inactivo"}
                        </span>
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8 p-4 border-t">
                <div></div>
                <Button
                  type="button"
                  onClick={() => setActiveTab("2")}
                  className="bg-blue-600 hover:bg-blue-700 text-white btn-primary"
                >
                  Siguiente: Criterios <span className="ml-2">→</span>
                </Button>
              </div>
            </TabPane>

            <TabPane
              tab={
                <span className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      activeTab === "2"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    2
                  </div>
                  <span>Criterios de Compatibilidad</span>
                </span>
              }
              key="2"
            >
              <div className="p-4 space-y-8">
                {/* Tarjeta resumen de criterios */}
                <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <InfoCircleOutlined className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-800 mb-1">
                        ¿Cómo funcionan los criterios?
                      </h3>
                      <p className="text-xs text-blue-700">
                        Los criterios definen qué vehículos serán compatibles
                        con este grupo. Puedes combinar múltiples criterios:
                      </p>
                      <ul className="text-xs text-blue-700 mt-2 list-disc list-inside">
                        <li>Jerarquía: Marca → Familia → Modelo → Línea</li>
                        <li>Técnicos: Transmisión, Combustible</li>
                        <li>Temporales: Años específicos o rangos de años</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                      Criterios Jerárquicos
                    </h3>

                {/* Marcas */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium">
                          Marcas
                        </label>
                    <Tooltip title="Selecciona las marcas compatibles con este grupo">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                          <BrandSelector
                            onChange={handleBrandAdd}
                            value={null}
                            placeholder="Añadir marca"
                            className="rounded-md custom-selector"
                          />
                    </div>
                        <Button
                          type="button"
                          onClick={() =>
                            selectedBrands.length > 0 && setSelectedBrands([])
                          }
                          disabled={selectedBrands.length === 0}
                          className="border-red-200 text-red-500 hover:bg-red-50 btn-danger"
                        >
                          Limpiar
                        </Button>
                  </div>
                      <div className="tag-container">
                        {selectedBrands.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">
                            Sin marcas seleccionadas
                          </span>
                        ) : (
                          selectedBrands.map((brand) => (
                      <Tag
                        key={brand.value}
                        closable
                              onClose={() =>
                                setSelectedBrands(
                                  selectedBrands.filter(
                                    (b) => b.value !== brand.value
                                  )
                                )
                              }
                              className="custom-tag"
                      >
                        {brand.label}
                      </Tag>
                          ))
                        )}
                  </div>
                </div>

                {/* Familias */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium">
                          Familias
                        </label>
                    <Tooltip title="Selecciona las familias compatibles con este grupo">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                          <FamilySelector
                            onChange={handleFamilyAdd}
                            value={null}
                            placeholder="Añadir familia"
                            className="rounded-md custom-selector"
                          />
                    </div>
                        <Button
                          type="button"
                          onClick={() =>
                            selectedFamilies.length > 0 &&
                            setSelectedFamilies([])
                          }
                          disabled={selectedFamilies.length === 0}
                          className="border-red-200 text-red-500 hover:bg-red-50 btn-danger"
                        >
                          Limpiar
                        </Button>
                  </div>
                      <div className="tag-container">
                        {selectedFamilies.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">
                            Sin familias seleccionadas
                          </span>
                        ) : (
                          selectedFamilies.map((family) => (
                      <Tag
                        key={family.value}
                        closable
                              onClose={() =>
                                setSelectedFamilies(
                                  selectedFamilies.filter(
                                    (f) => f.value !== family.value
                                  )
                                )
                              }
                              className="custom-tag"
                      >
                        {family.label}
                      </Tag>
                          ))
                        )}
                  </div>
                </div>

                {/* Modelos */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium">
                          Modelos
                        </label>
                    <Tooltip title="Selecciona los modelos compatibles con este grupo">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                          <ModelSelector
                            onChange={handleModelAdd}
                            value={null}
                            placeholder="Añadir modelo"
                            className="rounded-md custom-selector"
                          />
                    </div>
                        <Button
                          type="button"
                          onClick={() =>
                            selectedModels.length > 0 && setSelectedModels([])
                          }
                          disabled={selectedModels.length === 0}
                          className="border-red-200 text-red-500 hover:bg-red-50 btn-danger"
                        >
                          Limpiar
                        </Button>
                  </div>
                      <div className="tag-container">
                        {selectedModels.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">
                            Sin modelos seleccionados
                          </span>
                        ) : (
                          selectedModels.map((model) => (
                      <Tag
                        key={model.value}
                        closable
                              onClose={() =>
                                setSelectedModels(
                                  selectedModels.filter(
                                    (m) => m.value !== model.value
                                  )
                                )
                              }
                              className="custom-tag"
                      >
                        {model.label}
                      </Tag>
                          ))
                        )}
                  </div>
                </div>

                {/* Líneas */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium">
                          Líneas
                        </label>
                    <Tooltip title="Selecciona las líneas compatibles con este grupo">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                          <LineSelector
                            onChange={handleLineAdd}
                            value={null}
                            placeholder="Añadir línea"
                            className="rounded-md custom-selector"
                          />
                    </div>
                        <Button
                          type="button"
                          onClick={() =>
                            selectedLines.length > 0 && setSelectedLines([])
                          }
                          disabled={selectedLines.length === 0}
                          className="border-red-200 text-red-500 hover:bg-red-50 btn-danger"
                        >
                          Limpiar
                        </Button>
                  </div>
                      <div className="tag-container">
                        {selectedLines.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">
                            Sin líneas seleccionadas
                          </span>
                        ) : (
                          selectedLines.map((line) => (
                      <Tag
                        key={line.value}
                        closable
                              onClose={() =>
                                setSelectedLines(
                                  selectedLines.filter(
                                    (l) => l.value !== line.value
                                  )
                                )
                              }
                              className="custom-tag"
                      >
                        {line.label}
                      </Tag>
                          ))
                        )}
                      </div>
                  </div>
                </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                      Criterios Técnicos
                    </h3>

                {/* Transmisiones */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium">
                          Transmisiones
                        </label>
                    <Tooltip title="Selecciona las transmisiones compatibles con este grupo">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                          <TransmissionSelector
                            onChange={handleTransmissionAdd}
                            value={null}
                            placeholder="Añadir transmisión"
                            className="rounded-md custom-selector"
                          />
                    </div>
                        <Button
                          type="button"
                          onClick={() =>
                            selectedTransmissions.length > 0 &&
                            setSelectedTransmissions([])
                          }
                          disabled={selectedTransmissions.length === 0}
                          className="border-red-200 text-red-500 hover:bg-red-50 btn-danger"
                        >
                          Limpiar
                        </Button>
                  </div>
                      <div className="tag-container">
                        {selectedTransmissions.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">
                            Sin transmisiones seleccionadas
                          </span>
                        ) : (
                          selectedTransmissions.map((transmission) => (
                      <Tag
                        key={transmission.value}
                        closable
                              onClose={() =>
                                setSelectedTransmissions(
                                  selectedTransmissions.filter(
                                    (t) => t.value !== transmission.value
                                  )
                                )
                              }
                              className="custom-tag"
                      >
                        {transmission.label}
                      </Tag>
                          ))
                        )}
                  </div>
                </div>

                {/* Combustibles */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium">
                          Combustibles
                        </label>
                    <Tooltip title="Selecciona los combustibles compatibles con este grupo">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                          <FuelSelector
                            onChange={handleFuelAdd}
                            value={null}
                            placeholder="Añadir combustible"
                            className="rounded-md custom-selector"
                          />
                    </div>
                        <Button
                          type="button"
                          onClick={() =>
                            selectedFuels.length > 0 && setSelectedFuels([])
                          }
                          disabled={selectedFuels.length === 0}
                          className="border-red-200 text-red-500 hover:bg-red-50 btn-danger"
                        >
                          Limpiar
                        </Button>
                  </div>
                      <div className="tag-container">
                        {selectedFuels.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">
                            Sin combustibles seleccionados
                          </span>
                        ) : (
                          selectedFuels.map((fuel) => (
                      <Tag
                        key={fuel.value}
                        closable
                              onClose={() =>
                                setSelectedFuels(
                                  selectedFuels.filter(
                                    (f) => f.value !== fuel.value
                                  )
                                )
                              }
                              className="custom-tag"
                      >
                        {fuel.label}
                      </Tag>
                          ))
                        )}
                  </div>
                </div>

                    <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 mt-8">
                      Criterios de Año
                    </h3>

                    {/* Opción de Criterios de Año */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                            <label className="block text-sm font-medium mb-1">
                              Año Mínimo
                            </label>
                            <Tooltip title="Año mínimo de fabricación. No se puede usar junto con años específicos.">
                        <InfoCircleOutlined className="text-blue-500 cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      placeholder="Ej: 2010"
                            className="rounded-md"
                            disabled={
                              watch("criteria.specificYears")?.length > 0
                            }
                            {...register("criteria.minYear", {
                              valueAsNumber: true,
                              onChange: (e) => {
                                // Si se establece un año mínimo, limpiar años específicos
                                if (
                                  e.target.value &&
                                  watch("criteria.specificYears")?.length > 0
                                ) {
                                  setValue("criteria.specificYears", []);
                                }
                              },
                            })}
                          />
                          {watch("criteria.specificYears")?.length > 0 && (
                            <div className="text-xs text-orange-600 mt-1">
                              Deshabilitado: se están usando años específicos
                            </div>
                          )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                            <label className="block text-sm font-medium mb-1">
                              Año Máximo
                            </label>
                            <Tooltip title="Año máximo de fabricación. No se puede usar junto con años específicos.">
                        <InfoCircleOutlined className="text-blue-500 cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      placeholder="Ej: 2023"
                            className="rounded-md"
                            disabled={
                              watch("criteria.specificYears")?.length > 0
                            }
                            {...register("criteria.maxYear", {
                              valueAsNumber: true,
                              onChange: (e) => {
                                // Si se establece un año máximo, limpiar años específicos
                                if (
                                  e.target.value &&
                                  watch("criteria.specificYears")?.length > 0
                                ) {
                                  setValue("criteria.specificYears", []);
                                }
                              },
                            })}
                          />
                          {watch("criteria.specificYears")?.length > 0 && (
                            <div className="text-xs text-orange-600 mt-1">
                              Deshabilitado: se están usando años específicos
                  </div>
                          )}
                </div>
              </div>

                      {/* Separador visual */}
                      <div className="flex items-center gap-4 my-4">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="text-sm font-medium text-gray-500 bg-gray-50 px-2">
                          O
                        </span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>

                      {/* Años específicos */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                          <label className="block text-sm font-medium">
                            Años Específicos
                          </label>
                          <Tooltip title="Selecciona años específicos en lugar de un rango. No se puede usar junto con año mínimo/máximo.">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                        <div className="space-y-3">
                          <Controller
                            name="criteria.specificYears"
                            control={control}
                            render={({ field }) => {
                              const currentYear = new Date().getFullYear();
                              const minYear = 1990;
                              const maxYear = currentYear + 2;
                              const hasYearRange =
                                Boolean(watch("criteria.minYear")) ||
                                Boolean(watch("criteria.maxYear"));

                              // Generar opciones de años
                              const yearOptions = [];
                              for (
                                let year = maxYear;
                                year >= minYear;
                                year--
                              ) {
                                yearOptions.push({
                                  label: year.toString(),
                                  value: year,
                                });
                              }

                              return (
                                <div>
                                  <AntSelect
                                    mode="multiple"
                                    placeholder={
                                      hasYearRange
                                        ? "Deshabilitado: se está usando rango de años"
                                        : "Selecciona años específicos (opcional)"
                                    }
                                    value={field.value || []}
                                    onChange={(values) => {
                                      // Ordenar años de menor a mayor
                                      const sortedValues = values.sort(
                                        (a, b) => a - b
                                      );
                                      field.onChange(sortedValues);

                                      // Si se seleccionan años específicos, limpiar rangos
                                      if (values.length > 0) {
                                        setValue("criteria.minYear", undefined);
                                        setValue("criteria.maxYear", undefined);
                                      }
                                    }}
                                    className="w-full rounded-md"
                                    showSearch
                                    filterOption={(input, option) =>
                                      option?.label?.toString().includes(input)
                                    }
                                    maxTagCount="responsive"
                                    options={yearOptions}
                                    disabled={hasYearRange}
                                  />
                                  {hasYearRange && (
                                    <div className="text-xs text-orange-600 mt-1">
                                      Deshabilitado: se está usando rango de
                                      años (mínimo:{" "}
                                      {watch("criteria.minYear") ||
                                        "no definido"}
                                      , máximo:{" "}
                                      {watch("criteria.maxYear") ||
                                        "no definido"}
                                      )
                                    </div>
                                  )}
                                </div>
                              );
                            }}
                          />

                          {/* Validación visual de años */}
                          {watch("criteria.specificYears")?.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <span>Años seleccionados:</span>
                                <div className="flex flex-wrap gap-1">
                                  {(
                                    (watch(
                                      "criteria.specificYears"
                                    ) as number[]) || []
                                  )
                                    .sort((a, b) => a - b)
                                    .map((year) => (
                                      <Tag
                                        key={year}
                                        color="blue"
                                        className="text-xs"
                                      >
                                        {year}
                                      </Tag>
                                    ))}
                                </div>
                              </div>

                              {/* Advertencias de validación */}
                              {(() => {
                                const specificYears =
                                  (watch(
                                    "criteria.specificYears"
                                  ) as number[]) || [];
                                const currentYear = new Date().getFullYear();

                                const warnings = [];

                                // Verificar años futuros
                                const futureYears = specificYears.filter(
                                  (year) => year > currentYear + 1
                                );
                                if (futureYears.length > 0) {
                                  warnings.push(
                                    `Años futuros: ${futureYears.join(", ")}`
                                  );
                                }

                                // Verificar años muy antiguos
                                const veryOldYears = specificYears.filter(
                                  (year) => year < 1990
                                );
                                if (veryOldYears.length > 0) {
                                  warnings.push(
                                    `Años muy antiguos: ${veryOldYears.join(
                                      ", "
                                    )}`
                                  );
                                }

                                if (warnings.length > 0) {
                                  return (
                                    <Alert
                                      message="Advertencias de validación"
                                      description={
                                        <ul className="list-disc list-inside">
                                          {warnings.map((warning, index) => (
                                            <li key={index}>{warning}</li>
                                          ))}
                                        </ul>
                                      }
                                      type="warning"
                                      showIcon
                                      className="mt-2"
                                    />
                                  );
                                }

                                return null;
                              })()}
                            </div>
                          )}

                          {/* Ayuda contextual mejorada */}
                          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                            <div className="font-medium text-blue-800 mb-1">
                              💡 Guía de uso:
                            </div>
                            <ul className="space-y-1">
                              <li>
                                <strong>Rangos de años:</strong> Usa "Año
                                Mínimo" y "Año Máximo" para períodos continuos
                                (ej: 2010-2020)
                              </li>
                              <li>
                                <strong>Años específicos:</strong> Usa esta
                                opción para años discontinuos (ej: 2015, 2017,
                                2019)
                              </li>
                              <li>
                                <strong>Exclusión mutua:</strong> Solo puedes
                                usar uno de los dos métodos, no ambos
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agregar el componente de ayuda de criterios */}
                {activeTab === "2" && (
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Resumen de Criterios Seleccionados
                    </h3>
                    <CriteriaHelper
                      criteria={{
                        brands: selectedBrands.map((brand) => brand.value),
                        families: selectedFamilies.map(
                          (family) => family.value
                        ),
                        models: selectedModels.map((model) => model.value),
                        lines: selectedLines.map((line) => line.value),
                        transmissions: selectedTransmissions.map(
                          (transmission) => transmission.value
                        ),
                        fuels: selectedFuels.map((fuel) => fuel.value),
                        minYear:
                          parseInt(
                            watch("criteria.minYear") as unknown as string
                          ) || undefined,
                        maxYear:
                          parseInt(
                            watch("criteria.maxYear") as unknown as string
                          ) || undefined,
                        specificYears:
                          (watch(
                            "criteria.specificYears"
                          ) as unknown as number[]) || [],
                      }}
                      selectedData={{
                        brands: selectedBrands,
                        families: selectedFamilies,
                        models: selectedModels,
                        lines: selectedLines,
                        transmissions: selectedTransmissions,
                        fuels: selectedFuels,
                      }}
                      includedVehicles={selectedIncludedVehicles}
                      excludedVehicles={selectedExcludedVehicles}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-8 p-4 border-t">
                <Button
                  type="button"
                  onClick={() => setActiveTab("1")}
                  className="border-gray-300 text-gray-600 btn-secondary"
                >
                  <span className="mr-2">←</span> Anterior
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("3")}
                  className="bg-blue-600 hover:bg-blue-700 text-white btn-primary"
                >
                  Siguiente: Excepciones <span className="ml-2">→</span>
                </Button>
              </div>
            </TabPane>

            <TabPane
              tab={
                <span className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      activeTab === "3"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    3
                  </div>
                  <span>Excepciones</span>
                </span>
              }
              key="3"
            >
              <div className="p-4 space-y-6">
                {/* Información de excepciones */}
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-6">
                  <div className="flex items-start">
                    <div className="p-2 bg-amber-100 rounded-full mr-3">
                      <InfoCircleOutlined className="text-amber-600 text-lg" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-amber-800 mb-1">
                        ¿Qué son las excepciones?
                      </h3>
                      <p className="text-xs text-amber-700">
                        Las excepciones te permiten incluir o excluir vehículos
                        específicos, sin importar los criterios establecidos:
                      </p>
                      <ul className="text-xs text-amber-700 mt-2 list-disc list-inside">
                        <li>
                          <strong>Vehículos Incluidos:</strong> Se incluirán
                          aunque NO cumplan con los criterios
                        </li>
                        <li>
                          <strong>Vehículos Excluidos:</strong> Se excluirán
                          aunque cumplan con los criterios
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehículos incluidos */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-green-100 rounded-full">
                        <Plus className="text-green-600 w-4 h-4" />
                      </div>
                      <label className="block text-sm font-medium text-green-800">
                        Vehículos para incluir específicamente
                      </label>
                      <Tooltip title="Vehículos que deseas incluir aunque no cumplan los criterios">
                        <InfoCircleOutlined className="text-green-500 cursor-help" />
                      </Tooltip>
                    </div>
                    <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                        <VehicleSelector
                          onChange={handleIncludedVehicleAdd}
                          value={null}
                          placeholder="Añadir vehículo específico"
                          className="rounded-md custom-selector border-green-200"
                        />
                    </div>
                      <Button
                        type="button"
                        onClick={() =>
                          selectedIncludedVehicles.length > 0 &&
                          setSelectedIncludedVehicles([])
                        }
                        disabled={selectedIncludedVehicles.length === 0}
                        className="border-green-200 text-green-600 hover:bg-green-50 btn-success"
                      >
                        Limpiar
                      </Button>
                  </div>
                    <div className="min-h-32 p-3 bg-white rounded-md border border-green-200 overflow-auto">
                      {selectedIncludedVehicles.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                          <Plus className="w-8 h-8 text-green-200 mb-2" />
                          <span className="text-xs text-gray-400">
                            No hay vehículos incluidos
                            <br />
                            específicamente
                          </span>
                        </div>
                      ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedIncludedVehicles.map((vehicle) => (
                      <Tag
                        key={vehicle.value}
                        closable
                              onClose={() =>
                                setSelectedIncludedVehicles(
                                  selectedIncludedVehicles.filter(
                                    (v) => v.value !== vehicle.value
                                  )
                                )
                              }
                        color="green"
                              className="mb-2 custom-tag"
                      >
                        {vehicle.label}
                      </Tag>
                    ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-green-700">
                      <Check className="w-3 h-3 inline-block mr-1" />
                      Estos vehículos <strong>SIEMPRE</strong> estarán incluidos
                      en el grupo
                  </div>
                </div>

                {/* Vehículos excluidos */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-red-100 rounded-full">
                        <Minus className="text-red-600 w-4 h-4" />
                      </div>
                      <label className="block text-sm font-medium text-red-800">
                        Vehículos para excluir específicamente
                      </label>
                    <Tooltip title="Vehículos que deseas excluir aunque cumplan los criterios">
                        <InfoCircleOutlined className="text-red-500 cursor-help" />
                    </Tooltip>
                  </div>
                    <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                        <VehicleSelector
                          onChange={handleExcludedVehicleAdd}
                          value={null}
                          placeholder="Añadir vehículo para excluir"
                          className="rounded-md custom-selector border-red-200"
                        />
                    </div>
                      <Button
                        type="button"
                        onClick={() =>
                          selectedExcludedVehicles.length > 0 &&
                          setSelectedExcludedVehicles([])
                        }
                        disabled={selectedExcludedVehicles.length === 0}
                        className="border-red-200 text-red-600 hover:bg-red-50 btn-danger"
                      >
                        Limpiar
                      </Button>
                  </div>
                    <div className="min-h-32 p-3 bg-white rounded-md border border-red-200 overflow-auto">
                      {selectedExcludedVehicles.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                          <Minus className="w-8 h-8 text-red-200 mb-2" />
                          <span className="text-xs text-gray-400">
                            No hay vehículos excluidos
                            <br />
                            específicamente
                          </span>
                        </div>
                      ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedExcludedVehicles.map((vehicle) => (
                      <Tag
                        key={vehicle.value}
                        closable
                              onClose={() =>
                                setSelectedExcludedVehicles(
                                  selectedExcludedVehicles.filter(
                                    (v) => v.value !== vehicle.value
                                  )
                                )
                              }
                        color="red"
                              className="mb-2 custom-tag"
                      >
                        {vehicle.label}
                      </Tag>
                    ))}
                  </div>
                      )}
                </div>
                    <div className="mt-2 text-xs text-red-700">
                      <AlertCircle className="w-3 h-3 inline-block mr-1" />
                      Estos vehículos <strong>NUNCA</strong> estarán incluidos
                      en el grupo
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8 p-4 border-t">
                <Button
                  type="button"
                  onClick={() => setActiveTab("2")}
                  className="border-gray-300 text-gray-600 btn-secondary"
                >
                  <span className="mr-2">←</span> Anterior
                </Button>
                {mode === "edit" && initialData ? (
                  <Button
                    type="button"
                    onClick={() => setActiveTab("4")}
                    className="bg-blue-600 hover:bg-blue-700 text-white btn-primary"
                  >
                    Siguiente: Vehículos Compatibles{" "}
                    <span className="ml-2">→</span>
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white btn-success"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creando..." : "Crear Grupo"}
                  </Button>
                )}
              </div>
            </TabPane>

            {/* Nueva pestaña para ver vehículos compatibles (solo en modo edición) */}
            {mode === "edit" && initialData && (
              <TabPane
                tab={
                  <span className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        activeTab === "4"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      4
                    </div>
                    <span>Vehículos Compatibles</span>
                  </span>
                }
                key="4"
              >
                <div className="p-4 space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-6">
                    <div className="flex items-start">
                      <div className="p-2 bg-blue-100 rounded-full mr-3">
                        <Check className="text-blue-600 w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-blue-800 mb-1">
                          Vehículos Compatibles
                        </h3>
                        <p className="text-xs text-blue-700">
                          Esta vista muestra los vehículos que son compatibles
                          con los criterios definidos en este grupo. Los
                          vehículos se calculan dinámicamente según los
                          criterios y excepciones establecidos.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">
                        Vehículos Compatibles con este Grupo
                      </h3>
                      <Tooltip title="Esta vista muestra los vehículos que son compatibles con los criterios de este grupo">
                        <InfoCircleOutlined className="text-blue-500 cursor-help" />
                      </Tooltip>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setShowVehiclesViewer(!showVehiclesViewer)}
                      className="bg-blue-500 hover:bg-blue-600 text-white btn-primary"
                    >
                      {showVehiclesViewer
                        ? "Ocultar Vehículos"
                        : "Mostrar Vehículos"}
                    </Button>
                  </div>

                  {activeTab === "4" && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <CompatibleVehiclesViewer
                        groupId={initialData._id}
                        isOpen={showVehiclesViewer}
                      />
                    </div>
                  )}

                  {!showVehiclesViewer && (
                    <Alert
                      message="Verificación de compatibilidad"
                      description="Haz clic en 'Mostrar Vehículos' para ver qué vehículos son compatibles con los criterios establecidos en este grupo."
                      type="info"
                      showIcon
                    />
                  )}

                  <div className="flex justify-between mt-8 p-4 border-t">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("3")}
                      className="border-gray-300 text-gray-600"
                    >
                      <span className="mr-2">←</span> Anterior
                    </Button>
                    <Button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Actualizando..." : "Actualizar Grupo"}
                    </Button>
                  </div>
                </div>
              </TabPane>
            )}
          </Tabs>

          {/* Botones finales del formulario - Solo visibles en móvil o cuando no hay tabs activos */}
          <div className="flex justify-end gap-3 pt-4 border-t md:hidden">
            <Button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white btn-secondary"
            >
              Cancelar
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white btn-success btn-hover-scale"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isSubmitting
                  ? mode === "edit"
                    ? "Actualizando..."
                    : "Creando..."
                  : mode === "edit"
                  ? "Actualizar Grupo"
                  : "Crear Grupo"}
              </Button>
            </motion.div>
          </div>
        </form>
      )}
    </motion.div>
  );
} 
