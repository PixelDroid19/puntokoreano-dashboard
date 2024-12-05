import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { Button, Form, Input, Card, message, Space, Collapse, Select, } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { NumericFormat } from "react-number-format";
import FiltersService from "../../../services/filters.service";
import { formatValue, validateDependentFields, validationRules, } from "../../../utils/filters";
import "./AddFilters.styles.css";
const { Panel } = Collapse;
const PriceInput = ({ value, onChange, }) => (_jsx(NumericFormat, { value: value, thousandSeparator: ".", decimalSeparator: ",", prefix: "$ ", decimalScale: 0, allowNegative: false, onValueChange: (values) => {
        onChange?.(values.floatValue || 0);
    }, customInput: Input, className: "price-input" }));
const AddFilters = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [expandedYear, setExpandedYear] = React.useState(null);
    const createFilter = useMutation({
        mutationFn: (filters) => FiltersService.createFilter(filters),
        onSuccess: () => {
            message.success("Filtro creado correctamente");
            navigate("/filters");
        },
        onError: (error) => {
            message.error(error.message || "Error al crear el filtro");
        },
    });
    const transformData = (values) => {
        const result = {
            family_name: values.family_name.toLowerCase(),
            families: {},
            transmissions: {},
            fuels: {},
            lines: {},
        };
        values.yearGroups?.forEach((yearGroup) => {
            const year = yearGroup.year;
            // Process families (models)
            result.families[year] = yearGroup.models.map((model) => ({
                label: model.label,
                value: model.value || formatValue(model.label),
                price: yearGroup.price || 0,
            }));
            // Initialize structures for the year
            result.transmissions[year] = {};
            result.fuels[year] = {};
            result.lines[year] = {};
            // Process for each model
            yearGroup.models.forEach((model) => {
                const modelValue = model.value || formatValue(model.label);
                // Process transmissions
                const modelTransmissions = yearGroup.transmissions?.filter((t) => t.model === model.label) || [];
                if (modelTransmissions.length > 0) {
                    result.transmissions[year][modelValue] = modelTransmissions.map((trans) => ({
                        label: trans.label,
                        value: trans.value || formatValue(trans.label),
                    }));
                    // Process fuels for each transmission
                    modelTransmissions.forEach((trans) => {
                        const transValue = trans.value || formatValue(trans.label);
                        result.fuels[year][modelValue] =
                            result.fuels[year][modelValue] || {};
                        const transmissionFuels = yearGroup.fuels?.filter((f) => f.model === model.label && f.transmission === trans.label) || [];
                        if (transmissionFuels.length > 0) {
                            result.fuels[year][modelValue][transValue] =
                                transmissionFuels.map((fuel) => ({
                                    label: fuel.label,
                                    value: fuel.value || formatValue(fuel.label),
                                }));
                            // Process lines
                            result.lines[year][modelValue] =
                                result.lines[year][modelValue] || {};
                            result.lines[year][modelValue][transValue] = {};
                            transmissionFuels.forEach((fuel) => {
                                const fuelValue = fuel.value || formatValue(fuel.label);
                                const fuelLines = yearGroup.lines?.filter((l) => l.model === model.label &&
                                    l.transmission === trans.label &&
                                    l.fuel === fuel.label) || [];
                                if (fuelLines.length > 0) {
                                    result.lines[year][modelValue][transValue][fuelValue] =
                                        fuelLines.map((line) => ({
                                            label: line.label,
                                            value: line.value || formatValue(line.label),
                                        }));
                                }
                            });
                        }
                    });
                }
            });
        });
        return result;
    };
    const onFinish = (values) => {
        const formattedData = transformData(values);
        createFilter.mutate(formattedData);
    };
    const handleValuesChange = (changedValues) => {
        if (changedValues.yearGroups) {
            form.validateFields(["yearGroups"]);
        }
    };
    return (_jsxs("div", { className: "add-filters-container", children: [_jsxs("div", { className: "header", children: [_jsx(Button, { size: "small", type: "text", onClick: () => navigate(-1), icon: _jsx(FontAwesomeIcon, { icon: faArrowLeft }) }), _jsx("h1", { children: "Agregar Filtro" })] }), _jsxs(Form, { form: form, layout: "vertical", onFinish: onFinish, onValuesChange: handleValuesChange, initialValues: {
                    yearGroups: [{ models: [] }],
                }, className: "filter-form", children: [_jsxs(Card, { children: [_jsx(Form.Item, { name: "family_name", label: "Nombre de Familia", rules: validationRules.familyName, children: _jsx(Input, {}) }), _jsx(Form.List, { name: "yearGroups", children: (fields, { add, remove }) => (_jsxs(_Fragment, { children: [fields.map((field, index) => (_jsxs(Card, { className: "year-card", title: `Año ${index + 1}`, children: [_jsx(Form.Item, { ...field, name: [field.name, "year"], label: "A\u00F1o", rules: validationRules.year, children: _jsx(Input, {}) }), _jsxs(Collapse, { activeKey: expandedYear === index
                                                        ? ["models", "transmissions", "fuels", "lines"]
                                                        : [], onChange: () => setExpandedYear(expandedYear === index ? null : index), children: [_jsx(Panel, { header: "Modelos", children: _jsx(Form.List, { name: [field.name, "models"], children: (modelFields, { add: addModel, remove: removeModel }) => (_jsxs("div", { className: "nested-fields", children: [modelFields.map((modelField) => (_jsxs(Space, { align: "baseline", children: [_jsx(Form.Item, { name: [modelField.name, "label"], rules: validationRules.model, children: _jsx(Input, { placeholder: "Nombre del modelo" }) }), _jsx(MinusCircleOutlined, { onClick: () => removeModel(modelField.name) })] }, modelField.key))), _jsx(Button, { type: "dashed", onClick: addModel, block: true, icon: _jsx(PlusOutlined, {}), children: "Agregar Modelo" })] })) }) }, "models"), _jsx(Panel, { header: "Transmisiones", children: _jsx(Form.List, { name: [field.name, "transmissions"], children: (transFields, { add: addTrans, remove: removeTrans }) => (_jsxs("div", { className: "nested-fields", children: [transFields.map((transField) => (_jsxs(Space, { align: "baseline", children: [_jsx(Form.Item, { name: [transField.name, "model"], rules: validationRules.select.model, validateTrigger: "onChange", validator: () => validateDependentFields(form, index, "transmissions"), children: _jsx(Select, { placeholder: "Seleccione modelo", children: form
                                                                                            .getFieldValue([
                                                                                            "yearGroups",
                                                                                            field.name,
                                                                                            "models",
                                                                                        ])
                                                                                            ?.map((model) => (_jsx(Select.Option, { value: model.label, children: model.label }, model.label))) }) }), _jsx(Form.Item, { name: [transField.name, "label"], rules: validationRules.transmission, children: _jsx(Input, { placeholder: "Nombre de transmisi\u00F3n" }) }), _jsx(MinusCircleOutlined, { onClick: () => removeTrans(transField.name) })] }, transField.key))), _jsx(Button, { type: "dashed", onClick: addTrans, block: true, icon: _jsx(PlusOutlined, {}), children: "Agregar Transmisi\u00F3n" })] })) }) }, "transmissions"), _jsx(Panel, { header: "Combustibles", children: _jsx(Form.List, { name: [field.name, "fuels"], children: (fuelFields, { add: addFuel, remove: removeFuel }) => (_jsxs("div", { className: "nested-fields", children: [fuelFields.map((fuelField) => (_jsxs(Space, { align: "baseline", children: [_jsx(Form.Item, { name: [fuelField.name, "model"], rules: validationRules.select.model, validateTrigger: "onChange", validator: () => validateDependentFields(form, index, "fuels"), children: _jsx(Select, { placeholder: "Seleccione modelo", children: form
                                                                                            .getFieldValue([
                                                                                            "yearGroups",
                                                                                            field.name,
                                                                                            "models",
                                                                                        ])
                                                                                            ?.map((model) => (_jsx(Select.Option, { value: model.label, children: model.label }, model.label))) }) }), _jsx(Form.Item, { name: [fuelField.name, "transmission"], rules: validationRules.select.transmission, children: _jsx(Select, { placeholder: "Seleccione transmisi\u00F3n", children: form
                                                                                            .getFieldValue([
                                                                                            "yearGroups",
                                                                                            field.name,
                                                                                            "transmissions",
                                                                                        ])
                                                                                            ?.map((trans) => (_jsx(Select.Option, { value: trans.label, children: trans.label }, trans.label))) }) }), _jsx(Form.Item, { name: [fuelField.name, "label"], rules: validationRules.fuel, children: _jsx(Input, { placeholder: "Tipo de combustible" }) }), _jsx(MinusCircleOutlined, { onClick: () => removeFuel(fuelField.name) })] }, fuelField.key))), _jsx(Button, { type: "dashed", onClick: () => addFuel(), block: true, icon: _jsx(PlusOutlined, {}), children: "Agregar Combustible" })] })) }) }, "fuels"), _jsx(Panel, { header: "L\u00EDneas", children: _jsx(Form.List, { name: [field.name, "lines"], children: (lineFields, { add: addLine, remove: removeLine }) => (_jsxs("div", { className: "nested-fields", children: [lineFields.map((lineField) => (_jsxs(Space, { align: "baseline", children: [_jsx(Form.Item, { name: [lineField.name, "model"], rules: validationRules.select.model, validateTrigger: "onChange", validator: () => validateDependentFields(form, index, "lines"), children: _jsx(Select, { placeholder: "Seleccione modelo", children: form
                                                                                            .getFieldValue([
                                                                                            "yearGroups",
                                                                                            field.name,
                                                                                            "models",
                                                                                        ])
                                                                                            ?.map((model) => (_jsx(Select.Option, { value: model.label, children: model.label }, model.label))) }) }), _jsx(Form.Item, { name: [lineField.name, "transmission"], rules: validationRules.select.transmission, children: _jsx(Select, { placeholder: "Seleccione transmisi\u00F3n", children: form
                                                                                            .getFieldValue([
                                                                                            "yearGroups",
                                                                                            field.name,
                                                                                            "transmissions",
                                                                                        ])
                                                                                            ?.map((trans) => (_jsx(Select.Option, { value: trans.label, children: trans.label }, trans.label))) }) }), _jsx(Form.Item, { name: [lineField.name, "fuel"], rules: validationRules.select.fuel, children: _jsx(Select, { placeholder: "Seleccione combustible", children: form
                                                                                            .getFieldValue([
                                                                                            "yearGroups",
                                                                                            field.name,
                                                                                            "fuels",
                                                                                        ])
                                                                                            ?.filter((fuel) => fuel.model ===
                                                                                            form.getFieldValue([
                                                                                                "yearGroups",
                                                                                                field.name,
                                                                                                "lines",
                                                                                                lineField.name,
                                                                                                "model",
                                                                                            ]) &&
                                                                                            fuel.transmission ===
                                                                                                form.getFieldValue([
                                                                                                    "yearGroups",
                                                                                                    field.name,
                                                                                                    "lines",
                                                                                                    lineField.name,
                                                                                                    "transmission",
                                                                                                ]))
                                                                                            ?.map((fuel) => (_jsx(Select.Option, { value: fuel.label, children: fuel.label }, fuel.label))) }) }), _jsx(Form.Item, { name: [lineField.name, "label"], rules: validationRules.line, children: _jsx(Input, { placeholder: "Nombre de la l\u00EDnea" }) }), _jsx(MinusCircleOutlined, { onClick: () => removeLine(lineField.name) })] }, lineField.key))), _jsx(Button, { type: "dashed", onClick: () => addLine(), block: true, icon: _jsx(PlusOutlined, {}), children: "Agregar L\u00EDnea" })] })) }) }, "lines")] }), fields.length > 1 && (_jsx(Button, { type: "link", danger: true, onClick: () => remove(field.name), children: "Eliminar a\u00F1o" }))] }, field.key))), _jsx(Button, { type: "dashed", onClick: () => add(), block: true, icon: _jsx(PlusOutlined, {}), className: "add-year-button", children: "Agregar A\u00F1o" })] })) })] }), _jsx("div", { className: "form-actions", children: _jsxs(Space, { children: [_jsx(Button, { type: "primary", htmlType: "submit", loading: createFilter.isPending, children: "Guardar" }), _jsx(Button, { onClick: () => navigate("/filters"), children: "Cancelar" })] }) })] })] }));
};
export default AddFilters;
