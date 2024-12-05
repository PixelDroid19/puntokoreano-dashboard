import React from "react";
import {
  Button,
  Form,
  Input,
  Card,
  message,
  Space,
  Divider,
  Collapse,
  Select,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { NumericFormat } from "react-number-format";
import FiltersService from "../../../services/filters.service";
import {
  formatValue,
  validateDependentFields,
  validationRules,
} from "../../../utils/filters";
import "./AddFilters.styles.css";

const { Panel } = Collapse;

interface FilterFormData {
  family_name: string;
  yearGroups: {
    year: string;
    price: number;
    models: Array<{
      label: string;
      value?: string;
    }>;
    transmissions?: Array<{
      label: string;
      value?: string;
      model: string;
    }>;
    fuels?: Array<{
      label: string;
      value?: string;
      model: string;
      transmission: string;
    }>;
    lines?: Array<{
      label: string;
      value?: string;
      model: string;
      transmission: string;
      fuel: string;
    }>;
  }[];
}

const PriceInput = ({
  value,
  onChange,
}: {
  value?: number;
  onChange?: (value: number) => void;
}) => (
  <NumericFormat
    value={value}
    thousandSeparator="."
    decimalSeparator=","
    prefix="$ "
    decimalScale={0}
    allowNegative={false}
    onValueChange={(values) => {
      onChange?.(values.floatValue || 0);
    }}
    customInput={Input}
    className="price-input"
  />
);

const AddFilters = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<FilterFormData>();
  const [expandedYear, setExpandedYear] = React.useState<number | null>(null);

  const createFilter = useMutation({
    mutationFn: (filters) => FiltersService.createFilter(filters),
    onSuccess: () => {
      message.success("Filtro creado correctamente");
      navigate("/filters");
    },
    onError: (error: Error) => {
      message.error(error.message || "Error al crear el filtro");
    },
  });

  const transformData = (values: FilterFormData) => {
    const result = {
      family_name: values.family_name.toLowerCase(),
      families: {} as any,
      transmissions: {} as any,
      fuels: {} as any,
      lines: {} as any,
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
        const modelTransmissions =
          yearGroup.transmissions?.filter((t) => t.model === model.label) || [];
        if (modelTransmissions.length > 0) {
          result.transmissions[year][modelValue] = modelTransmissions.map(
            (trans) => ({
              label: trans.label,
              value: trans.value || formatValue(trans.label),
            })
          );

          // Process fuels for each transmission
          modelTransmissions.forEach((trans) => {
            const transValue = trans.value || formatValue(trans.label);
            result.fuels[year][modelValue] =
              result.fuels[year][modelValue] || {};

            const transmissionFuels =
              yearGroup.fuels?.filter(
                (f) => f.model === model.label && f.transmission === trans.label
              ) || [];

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
                const fuelLines =
                  yearGroup.lines?.filter(
                    (l) =>
                      l.model === model.label &&
                      l.transmission === trans.label &&
                      l.fuel === fuel.label
                  ) || [];

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

  const onFinish = (values: FilterFormData) => {
    const formattedData = transformData(values);
    createFilter.mutate(formattedData);
  };

  const handleValuesChange = (changedValues: any) => {
    if (changedValues.yearGroups) {
      form.validateFields(["yearGroups"]);
    }
  };

  return (
    <div className="add-filters-container">
      <div className="header">
        <Button
          size="small"
          type="text"
          onClick={() => navigate(-1)}
          icon={<FontAwesomeIcon icon={faArrowLeft} />}
        />
        <h1>Agregar Filtro</h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
        initialValues={{
          yearGroups: [{ models: [] }],
        }}
        className="filter-form"
      >
        <Card>
          <Form.Item
            name="family_name"
            label="Nombre de Familia"
            rules={validationRules.familyName}
          >
            <Input />
          </Form.Item>

          <Form.List name="yearGroups">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    className="year-card"
                    title={`Año ${index + 1}`}
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, "year"]}
                      label="Año"
                      rules={validationRules.year}
                    >
                      <Input />
                    </Form.Item>

                    <Collapse
                      activeKey={
                        expandedYear === index
                          ? ["models", "transmissions", "fuels", "lines"]
                          : []
                      }
                      onChange={() =>
                        setExpandedYear(expandedYear === index ? null : index)
                      }
                    >
                      {/* Modelos Panel */}
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
                                    name={[modelField.name, "label"]}
                                    rules={validationRules.model}
                                  >
                                    <Input placeholder="Nombre del modelo" />
                                  </Form.Item>
                                  <MinusCircleOutlined
                                    onClick={() => removeModel(modelField.name)}
                                  />
                                </Space>
                              ))}
                              <Button
                                type="dashed"
                                onClick={addModel}
                                block
                                icon={<PlusOutlined />}
                              >
                                Agregar Modelo
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Panel>

                      {/* Transmisiones Panel */}
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
                                    rules={validationRules.select.model}
                                    validateTrigger="onChange"
                                    validator={() =>
                                      validateDependentFields(
                                        form,
                                        index,
                                        "transmissions"
                                      )
                                    }
                                  >
                                    <Select placeholder="Seleccione modelo">
                                      {form
                                        .getFieldValue([
                                          "yearGroups",
                                          field.name,
                                          "models",
                                        ])
                                        ?.map((model: any) => (
                                          <Select.Option
                                            key={model.label}
                                            value={model.label}
                                          >
                                            {model.label}
                                          </Select.Option>
                                        ))}
                                    </Select>
                                  </Form.Item>
                                  <Form.Item
                                    name={[transField.name, "label"]}
                                    rules={validationRules.transmission}
                                  >
                                    <Input placeholder="Nombre de transmisión" />
                                  </Form.Item>
                                  <MinusCircleOutlined
                                    onClick={() => removeTrans(transField.name)}
                                  />
                                </Space>
                              ))}
                              <Button
                                type="dashed"
                                onClick={addTrans}
                                block
                                icon={<PlusOutlined />}
                              >
                                Agregar Transmisión
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Panel>

                      {/* Panel de Combustibles */}
                      <Panel header="Combustibles" key="fuels">
                        <Form.List name={[field.name, "fuels"]}>
                          {(
                            fuelFields,
                            { add: addFuel, remove: removeFuel }
                          ) => (
                            <div className="nested-fields">
                              {fuelFields.map((fuelField) => (
                                <Space key={fuelField.key} align="baseline">
                                  <Form.Item
                                    name={[fuelField.name, "model"]}
                                    rules={validationRules.select.model}
                                    validateTrigger="onChange"
                                    validator={() =>
                                      validateDependentFields(
                                        form,
                                        index,
                                        "fuels"
                                      )
                                    }
                                  >
                                    <Select placeholder="Seleccione modelo">
                                      {form
                                        .getFieldValue([
                                          "yearGroups",
                                          field.name,
                                          "models",
                                        ])
                                        ?.map((model: any) => (
                                          <Select.Option
                                            key={model.label}
                                            value={model.label}
                                          >
                                            {model.label}
                                          </Select.Option>
                                        ))}
                                    </Select>
                                  </Form.Item>

                                  <Form.Item
                                    name={[fuelField.name, "transmission"]}
                                    rules={validationRules.select.transmission}
                                  >
                                    <Select placeholder="Seleccione transmisión">
                                      {form
                                        .getFieldValue([
                                          "yearGroups",
                                          field.name,
                                          "transmissions",
                                        ])
                                        ?.map((trans: any) => (
                                          <Select.Option
                                            key={trans.label}
                                            value={trans.label}
                                          >
                                            {trans.label}
                                          </Select.Option>
                                        ))}
                                    </Select>
                                  </Form.Item>

                                  <Form.Item
                                    name={[fuelField.name, "label"]}
                                    rules={validationRules.fuel}
                                  >
                                    <Input placeholder="Tipo de combustible" />
                                  </Form.Item>

                                  <MinusCircleOutlined
                                    onClick={() => removeFuel(fuelField.name)}
                                  />
                                </Space>
                              ))}
                              <Button
                                type="dashed"
                                onClick={() => addFuel()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Agregar Combustible
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Panel>

                      {/* Panel de Líneas */}
                      <Panel header="Líneas" key="lines">
                        <Form.List name={[field.name, "lines"]}>
                          {(
                            lineFields,
                            { add: addLine, remove: removeLine }
                          ) => (
                            <div className="nested-fields">
                              {lineFields.map((lineField) => (
                                <Space key={lineField.key} align="baseline">
                                  <Form.Item
                                    name={[lineField.name, "model"]}
                                    rules={validationRules.select.model}
                                    validateTrigger="onChange"
                                    validator={() =>
                                      validateDependentFields(
                                        form,
                                        index,
                                        "lines"
                                      )
                                    }
                                  >
                                    <Select placeholder="Seleccione modelo">
                                      {form
                                        .getFieldValue([
                                          "yearGroups",
                                          field.name,
                                          "models",
                                        ])
                                        ?.map((model: any) => (
                                          <Select.Option
                                            key={model.label}
                                            value={model.label}
                                          >
                                            {model.label}
                                          </Select.Option>
                                        ))}
                                    </Select>
                                  </Form.Item>

                                  <Form.Item
                                    name={[lineField.name, "transmission"]}
                                    rules={validationRules.select.transmission}
                                  >
                                    <Select placeholder="Seleccione transmisión">
                                      {form
                                        .getFieldValue([
                                          "yearGroups",
                                          field.name,
                                          "transmissions",
                                        ])
                                        ?.map((trans: any) => (
                                          <Select.Option
                                            key={trans.label}
                                            value={trans.label}
                                          >
                                            {trans.label}
                                          </Select.Option>
                                        ))}
                                    </Select>
                                  </Form.Item>

                                  <Form.Item
                                    name={[lineField.name, "fuel"]}
                                    rules={validationRules.select.fuel}
                                  >
                                    <Select placeholder="Seleccione combustible">
                                      {form
                                        .getFieldValue([
                                          "yearGroups",
                                          field.name,
                                          "fuels",
                                        ])
                                        ?.filter(
                                          (fuel: any) =>
                                            fuel.model ===
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
                                              ])
                                        )
                                        ?.map((fuel: any) => (
                                          <Select.Option
                                            key={fuel.label}
                                            value={fuel.label}
                                          >
                                            {fuel.label}
                                          </Select.Option>
                                        ))}
                                    </Select>
                                  </Form.Item>

                                  <Form.Item
                                    name={[lineField.name, "label"]}
                                    rules={validationRules.line}
                                  >
                                    <Input placeholder="Nombre de la línea" />
                                  </Form.Item>

                                  <MinusCircleOutlined
                                    onClick={() => removeLine(lineField.name)}
                                  />
                                </Space>
                              ))}
                              <Button
                                type="dashed"
                                onClick={() => addLine()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Agregar Línea
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Panel>
                    </Collapse>

                    {fields.length > 1 && (
                      <Button
                        type="link"
                        danger
                        onClick={() => remove(field.name)}
                      >
                        Eliminar año
                      </Button>
                    )}
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  className="add-year-button"
                >
                  Agregar Año
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <div className="form-actions">
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={createFilter.isPending}
            >
              Guardar
            </Button>
            <Button onClick={() => navigate("/filters")}>Cancelar</Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default AddFilters;
