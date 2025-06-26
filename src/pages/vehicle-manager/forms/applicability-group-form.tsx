import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, AlertCircle, Plus, Minus, AlertTriangle, X } from "lucide-react";
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

// Constantes de validación basadas en el modelo backend
const VALIDATION_RULES = {
  NAME: {
    REQUIRED: true,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\s\-_áéíóúñÁÉÍÓÚÑ]+$/,
    MESSAGE: "El nombre solo puede contener letras, números, espacios, guiones y guiones bajos"
  },
  APPLICABILITY_IDENTIFIER: {
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9\-_áéíóúñÁÉÍÓÚÑ]+$/,
    MESSAGE: "El identificador solo puede contener letras, números, guiones y guiones bajos (sin espacios)"
  },
  DESCRIPTION: {
    MAX_LENGTH: 500
  },
  TAG: {
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9\s\-_áéíóúñÁÉÍÓÚÑ]+$/,
    MESSAGE: "Los tags solo pueden contener letras, números, espacios, guiones y guiones bajos"
  },
  YEAR: {
    MIN: 1900,
    MAX: new Date().getFullYear() + 5,
    MAX_RANGE: 50 // Advertencia si el rango es mayor a 50 años
  },
  ENGINE_TYPE: {
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9\s\-_.áéíóúñÁÉÍÓÚÑ]+$/,
    MESSAGE: "El tipo de motor contiene caracteres inválidos"
  }
};

// Funciones de validación personalizadas
const validateName = (value: string) => {
  if (!value) return "El nombre es requerido";
  if (value.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    return `El nombre no puede exceder los ${VALIDATION_RULES.NAME.MAX_LENGTH} caracteres`;
  }
  if (!VALIDATION_RULES.NAME.PATTERN.test(value)) {
    return VALIDATION_RULES.NAME.MESSAGE;
  }
  return true;
};

const validateApplicabilityIdentifier = (value?: string) => {
  if (!value) return true; // Es opcional
  if (value.length > VALIDATION_RULES.APPLICABILITY_IDENTIFIER.MAX_LENGTH) {
    return `El identificador no puede exceder los ${VALIDATION_RULES.APPLICABILITY_IDENTIFIER.MAX_LENGTH} caracteres`;
  }
  if (!VALIDATION_RULES.APPLICABILITY_IDENTIFIER.PATTERN.test(value)) {
    return VALIDATION_RULES.APPLICABILITY_IDENTIFIER.MESSAGE;
  }
  return true;
};

const validateDescription = (value?: string) => {
  if (!value) return true; // Es opcional
  if (value.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
    return `La descripción no puede exceder los ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} caracteres`;
  }
  return true;
};

const validateYear = (value?: number, fieldName = "año") => {
  if (value === undefined || value === null) return true; // Es opcional
  if (!Number.isInteger(value)) {
    return `El ${fieldName} debe ser un número entero`;
  }
  if (value < VALIDATION_RULES.YEAR.MIN) {
    return `El ${fieldName} debe ser mayor o igual a ${VALIDATION_RULES.YEAR.MIN}`;
  }
  if (value > VALIDATION_RULES.YEAR.MAX) {
    return `El ${fieldName} no puede ser mayor a ${VALIDATION_RULES.YEAR.MAX}`;
  }
  return true;
};

const validateYearRange = (minYear?: number, maxYear?: number) => {
  if (!minYear || !maxYear) return true;
  if (minYear > maxYear) {
    return "El año mínimo no puede ser mayor que el año máximo";
  }
  return true;
};

const validateSpecificYears = (years?: number[]) => {
  if (!years || years.length === 0) return true;
  
  // Validar cada año individual
  for (const year of years) {
    const yearValidation = validateYear(year, "año específico");
    if (yearValidation !== true) return yearValidation;
  }
  
  // Verificar duplicados
  const uniqueYears = new Set(years);
  if (uniqueYears.size !== years.length) {
    return "No puede haber años duplicados en la lista";
  }
  
  return true;
};

const validateTag = (tag: string) => {
  if (tag.length > VALIDATION_RULES.TAG.MAX_LENGTH) {
    return `Cada tag no puede exceder los ${VALIDATION_RULES.TAG.MAX_LENGTH} caracteres`;
  }
  if (!VALIDATION_RULES.TAG.PATTERN.test(tag)) {
    return VALIDATION_RULES.TAG.MESSAGE;
  }
  return true;
};

