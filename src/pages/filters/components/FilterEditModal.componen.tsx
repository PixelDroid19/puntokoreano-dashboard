// src/pages/filters/components/FilterEditModal.tsx

import React, { useCallback } from "react";
import { Modal, Form, Space, Divider, message, Select, Collapse } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Filter } from "../../../api/types";
import { formatValue, validateYear } from "../../../utils/filters";
import {
  CustomInput,
  CustomButton,
  YearInput,
} from "../../../components/common";

const { Panel } = Collapse;

interface FilterEditModalProps {
  filter: Filter | null;
  open: boolean;
  onClose: () => void;
  onSave: (filter: Partial<Filter>) => void;
}

interface FormData {
  family_name: string;
  yearGroups: Array<{
    year: string;
    models: Array<{
      label: string;
      value?: string;
    }>;
    transmissions: Array<{
      model: string;
      label: string;
      value?: string;
    }>;
    fuels: Record<
      string,
      Record<
        string,
        Array<{
          label: string;
          value?: string;
        }>
      >
    >;
    lines: Record<
      string,
      Record<
        string,
        Record<
          string,
          Array<{
            label: string;
            value?: string;
          }>
        >
      >
    >;
  }>;
}

const yearValidationRules = [
  { required: true, message: "El año es requerido" },
  {
    validator: (_: any, value: string) => {
      if (!value) return Promise.resolve();
      if (!/^\d{4}$/.test(value)) {
        return Promise.reject("Debe ser un año válido (YYYY)");
      }
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        return Promise.reject(
          `El año debe estar entre 1900 y ${currentYear + 1}`
        );
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

const FilterEditModal: React.FC<FilterEditModalProps> = ({
  filter,
  open,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm<FormData>();
  const [activeYear, setActiveYear] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Memoized transformación de datos de filtro a formulario
  const transformFilterToForm = useCallback((filter: Filter) => {
    const formData: FormData = {
      family_name: filter.family_name,
      yearGroups: Object.entries(filter.families).map(([year, models]) => {
        const yearGroup = {
          year,
          models: models.map((model) => ({
            label: model.label,
            value: model.value || formatValue(model.label),
          })),
          transmissions: [] as any[],
          fuels: {} as any,
          lines: {} as any,
        };

        // Procesar transmisiones
        const modelTransmissions = filter.transmissions[year] || {};
        Object.entries(modelTransmissions).forEach(
          ([modelValue, transmissions]) => {
            const modelLabel = models.find(
              (m) => m.value === modelValue
            )?.label;
            if (modelLabel) {
              transmissions.forEach((trans) => {
                yearGroup.transmissions.push({
                  model: modelLabel,
                  label: trans.label,
                  value: trans.value || formatValue(trans.label),
                });
              });
            }
          }
        );

        // Procesar combustibles
        const modelFuels = filter.fuels[year] || {};
        Object.entries(modelFuels).forEach(([modelValue, transmissionMap]) => {
          const modelLabel = models.find((m) => m.value === modelValue)?.label;
          if (modelLabel) {
            yearGroup.fuels[modelLabel] = {};
            Object.entries(transmissionMap).forEach(([transValue, fuels]) => {
              const transLabel = yearGroup.transmissions.find(
                (t) => t.value === transValue
              )?.label;
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
              const transLabel = yearGroup.transmissions.find(
                (t) => t.value === transValue
              )?.label;
              if (transLabel) {
                yearGroup.lines[modelLabel][transLabel] = {};
                Object.entries(fuelMap).forEach(([fuelValue, lines]) => {
                  const fuelLabel = yearGroup.fuels[modelLabel]?.[
                    transLabel
                  ]?.find((f) => f.value === fuelValue)?.label;
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
    } else {
      form.resetFields();
    }
  }, [filter, open, form, transformFilterToForm]);

  // Memoized options y handlers
  const getModelOptions = useCallback(
    (yearIndex: number) => {
      const models =
        form.getFieldValue(["yearGroups", yearIndex, "models"]) || [];
      return models.map((model: any) => ({
        label: model.label,
        value: model.label,
      }));
    },
    [form]
  );

  const getTransmissionOptions = useCallback(
    (yearIndex: number, model: string) => {
      const transmissions =
        form.getFieldValue(["yearGroups", yearIndex, "transmissions"]) || [];
      return transmissions
        .filter((t: any) => t.model === model)
        .map((t: any) => ({
          label: t.label,
          value: t.label,
        }));
    },
    [form]
  );

  const getFuelOptions = useCallback(
    (yearIndex: number, model: string, transmission: string) => {
      const fuels =
        form.getFieldValue(["yearGroups", yearIndex, "fuels"])?.[model]?.[
          transmission
        ] || [];
      return fuels.map((fuel: any) => ({
        label: fuel.label,
        value: fuel.label,
      }));
    },
    [form]
  );

  // Transformación de datos del formulario al formato del backend
  const transformFormToFilter = useCallback((values: FormData) => {
    const formattedData = {
      family_name: values.family_name.toLowerCase(),
      families: {} as any,
      transmissions: {} as any,
      fuels: {} as any,
      lines: {} as any,
    };

    values.yearGroups.forEach((yearGroup) => {
      const year = yearGroup.year;
      if (!validateYear(year)) return;

      // Process models
      formattedData.families[year] = yearGroup.models.map((model) => ({
        label: model.label,
        value: model.value || formatValue(model.label),
      }));

      // Process transmissions
      formattedData.transmissions[year] = {};
      yearGroup.models.forEach((model) => {
        const modelValue = model.value || formatValue(model.label);
        const modelTransmissions =
          yearGroup.transmissions
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
        Object.entries(modelFuels).forEach(
          ([transLabel, fuels]: [string, any]) => {
            const transValue =
              yearGroup.transmissions?.find(
                (t) => t.model === model.label && t.label === transLabel
              )?.value || formatValue(transLabel);

            formattedData.fuels[year][modelValue][transValue] = fuels.map(
              (fuel) => ({
                label: fuel.label,
                value: fuel.value || formatValue(fuel.label),
              })
            );
          }
        );
      });

      // Process lines
      formattedData.lines[year] = {};
      yearGroup.models.forEach((model) => {
        const modelValue = model.value || formatValue(model.label);
        formattedData.lines[year][modelValue] = {};

        const modelLines = yearGroup.lines?.[model.label] || {};
        Object.entries(modelLines).forEach(
          ([transLabel, fuelMap]: [string, any]) => {
            const transValue =
              yearGroup.transmissions?.find(
                (t) => t.model === model.label && t.label === transLabel
              )?.value || formatValue(transLabel);

            formattedData.lines[year][modelValue][transValue] = {};
            Object.entries(fuelMap).forEach(
              ([fuelLabel, lines]: [string, any]) => {
                const fuelValue =
                  yearGroup.fuels?.[model.label]?.[transLabel]?.find(
                    (f) => f.label === fuelLabel
                  )?.value || formatValue(fuelLabel);

                formattedData.lines[year][modelValue][transValue][fuelValue] =
                  lines.map((line) => ({
                    label: line.label,
                    value: line.value || formatValue(line.label),
                  }));
              }
            );
          }
        );
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
    } catch (error) {
      console.error("Form validation error:", error);
      message.error(
        "Por favor complete todos los campos requeridos correctamente"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Editar Filtro"
      open={open}
      onCancel={onClose}
      width={1200}
      onOk={handleSubmit}
      confirmLoading={loading}
      className="filter-edit-modal"
    >
      <Form form={form} layout="vertical" className="filter-form">
        <Form.Item
          name="family_name"
          label="Nombre de familia"
          rules={[
            { required: true, message: "El nombre de familia es requerido" },
            { min: 2, message: "El nombre debe tener al menos 2 caracteres" },
            { max: 50, message: "El nombre no puede exceder 50 caracteres" },
          ]}
        >
          <CustomInput placeholder="Nombre de la familia" />
        </Form.Item>

        <Form.List name="yearGroups">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, yearIndex) => (
                <div key={field.key} className="year-section">
                  <Divider>Año {yearIndex + 1}</Divider>
                  <Space align="baseline" className="year-header">
                    <Form.Item
                      {...field}
                      name={[field.name, "year"]}
                      rules={yearValidationRules}
                      className="year-input"
                    >
                      <YearInput />
                    </Form.Item>
                    {fields.length > 1 && (
                      <CustomButton
                        type="link"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(field.name)}
                      >
                        Eliminar año
                      </CustomButton>
                    )}
                  </Space>

                  <Collapse
                    activeKey={
                      activeYear === yearIndex
                        ? ["models", "transmissions", "fuels", "lines"]
                        : []
                    }
                    onChange={() =>
                      setActiveYear(activeYear === yearIndex ? null : yearIndex)
                    }
                  >
                    {/* Panel de Modelos */}
                    <Panel header="Modelos" key="models">
                      <Form.List name={[field.name, "models"]}>
                        {(
                          modelFields,
                          { add: addModel, remove: removeModel }
                        ) => (
                          <div className="nested-fields">
                            {modelFields.map((modelField) => (
                              <Space key={modelField.key} align="baseline">
                                <Form.Item
                                  {...modelField}
                                  name={[modelField.name, "label"]}
                                  rules={modelValidationRules}
                                >
                                  <CustomInput placeholder="Nombre del modelo" />
                                </Form.Item>
                                <MinusCircleOutlined
                                  className="remove-icon"
                                  onClick={() => removeModel(modelField.name)}
                                />
                              </Space>
                            ))}
                            <CustomButton
                              type="dashed"
                              onClick={() => addModel()}
                              block
                              icon={<PlusOutlined />}
                            >
                              Agregar Modelo
                            </CustomButton>
                          </div>
                        )}
                      </Form.List>
                    </Panel>

                    {/* Panel de Transmisiones */}
                    <Panel header="Transmisiones" key="transmissions">
                      <Form.List name={[field.name, "transmissions"]}>
                        {(
                          transFields,
                          { add: addTrans, remove: removeTrans }
                        ) => (
                          <div className="nested-fields">
                            {transFields.map((transField) => (
                              <Space key={transField.key} align="baseline">
                                <Form.Item
                                  name={[transField.name, "model"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Seleccione un modelo",
                                    },
                                  ]}
                                >
                                  <Select
                                    placeholder="Seleccione modelo"
                                    options={getModelOptions(yearIndex)}
                                    className="model-select"
                                  />
                                </Form.Item>
                                <Form.Item
                                  name={[transField.name, "label"]}
                                  rules={transmissionValidationRules}
                                >
                                  <CustomInput placeholder="Nombre de transmisión" />
                                </Form.Item>
                                <MinusCircleOutlined
                                  className="remove-icon"
                                  onClick={() => removeTrans(transField.name)}
                                />
                              </Space>
                            ))}
                            <CustomButton
                              type="dashed"
                              onClick={() => addTrans()}
                              block
                              icon={<PlusOutlined />}
                            >
                              Agregar Transmisión
                            </CustomButton>
                          </div>
                        )}
                      </Form.List>
                    </Panel>

                    {/* Panel de Combustibles */}
                    <Panel header="Combustibles" key="fuels">
                      <div className="nested-fields">
                        {getModelOptions(yearIndex).map((modelOption) => (
                          <div
                            key={modelOption.value}
                            className="model-section"
                          >
                            <Divider orientation="left">
                              {modelOption.label}
                            </Divider>
                            {getTransmissionOptions(
                              yearIndex,
                              modelOption.value
                            ).map((transOption) => (
                              <div
                                key={transOption.value}
                                className="transmission-section"
                              >
                                <Divider orientation="left" plain>
                                  {transOption.label}
                                </Divider>
                                <Form.List
                                  name={[
                                    field.name,
                                    "fuels",
                                    modelOption.value,
                                    transOption.value,
                                  ]}
                                >
                                  {(
                                    fuelFields,
                                    { add: addFuel, remove: removeFuel }
                                  ) => (
                                    <div className="nested-fields">
                                      {fuelFields.map((fuelField) => (
                                        <Space
                                          key={fuelField.key}
                                          align="baseline"
                                        >
                                          <Form.Item
                                            {...fuelField}
                                            name={[fuelField.name, "label"]}
                                            rules={fuelValidationRules}
                                          >
                                            <CustomInput placeholder="Tipo de combustible" />
                                          </Form.Item>
                                          <MinusCircleOutlined
                                            className="remove-icon"
                                            onClick={() =>
                                              removeFuel(fuelField.name)
                                            }
                                          />
                                        </Space>
                                      ))}
                                      <CustomButton
                                        type="dashed"
                                        onClick={() => addFuel()}
                                        block
                                        icon={<PlusOutlined />}
                                      >
                                        Agregar Combustible
                                      </CustomButton>
                                    </div>
                                  )}
                                </Form.List>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </Panel>

                    {/* Panel de Líneas */}
                    <Panel header="Líneas" key="lines">
                      <div className="nested-fields">
                        {getModelOptions(yearIndex).map((modelOption) => (
                          <div
                            key={modelOption.value}
                            className="model-section"
                          >
                            <Divider orientation="left">
                              {modelOption.label}
                            </Divider>
                            {getTransmissionOptions(
                              yearIndex,
                              modelOption.value
                            ).map((transOption) => (
                              <div
                                key={transOption.value}
                                className="transmission-section"
                              >
                                <Divider orientation="left" plain>
                                  {transOption.label}
                                </Divider>
                                {getFuelOptions(
                                  yearIndex,
                                  modelOption.value,
                                  transOption.value
                                ).map((fuelOption) => (
                                  <div
                                    key={fuelOption.value}
                                    className="fuel-section"
                                  >
                                    <Divider orientation="left" plain>
                                      {fuelOption.label}
                                    </Divider>
                                    <Form.List
                                      name={[
                                        field.name,
                                        "lines",
                                        modelOption.value,
                                        transOption.value,
                                        fuelOption.value,
                                      ]}
                                    >
                                      {(
                                        lineFields,
                                        { add: addLine, remove: removeLine }
                                      ) => (
                                        <div className="nested-fields">
                                          {lineFields.map((lineField) => (
                                            <Space
                                              key={lineField.key}
                                              align="baseline"
                                            >
                                              <Form.Item
                                                {...lineField}
                                                name={[lineField.name, "label"]}
                                                rules={lineValidationRules}
                                              >
                                                <CustomInput placeholder="Nombre de línea" />
                                              </Form.Item>
                                              <MinusCircleOutlined
                                                className="remove-icon"
                                                onClick={() =>
                                                  removeLine(lineField.name)
                                                }
                                              />
                                            </Space>
                                          ))}
                                          <CustomButton
                                            type="dashed"
                                            onClick={() => addLine()}
                                            block
                                            icon={<PlusOutlined />}
                                          >
                                            Agregar Línea
                                          </CustomButton>
                                        </div>
                                      )}
                                    </Form.List>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </Collapse>
                </div>
              ))}
              <CustomButton
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                className="add-year-button"
              >
                Agregar Año
              </CustomButton>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default FilterEditModal;
