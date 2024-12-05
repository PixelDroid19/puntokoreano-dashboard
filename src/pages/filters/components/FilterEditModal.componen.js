import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/filters/components/FilterEditModal.tsx
import React, { useCallback } from "react";
import { Modal, Form, Space, Divider, message, Select, Collapse } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { formatValue, validateYear } from "../../../utils/filters";
import { CustomInput, CustomButton, YearInput, } from "../../../components/common";
const { Panel } = Collapse;
const yearValidationRules = [
    { required: true, message: "El año es requerido" },
    {
        validator: (_, value) => {
            if (!value)
                return Promise.resolve();
            if (!/^\d{4}$/.test(value)) {
                return Promise.reject("Debe ser un año válido (YYYY)");
            }
            const year = parseInt(value);
            const currentYear = new Date().getFullYear();
            if (year < 1900 || year > currentYear + 1) {
                return Promise.reject(`El año debe estar entre 1900 y ${currentYear + 1}`);
            }
            return Promise.resolve();
        },
    },
];
const modelValidationRules = [
    { required: true, message: "El nombre del modelo es requerido" },
    { min: 2, message: "El nombre debe tener al menos 2 caracteres" },
    { max: 50, message: "El nombre no puede exceder 50 caracteres" },
];
const transmissionValidationRules = [
    { required: true, message: "La transmisión es requerida" },
    { min: 2, message: "La transmisión debe tener al menos 2 caracteres" },
    { max: 50, message: "La transmisión no puede exceder 50 caracteres" },
];
const fuelValidationRules = [
    { required: true, message: "El combustible es requerido" },
    { min: 2, message: "El combustible debe tener al menos 2 caracteres" },
    { max: 50, message: "El combustible no puede exceder 50 caracteres" },
];
const lineValidationRules = [
    { required: true, message: "La línea es requerida" },
    { min: 2, message: "La línea debe tener al menos 2 caracteres" },
    { max: 100, message: "La línea no puede exceder 100 caracteres" },
];
const FilterEditModal = ({ filter, open, onClose, onSave, }) => {
    const [form] = Form.useForm();
    const [activeYear, setActiveYear] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    // Memoized transformación de datos de filtro a formulario
    const transformFilterToForm = useCallback((filter) => {
        const formData = {
            family_name: filter.family_name,
            yearGroups: Object.entries(filter.families).map(([year, models]) => {
                const yearGroup = {
                    year,
                    models: models.map((model) => ({
                        label: model.label,
                        value: model.value || formatValue(model.label),
                    })),
                    transmissions: [],
                    fuels: {},
                    lines: {},
                };
                // Procesar transmisiones
                const modelTransmissions = filter.transmissions[year] || {};
                Object.entries(modelTransmissions).forEach(([modelValue, transmissions]) => {
                    const modelLabel = models.find((m) => m.value === modelValue)?.label;
                    if (modelLabel) {
                        transmissions.forEach((trans) => {
                            yearGroup.transmissions.push({
                                model: modelLabel,
                                label: trans.label,
                                value: trans.value || formatValue(trans.label),
                            });
                        });
                    }
                });
                // Procesar combustibles
                const modelFuels = filter.fuels[year] || {};
                Object.entries(modelFuels).forEach(([modelValue, transmissionMap]) => {
                    const modelLabel = models.find((m) => m.value === modelValue)?.label;
                    if (modelLabel) {
                        yearGroup.fuels[modelLabel] = {};
                        Object.entries(transmissionMap).forEach(([transValue, fuels]) => {
                            const transLabel = yearGroup.transmissions.find((t) => t.value === transValue)?.label;
                            if (transLabel) {
                                yearGroup.fuels[modelLabel][transLabel] = fuels.map((fuel) => ({
                                    label: fuel.label,
                                    value: fuel.value || formatValue(fuel.label),
                                }));
                            }
                        });
                    }
                });
                // Procesar líneas
                const modelLines = filter.lines[year] || {};
                Object.entries(modelLines).forEach(([modelValue, transmissionMap]) => {
                    const modelLabel = models.find((m) => m.value === modelValue)?.label;
                    if (modelLabel) {
                        yearGroup.lines[modelLabel] = {};
                        Object.entries(transmissionMap).forEach(([transValue, fuelMap]) => {
                            const transLabel = yearGroup.transmissions.find((t) => t.value === transValue)?.label;
                            if (transLabel) {
                                yearGroup.lines[modelLabel][transLabel] = {};
                                Object.entries(fuelMap).forEach(([fuelValue, lines]) => {
                                    const fuelLabel = yearGroup.fuels[modelLabel]?.[transLabel]?.find((f) => f.value === fuelValue)?.label;
                                    if (fuelLabel) {
                                        yearGroup.lines[modelLabel][transLabel][fuelLabel] =
                                            lines.map((line) => ({
                                                label: line.label,
                                                value: line.value || formatValue(line.label),
                                            }));
                                    }
                                });
                            }
                        });
                    }
                });
                return yearGroup;
            }),
        };
        return formData;
    }, []);
    // Efecto para cargar datos iniciales
    React.useEffect(() => {
        if (filter && open) {
            const formData = transformFilterToForm(filter);
            form.setFieldsValue(formData);
        }
        else {
            form.resetFields();
        }
    }, [filter, open, form, transformFilterToForm]);
    // Memoized options y handlers
    const getModelOptions = useCallback((yearIndex) => {
        const models = form.getFieldValue(["yearGroups", yearIndex, "models"]) || [];
        return models.map((model) => ({
            label: model.label,
            value: model.label,
        }));
    }, [form]);
    const getTransmissionOptions = useCallback((yearIndex, model) => {
        const transmissions = form.getFieldValue(["yearGroups", yearIndex, "transmissions"]) || [];
        return transmissions
            .filter((t) => t.model === model)
            .map((t) => ({
            label: t.label,
            value: t.label,
        }));
    }, [form]);
    const getFuelOptions = useCallback((yearIndex, model, transmission) => {
        const fuels = form.getFieldValue(["yearGroups", yearIndex, "fuels"])?.[model]?.[transmission] || [];
        return fuels.map((fuel) => ({
            label: fuel.label,
            value: fuel.label,
        }));
    }, [form]);
    // Transformación de datos del formulario al formato del backend
    const transformFormToFilter = useCallback((values) => {
        const formattedData = {
            family_name: values.family_name.toLowerCase(),
            families: {},
            transmissions: {},
            fuels: {},
            lines: {},
        };
        values.yearGroups.forEach((yearGroup) => {
            const year = yearGroup.year;
            if (!validateYear(year))
                return;
            // Process models
            formattedData.families[year] = yearGroup.models.map((model) => ({
                label: model.label,
                value: model.value || formatValue(model.label),
            }));
            // Process transmissions
            formattedData.transmissions[year] = {};
            yearGroup.models.forEach((model) => {
                const modelValue = model.value || formatValue(model.label);
                const modelTransmissions = yearGroup.transmissions
                    ?.filter((t) => t.model === model.label)
                    ?.map((t) => ({
                    label: t.label,
                    value: t.value || formatValue(t.label),
                })) || [];
                if (modelTransmissions.length > 0) {
                    formattedData.transmissions[year][modelValue] = modelTransmissions;
                }
            });
            // Process fuels
            formattedData.fuels[year] = {};
            yearGroup.models.forEach((model) => {
                const modelValue = model.value || formatValue(model.label);
                formattedData.fuels[year][modelValue] = {};
                const modelFuels = yearGroup.fuels?.[model.label] || {};
                Object.entries(modelFuels).forEach(([transLabel, fuels]) => {
                    const transValue = yearGroup.transmissions?.find((t) => t.model === model.label && t.label === transLabel)?.value || formatValue(transLabel);
                    formattedData.fuels[year][modelValue][transValue] = fuels.map((fuel) => ({
                        label: fuel.label,
                        value: fuel.value || formatValue(fuel.label),
                    }));
                });
            });
            // Process lines
            formattedData.lines[year] = {};
            yearGroup.models.forEach((model) => {
                const modelValue = model.value || formatValue(model.label);
                formattedData.lines[year][modelValue] = {};
                const modelLines = yearGroup.lines?.[model.label] || {};
                Object.entries(modelLines).forEach(([transLabel, fuelMap]) => {
                    const transValue = yearGroup.transmissions?.find((t) => t.model === model.label && t.label === transLabel)?.value || formatValue(transLabel);
                    formattedData.lines[year][modelValue][transValue] = {};
                    Object.entries(fuelMap).forEach(([fuelLabel, lines]) => {
                        const fuelValue = yearGroup.fuels?.[model.label]?.[transLabel]?.find((f) => f.label === fuelLabel)?.value || formatValue(fuelLabel);
                        formattedData.lines[year][modelValue][transValue][fuelValue] =
                            lines.map((line) => ({
                                label: line.label,
                                value: line.value || formatValue(line.label),
                            }));
                    });
                });
            });
        });
        return formattedData;
    }, []);
    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const formattedData = transformFormToFilter(values);
            onSave(formattedData);
        }
        catch (error) {
            console.error("Form validation error:", error);
            message.error("Por favor complete todos los campos requeridos correctamente");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(Modal, { title: "Editar Filtro", open: open, onCancel: onClose, width: 1200, onOk: handleSubmit, confirmLoading: loading, className: "filter-edit-modal", children: _jsxs(Form, { form: form, layout: "vertical", className: "filter-form", children: [_jsx(Form.Item, { name: "family_name", label: "Nombre de familia", rules: [
                        { required: true, message: "El nombre de familia es requerido" },
                        { min: 2, message: "El nombre debe tener al menos 2 caracteres" },
                        { max: 50, message: "El nombre no puede exceder 50 caracteres" },
                    ], children: _jsx(CustomInput, { placeholder: "Nombre de la familia" }) }), _jsx(Form.List, { name: "yearGroups", children: (fields, { add, remove }) => (_jsxs(_Fragment, { children: [fields.map((field, yearIndex) => (_jsxs("div", { className: "year-section", children: [_jsxs(Divider, { children: ["A\u00F1o ", yearIndex + 1] }), _jsxs(Space, { align: "baseline", className: "year-header", children: [_jsx(Form.Item, { ...field, name: [field.name, "year"], rules: yearValidationRules, className: "year-input", children: _jsx(YearInput, {}) }), fields.length > 1 && (_jsx(CustomButton, { type: "link", danger: true, icon: _jsx(MinusCircleOutlined, {}), onClick: () => remove(field.name), children: "Eliminar a\u00F1o" }))] }), _jsxs(Collapse, { activeKey: activeYear === yearIndex
                                            ? ["models", "transmissions", "fuels", "lines"]
                                            : [], onChange: () => setActiveYear(activeYear === yearIndex ? null : yearIndex), children: [_jsx(Panel, { header: "Modelos", children: _jsx(Form.List, { name: [field.name, "models"], children: (modelFields, { add: addModel, remove: removeModel }) => (_jsxs("div", { className: "nested-fields", children: [modelFields.map((modelField) => (_jsxs(Space, { align: "baseline", children: [_jsx(Form.Item, { ...modelField, name: [modelField.name, "label"], rules: modelValidationRules, children: _jsx(CustomInput, { placeholder: "Nombre del modelo" }) }), _jsx(MinusCircleOutlined, { className: "remove-icon", onClick: () => removeModel(modelField.name) })] }, modelField.key))), _jsx(CustomButton, { type: "dashed", onClick: () => addModel(), block: true, icon: _jsx(PlusOutlined, {}), children: "Agregar Modelo" })] })) }) }, "models"), _jsx(Panel, { header: "Transmisiones", children: _jsx(Form.List, { name: [field.name, "transmissions"], children: (transFields, { add: addTrans, remove: removeTrans }) => (_jsxs("div", { className: "nested-fields", children: [transFields.map((transField) => (_jsxs(Space, { align: "baseline", children: [_jsx(Form.Item, { name: [transField.name, "model"], rules: [
                                                                            {
                                                                                required: true,
                                                                                message: "Seleccione un modelo",
                                                                            },
                                                                        ], children: _jsx(Select, { placeholder: "Seleccione modelo", options: getModelOptions(yearIndex), className: "model-select" }) }), _jsx(Form.Item, { name: [transField.name, "label"], rules: transmissionValidationRules, children: _jsx(CustomInput, { placeholder: "Nombre de transmisi\u00F3n" }) }), _jsx(MinusCircleOutlined, { className: "remove-icon", onClick: () => removeTrans(transField.name) })] }, transField.key))), _jsx(CustomButton, { type: "dashed", onClick: () => addTrans(), block: true, icon: _jsx(PlusOutlined, {}), children: "Agregar Transmisi\u00F3n" })] })) }) }, "transmissions"), _jsx(Panel, { header: "Combustibles", children: _jsx("div", { className: "nested-fields", children: getModelOptions(yearIndex).map((modelOption) => (_jsxs("div", { className: "model-section", children: [_jsx(Divider, { orientation: "left", children: modelOption.label }), getTransmissionOptions(yearIndex, modelOption.value).map((transOption) => (_jsxs("div", { className: "transmission-section", children: [_jsx(Divider, { orientation: "left", plain: true, children: transOption.label }), _jsx(Form.List, { name: [
                                                                            field.name,
                                                                            "fuels",
                                                                            modelOption.value,
                                                                            transOption.value,
                                                                        ], children: (fuelFields, { add: addFuel, remove: removeFuel }) => (_jsxs("div", { className: "nested-fields", children: [fuelFields.map((fuelField) => (_jsxs(Space, { align: "baseline", children: [_jsx(Form.Item, { ...fuelField, name: [fuelField.name, "label"], rules: fuelValidationRules, children: _jsx(CustomInput, { placeholder: "Tipo de combustible" }) }), _jsx(MinusCircleOutlined, { className: "remove-icon", onClick: () => removeFuel(fuelField.name) })] }, fuelField.key))), _jsx(CustomButton, { type: "dashed", onClick: () => addFuel(), block: true, icon: _jsx(PlusOutlined, {}), children: "Agregar Combustible" })] })) })] }, transOption.value)))] }, modelOption.value))) }) }, "fuels"), _jsx(Panel, { header: "L\u00EDneas", children: _jsx("div", { className: "nested-fields", children: getModelOptions(yearIndex).map((modelOption) => (_jsxs("div", { className: "model-section", children: [_jsx(Divider, { orientation: "left", children: modelOption.label }), getTransmissionOptions(yearIndex, modelOption.value).map((transOption) => (_jsxs("div", { className: "transmission-section", children: [_jsx(Divider, { orientation: "left", plain: true, children: transOption.label }), getFuelOptions(yearIndex, modelOption.value, transOption.value).map((fuelOption) => (_jsxs("div", { className: "fuel-section", children: [_jsx(Divider, { orientation: "left", plain: true, children: fuelOption.label }), _jsx(Form.List, { name: [
                                                                                    field.name,
                                                                                    "lines",
                                                                                    modelOption.value,
                                                                                    transOption.value,
                                                                                    fuelOption.value,
                                                                                ], children: (lineFields, { add: addLine, remove: removeLine }) => (_jsxs("div", { className: "nested-fields", children: [lineFields.map((lineField) => (_jsxs(Space, { align: "baseline", children: [_jsx(Form.Item, { ...lineField, name: [lineField.name, "label"], rules: lineValidationRules, children: _jsx(CustomInput, { placeholder: "Nombre de l\u00EDnea" }) }), _jsx(MinusCircleOutlined, { className: "remove-icon", onClick: () => removeLine(lineField.name) })] }, lineField.key))), _jsx(CustomButton, { type: "dashed", onClick: () => addLine(), block: true, icon: _jsx(PlusOutlined, {}), children: "Agregar L\u00EDnea" })] })) })] }, fuelOption.value)))] }, transOption.value)))] }, modelOption.value))) }) }, "lines")] })] }, field.key))), _jsx(CustomButton, { type: "dashed", onClick: () => add(), block: true, icon: _jsx(PlusOutlined, {}), className: "add-year-button", children: "Agregar A\u00F1o" })] })) })] }) }));
};
export default FilterEditModal;