const validateTags = (tags?: string[]) => {
  if (!tags || tags.length === 0) return true;
  
  for (const tag of tags) {
    const tagValidation = validateTag(tag);
    if (tagValidation !== true) return tagValidation;
  }
  
  return true;
};

const validateVehicleDuplication = (includedVehicles?: string[], excludedVehicles?: string[]) => {
  if (!includedVehicles || !excludedVehicles) return true;
  
  const included = new Set(includedVehicles);
  const excluded = new Set(excludedVehicles);
  
  // Buscar intersección
  const duplicates = includedVehicles.filter(id => excluded.has(id));
  
  if (duplicates.length > 0) {
    return "Un vehículo no puede estar incluido y excluido al mismo tiempo";
  }
  
  return true;
};

const validateAtLeastOneCriteria = (data: ApplicabilityGroupFormData) => {
  const { criteria, includedVehicles } = data;
  
  // Verificar si hay criterios definidos
  const hasCriteria = (
    (criteria.brands && criteria.brands.length > 0) ||
    (criteria.families && criteria.families.length > 0) ||
    (criteria.models && criteria.models.length > 0) ||
    (criteria.lines && criteria.lines.length > 0) ||
    (criteria.transmissions && criteria.transmissions.length > 0) ||
    (criteria.fuels && criteria.fuels.length > 0) ||
    criteria.minYear ||
    criteria.maxYear ||
    (criteria.specificYears && criteria.specificYears.length > 0)
  );
  
  // Verificar si hay vehículos incluidos
  const hasIncludedVehicles = includedVehicles && includedVehicles.length > 0;
  
  if (!hasCriteria && !hasIncludedVehicles) {
    return "Debe definir al menos un criterio de aplicabilidad o incluir vehículos específicos";
  }
  
  return true;
};

// Función para generar advertencias de años
const generateYearWarnings = (minYear?: number, maxYear?: number) => {
  const warnings: string[] = [];
  
  if (minYear && maxYear) {
    const yearRange = maxYear - minYear;
    if (yearRange > VALIDATION_RULES.YEAR.MAX_RANGE) {
      warnings.push(`Rango de años muy amplio (${yearRange} años). Considera dividir en grupos más específicos.`);
    }
  }
  
  return warnings;
};

interface ApplicabilityGroupFormData {
  name: string;
  description?: string;
  applicabilityIdentifier?: string;
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
  const [yearWarnings, setYearWarnings] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
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
    trigger,
    getValues,
  } = useForm<ApplicabilityGroupFormData>({
    defaultValues: {
      name: "",
      description: "",
      applicabilityIdentifier: "",
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
    mode: "onChange" // Validar en tiempo real
  });

  const queryClient = useQueryClient();

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData && mode === "edit") {
      setValue("name", initialData.name || "");
      setValue("description", initialData.description || "");
      setValue("applicabilityIdentifier", initialData.applicabilityIdentifier || "");
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

  // Watch para validaciones en tiempo real de años
  const watchedMinYear = watch("criteria.minYear");
  const watchedMaxYear = watch("criteria.maxYear");
  
  useEffect(() => {
    const warnings = generateYearWarnings(watchedMinYear, watchedMaxYear);
    setYearWarnings(warnings);
  }, [watchedMinYear, watchedMaxYear]);

  // Watch para validar al menos un criterio en tiempo real
  const watchedData = watch();
  const [hasCriteriaWarning, setHasCriteriaWarning] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  useEffect(() => {
    // Solo mostrar la advertencia si el usuario ha interactuado con el formulario
    // o si hay datos iniciales (modo edición)
    if (hasUserInteracted || mode === "edit") {
      const hasCriteria = validateAtLeastOneCriteria(watchedData as ApplicabilityGroupFormData);
      setHasCriteriaWarning(hasCriteria !== true);
    }
  }, [watchedData, hasUserInteracted, mode]);

  // Marcar que el usuario ha interactuado cuando cambie de pestaña
  useEffect(() => {
    if (activeTab !== "1") {
      setHasUserInteracted(true);
    }
  }, [activeTab]);

  // Función para obtener errores por pestaña
  const getTabErrors = () => {
    const tabErrors = {
      tab1: [] as string[], // Información Básica
      tab2: [] as string[], // Criterios de Compatibilidad  
      tab3: [] as string[]  // Excepciones
    };

    // Errores de la pestaña 1 (Información Básica)
    if (errors.name) tabErrors.tab1.push('Nombre');
    if (errors.description) tabErrors.tab1.push('Descripción');
    if (errors.applicabilityIdentifier) tabErrors.tab1.push('Identificador');
    if (errors.tags) tabErrors.tab1.push('Tags');

    // Errores de la pestaña 2 (Criterios)
    if (errors.criteria?.minYear) tabErrors.tab2.push('Año Mínimo');
    if (errors.criteria?.maxYear) tabErrors.tab2.push('Año Máximo');
    if (errors.criteria?.specificYears) tabErrors.tab2.push('Años Específicos');
    
    // Agregar advertencia de criterios faltantes a la pestaña 2
    if (hasCriteriaWarning) tabErrors.tab2.push('Criterios faltantes');

    // Errores de validación personalizados - distribuir según corresponda
    validationErrors.forEach(error => {
      if (error.includes('vehículo') && (error.includes('incluido') || error.includes('excluido'))) {
        tabErrors.tab3.push('Conflicto de vehículos');
      } else if (error.includes('criterio') || error.includes('años') || error.includes('año')) {
        tabErrors.tab2.push('Validación de criterios');
      } else if (error.includes('tag')) {
        tabErrors.tab1.push('Validación de tags');
      } else {
        tabErrors.tab1.push('Error de validación');
      }
    });

    // Remover duplicados
    tabErrors.tab1 = [...new Set(tabErrors.tab1)];
    tabErrors.tab2 = [...new Set(tabErrors.tab2)];
    tabErrors.tab3 = [...new Set(tabErrors.tab3)];

    return tabErrors;
  };

    const tabErrors = getTabErrors();

  // Componente para mostrar indicadores de error en las pestañas
  const TabErrorIndicator = ({ errors, tabKey }: { errors: string[], tabKey: string }) => {
    if (errors.length === 0) return null;
    
    return (
      <Tooltip 
        title={
          <div>
            <div className="font-semibold text-xs mb-1">
              {errors.length === 1 ? "Error encontrado:" : `${errors.length} errores encontrados:`}
            </div>
            <ul className="text-xs">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        }
        color="red"
      >
        <div className="flex items-center gap-1 ml-2">
          <div className="relative">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {errors.length}
            </div>
          </div>
        </div>
      </Tooltip>
    );
  };

  // Función para obtener el estilo de la pestaña según errores
  const getTabStyle = (tabKey: keyof typeof tabErrors, isActive: boolean) => {
    const hasErrors = tabErrors[tabKey].length > 0;
    
    if (hasErrors) {
      return isActive 
        ? "bg-red-500 text-white border-red-500" 
        : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100";
    }
    
    return isActive 
      ? "bg-blue-500 text-white" 
      : "bg-gray-200 text-gray-700";
  };
  
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
    setValidationErrors([]);
    
    // Ejecutar validaciones personalizadas
    const errors: string[] = [];
    
    // Validar duplicación de vehículos
    const vehicleDuplicationError = validateVehicleDuplication(
      data.includedVehicles,
      data.excludedVehicles
    );
    if (vehicleDuplicationError !== true) {
      errors.push(vehicleDuplicationError as string);
    }
    
    // Validar al menos un criterio
    const criteriaError = validateAtLeastOneCriteria(data);
    if (criteriaError !== true) {
      errors.push(criteriaError as string);
    }
    
    // Validar rango de años
    const yearRangeError = validateYearRange(
      data.criteria.minYear,
      data.criteria.maxYear
    );
    if (yearRangeError !== true) {
      errors.push(yearRangeError as string);
    }
    
    // Validar años específicos
    const specificYearsError = validateSpecificYears(data.criteria.specificYears);
    if (specificYearsError !== true) {
      errors.push(specificYearsError as string);
    }
    
    // Validar tags
    const tagsError = validateTags(data.tags);
    if (tagsError !== true) {
      errors.push(tagsError as string);
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setFormError({
        message: "Por favor, corrija los siguientes errores:",
        errors: errors
      });
      return;
    }
    
    mutate(data);
  };

  // Handlers para selectores múltiples
  const handleBrandAdd = (brand: BrandOption | null) => {
    setHasUserInteracted(true); // Marcar interacción
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

          {/* Mostrar errores de validación personalizados */}
          {validationErrors.length > 0 && (
            <Alert
              message="Errores de Validación"
              description={
                <ul className="list-disc pl-4 mt-2">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              }
              type="error"
              showIcon
              className="mb-4"
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
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${getTabStyle('tab1', activeTab === "1")}`}
                  >
                    {tabErrors.tab1.length > 0 ? (
                      <X className="w-3 h-3" />
                    ) : (
                      "1"
                    )}
                  </div>
                  <span>Información Básica</span>
                  <TabErrorIndicator errors={tabErrors.tab1} tabKey="tab1" />
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
                    <Tooltip title="Nombre identificador del grupo de aplicabilidad. Debe ser único. Solo se permiten letras, números, espacios, guiones y guiones bajos.">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <Input
                    placeholder="Ej: Vehículos Eléctricos 2020+"
                    className="rounded-md"
                    maxLength={VALIDATION_RULES.NAME.MAX_LENGTH}
                    {...register("name", {
                      required: "El nombre es requerido",
                      validate: validateName
                    })}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Máximo {VALIDATION_RULES.NAME.MAX_LENGTH} caracteres
                  </div>
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
                    maxLength={VALIDATION_RULES.DESCRIPTION.MAX_LENGTH}
                    showCount
                    {...register("description", {
                      validate: validateDescription
                    })}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Máximo {VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} caracteres
                  </div>
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium mb-1">
                      Identificador de Aplicabilidad
                    </label>
                    <Tooltip title="Identificador único para importación Excel. Si se deja vacío, se generará automáticamente. Solo se permiten letras, números, guiones y guiones bajos (sin espacios).">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <Input
                    placeholder="Ej: VEH-ELEC-2020 (opcional - se autogenera si vacío)"
                    className="rounded-md font-mono text-sm"
                    maxLength={VALIDATION_RULES.APPLICABILITY_IDENTIFIER.MAX_LENGTH}
                    {...register("applicabilityIdentifier", {
                      validate: validateApplicabilityIdentifier
                    })}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Máximo {VALIDATION_RULES.APPLICABILITY_IDENTIFIER.MAX_LENGTH} caracteres. Si no se especifica, se generará automáticamente.
                  </div>
                  {errors.applicabilityIdentifier && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.applicabilityIdentifier.message}
                    </p>
                  )}
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
                      Tags (Etiquetas)
                    </label>
                    <Tooltip title="Etiquetas para organizar y categorizar el grupo. Solo se permiten letras, números, espacios, guiones y guiones bajos.">
                      <InfoCircleOutlined className="text-blue-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <Controller
                    name="tags"
                    control={control}
                    rules={{
                      validate: (value) => validateTags(value)
                    }}
                    render={({ field }) => (
                      <AntSelect
                        mode="tags"
                        placeholder="Escribe etiquetas y presiona Enter"
                        value={field.value || []}
                        onChange={(value) => {
                          // Validar cada tag individual antes de añadirlo
                          const validTags = value.filter(tag => {
                            if (typeof tag === 'string') {
                              const validation = validateTag(tag.trim());
                              return validation === true;
                            }
                            return false;
                          });
                          field.onChange(validTags);
                        }}
                        className="w-full rounded-md"
                        tokenSeparators={[',']}
                        maxTagCount="responsive"
                        maxTagTextLength={VALIDATION_RULES.TAG.MAX_LENGTH}
                      />
                    )}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Máximo {VALIDATION_RULES.TAG.MAX_LENGTH} caracteres por etiqueta. Separar con Enter o coma.
                  </div>
                  {errors.tags && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.tags.message}
                    </p>
                  )}
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
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${getTabStyle('tab2', activeTab === "2")}`}
                  >
                    {tabErrors.tab2.length > 0 ? (
                      <X className="w-3 h-3" />
                    ) : (
                      "2"
                    )}
                  </div>
                  <span>Criterios de Compatibilidad</span>
                  <TabErrorIndicator errors={tabErrors.tab2} tabKey="tab2" />
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

                {/* Advertencia de criterios faltantes */}
                {hasCriteriaWarning && (
                  <Alert
                    message="¡Atención!"
                    description="Debes definir al menos un criterio de aplicabilidad o incluir vehículos específicos en la pestaña de Excepciones."
                    type="warning"
                    showIcon
                    className="mb-4"
                  />
                )}

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

                    {/* Información sobre límites de años */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                      <div className="flex items-start">
                        <div className="p-2 bg-blue-100 rounded-full mr-3">
                          <InfoCircleOutlined className="text-blue-600 text-lg" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-800 mb-1">
                            Límites de Años Permitidos
                          </h4>
                          <ul className="text-xs text-blue-700 space-y-1">
                            <li><strong>Año Mínimo:</strong> 1990 - {new Date().getFullYear()} (no años futuros)</li>
                            <li><strong>Año Máximo:</strong> 1990 - {new Date().getFullYear() + 2} (hasta 2 años futuros)</li>
                            <li><strong>Años Específicos:</strong> 1990 - {new Date().getFullYear() + 2}</li>
                          </ul>
                          <p className="text-xs text-blue-600 mt-2 italic">
                            💡 Los límites evitan datos irreales y mantienen coherencia con el catálogo de vehículos.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Opción de Criterios de Año */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                            <label className="block text-sm font-medium mb-1">
                              Año Mínimo
                            </label>
                            <Tooltip title="Año mínimo de fabricación. Debe ser entre 1990 y año actual. No se puede usar junto con años específicos.">
                        <InfoCircleOutlined className="text-blue-500 cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      placeholder="Ej: 2010"
                      className="rounded-md"
                      min={VALIDATION_RULES.YEAR.MIN}
                      max={VALIDATION_RULES.YEAR.MAX}
                      disabled={
                        watch("criteria.specificYears")?.length > 0
                      }
                      {...register("criteria.minYear", {
                        valueAsNumber: true,
                        validate: (value) => validateYear(value, "año mínimo"),
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
                          {errors.criteria?.minYear && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.criteria.minYear.message}
                            </p>
                          )}
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
                            <Tooltip title={`Año máximo de fabricación. Debe ser entre 1990 y ${new Date().getFullYear() + 2}. No se puede usar junto con años específicos.`}>
                        <InfoCircleOutlined className="text-blue-500 cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      placeholder={`Ej: ${new Date().getFullYear()}`}
                      className="rounded-md"
                      min={VALIDATION_RULES.YEAR.MIN}
                      max={VALIDATION_RULES.YEAR.MAX}
                      disabled={
                        watch("criteria.specificYears")?.length > 0
                      }
                      {...register("criteria.maxYear", {
                        valueAsNumber: true,
                        validate: (value) => {
                          // Validación básica de año
                          const yearValidation = validateYear(value, "año máximo");
                          if (yearValidation !== true) return yearValidation;
                          
                          // Validación de rango con año mínimo
                          const minYear = watch("criteria.minYear");
                          if (minYear && value && value < minYear) {
                            return "El año máximo debe ser mayor al año mínimo";
                          }
                          return true;
                        },
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
                          {errors.criteria?.maxYear && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.criteria.maxYear.message}
                            </p>
                          )}
                          {watch("criteria.specificYears")?.length > 0 && (
                            <div className="text-xs text-orange-600 mt-1">
                              Deshabilitado: se están usando años específicos
                            </div>
                          )}
                          <div className="text-xs text-blue-600 mt-1">
                            Rango permitido: {VALIDATION_RULES.YEAR.MIN} - {VALIDATION_RULES.YEAR.MAX}
                          </div>
                          {/* Mostrar advertencias de años */}
                          {yearWarnings.length > 0 && (
                            <div className="mt-2">
                              {yearWarnings.map((warning, index) => (
                                <Alert
                                  key={index}
                                  message={warning}
                                  type="warning"
                                  showIcon
                                  className="mb-1 text-sm"
                                />
                              ))}
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
                            rules={{
                              validate: (value) => validateSpecificYears(value)
                            }}
                            render={({ field }) => {
                              const minYear = VALIDATION_RULES.YEAR.MIN;
                              const maxYear = VALIDATION_RULES.YEAR.MAX;
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
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${getTabStyle('tab3', activeTab === "3")}`}
                  >
                    {tabErrors.tab3.length > 0 ? (
                      <X className="w-3 h-3" />
                    ) : (
                      "3"
                    )}
                  </div>
                  <span>Excepciones</span>
                  <TabErrorIndicator errors={tabErrors.tab3} tabKey="tab3" />
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
