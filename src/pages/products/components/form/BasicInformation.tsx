import type React from "react";
import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  DatePicker,
  Typography,
  Badge,
  Tooltip,
  Divider,
  notification,
} from "antd";
import {
  TagOutlined,
  DollarOutlined,
  BarcodeOutlined,
  InboxOutlined,
  PercentageOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  TagsOutlined,
  CarOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { motion, useReducedMotion } from "framer-motion";
import VehicleSelector from "../../../vehicle-manager/selectors/vehicle-selector";

const { Title, Text } = Typography;

interface BasicInformationProps {
  form: any;
  groups: any;
  subgroups: any;
  handleGroupChange: (value: string) => void;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  form,
  groups,
  subgroups,
  handleGroupChange,
}) => {
  const [activeField, setActiveField] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const cardAnimation = prefersReducedMotion
    ? { visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 10 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.05,
            duration: 0.3,
            ease: "easeOut",
          },
        }),
      };

  const renderFieldHelp = (title: string, content: string) => (
    <Tooltip title={content}>
      <QuestionCircleOutlined className="text-blue-500 ml-1 cursor-pointer hover:text-blue-700 transition-colors" />
    </Tooltip>
  );

  // Valores observados del formulario
  const watchedName = Form.useWatch("name", form);
  const watchedPrice = Form.useWatch("price", form);
  const watchedCode = Form.useWatch("code", form);
  const watchedStock = Form.useWatch("stock", form);
  const watchedActive = Form.useWatch("active", form);
  const watchedGroup = Form.useWatch("group", form);
  const watchedCompatibleVehicles = Form.useWatch("compatible_vehicles", form);
  const watchedDiscount = Form.useWatch("discount", form);


  return (
    <div className="p-6 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Title level={2} className="text-gray-800 m-0">
          Información del Producto
        </Title>
      </motion.div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardAnimation}
            layout
          >
            <Card
              title={
                <div className="flex items-center">
                  <TagOutlined className="mr-2 text-blue-500" />
                  <span>Detalles Principales</span>
                </div>
              }
              className="shadow-sm hover:shadow-md transition-all duration-300"
              headStyle={{ borderBottom: "2px solid #f0f0f0" }}
              bodyStyle={{ padding: "24px" }}
              extra={<InfoCircleOutlined className="text-blue-500" />}
            >
              <div
                className={`transition-all duration-200 ${
                  activeField === "name"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name="name"
                  label={
                    <div className="flex items-center">
                      <span>Nombre del Producto</span>
                      {renderFieldHelp(
                        "Nombre del Producto",
                        "Ingrese un nombre descriptivo y claro que ayude a los clientes a identificar el producto fácilmente."
                      )}
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Por favor ingrese el nombre del producto",
                    },
                  ]}
                >
                  <Input
                    placeholder="Ej: Reten delantero ciguenal"
                    className="rounded-lg"
                    size="large"
                    onFocus={() => setActiveField("name")}
                    onBlur={() => setActiveField(null)}
                    suffix={
                      watchedName ? (
                        <CheckCircleOutlined className="text-green-500" />
                      ) : (
                        <CloseCircleOutlined className="text-gray-300" />
                      )
                    }
                  />
                </Form.Item>
              </div>

              <div
                className={`transition-all duration-200 ${
                  activeField === "price"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name="price"
                  label={
                    <div className="flex items-center">
                      <DollarOutlined className="mr-1 text-green-600" />
                      <span>Precio</span>
                      {renderFieldHelp(
                        "Precio",
                        "Precio del producto. Debe ser un número válido no negativo."
                      )}
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Por favor ingrese el precio",
                    },
                    {
                      type: "number",
                      min: 0,
                      message: "El precio debe ser un número no negativo",
                    },
                  ]}
                >
                  <InputNumber
                    className="w-full rounded-lg"
                    min={0}
                    size="large"
                    formatter={(value) =>
                      `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                    onFocus={() => setActiveField("price")}
                    onBlur={() => setActiveField(null)}
                  />
                </Form.Item>
              </div>

              <div
                className={`transition-all duration-200 ${
                  activeField === "code"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name="code"
                  label={
                    <div className="flex items-center">
                      <BarcodeOutlined className="mr-1 text-gray-600" />
                      <span>SKU/Código</span>
                      {renderFieldHelp(
                        "SKU/Código",
                        "Código único para identificar el producto en su inventario. Debe ser único para cada producto."
                      )}
                    </div>
                  }
                  rules={[
                    { required: true, message: "Por favor ingrese el código" },
                  ]}
                >
                  <Input
                    className="rounded-lg"
                    size="large"
                    onFocus={() => setActiveField("code")}
                    onBlur={() => setActiveField(null)}
                  />
                </Form.Item>
              </div>

              <div
                className={`transition-all duration-200 ${
                  activeField === "stock"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name="stock"
                  label={
                    <div className="flex items-center">
                      <InboxOutlined className="mr-1 text-orange-500" />
                      <span>Stock Inicial</span>
                      {renderFieldHelp(
                        "Stock Inicial",
                        "Cantidad de unidades disponibles para la venta. Debe ser un número entero no negativo."
                      )}
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Por favor ingrese el stock",
                    },
                    {
                      type: "number",
                      min: 0,
                      integer: true,
                      message: "El stock debe ser un número entero no negativo",
                    },
                  ]}
                >
                  <InputNumber
                    className="w-full rounded-lg"
                    min={0}
                    precision={0}
                    size="large"
                    onFocus={() => setActiveField("stock")}
                    onBlur={() => setActiveField(null)}
                  />
                </Form.Item>
              </div>

              <div
                className={`transition-all duration-200 ${
                  activeField === "reservedStock"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name="reservedStock"
                  label={
                    <div className="flex items-center">
                      <InboxOutlined className="mr-1 text-yellow-500" />
                      <span>Stock Reservado</span>
                      {renderFieldHelp(
                        "Stock Reservado",
                        "Cantidad de unidades reservadas. Debe ser un número entero no negativo y no puede exceder el stock total."
                      )}
                    </div>
                  }
                  rules={[
                    {
                      type: "number",
                      min: 0,
                      integer: true,
                      message:
                        "El stock reservado debe ser un número entero no negativo",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("stock") >= value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "El stock reservado no puede exceder el stock total"
                          )
                        );
                      },
                    }),
                  ]}
                  initialValue={0}
                >
                  <InputNumber
                    className="w-full rounded-lg"
                    min={0}
                    precision={0}
                    size="large"
                    onFocus={() => setActiveField("reservedStock")}
                    onBlur={() => setActiveField(null)}
                  />
                </Form.Item>
              </div>

              <div
                className={`transition-all duration-200 ${
                  activeField === "active"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name="active"
                  label={
                    <div className="flex items-center">
                      <span>Estado</span>
                      {renderFieldHelp(
                        "Estado del Producto",
                        "Activa o desactiva la visibilidad del producto en la tienda. Los productos inactivos no serán visibles para los clientes."
                      )}
                    </div>
                  }
                  valuePropName="checked"
                  className="mb-0"
                  initialValue={true}
                >
                  <div className="flex items-center">
                    <Switch
                      checked={watchedActive}
                      checkedChildren="Activo"
                      unCheckedChildren="Inactivo"
                      className="bg-gray-300"
                      onChange={(checked) => {
                        form.setFieldValue("active", checked);

                        notification.info({
                          message: checked
                            ? "Producto Activado"
                            : "Producto Desactivado",
                          description: checked
                            ? "El producto será visible en la tienda."
                            : "El producto no será visible en la tienda.",
                          placement: "bottomRight",
                          icon: checked ? (
                            <CheckCircleOutlined style={{ color: "#52c41a" }} />
                          ) : (
                            <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                          ),
                        });
                      }}
                    />
                    <Text className="ml-2 text-sm text-gray-500">
                      {watchedActive
                        ? "El producto estará visible en la tienda"
                        : "El producto no será visible en la tienda"}
                    </Text>
                  </div>
                </Form.Item>
              </div>
            </Card>
          </motion.div>

          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardAnimation}
            layout
          >
            <Card
              title={
                <div className="flex items-center">
                  <PercentageOutlined className="mr-2 text-red-500" />
                  <span>Información de Descuento</span>
                </div>
              }
              className="shadow-sm hover:shadow-md transition-all duration-300 mt-6"
              headStyle={{ borderBottom: "2px solid #f0f0f0" }}
              bodyStyle={{ padding: "24px" }}
              extra={<InfoCircleOutlined className="text-red-500" />}
            >
              <div
                className={`transition-all duration-200 ${
                  activeField === "discount_isActive"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name={["discount", "isActive"]}
                  label={
                    <div className="flex items-center">
                      <span>Descuento Activo</span>
                      {renderFieldHelp(
                        "Descuento Activo",
                        "Active esta opción para aplicar un descuento al producto. Deberá especificar el tipo y porcentaje del descuento."
                      )}
                    </div>
                  }
                  valuePropName="checked"
                  initialValue={false}
                >
                  <div className="flex items-center">
                    <Switch
                      checkedChildren="Activo"
                      unCheckedChildren="Inactivo"
                      className="bg-gray-300"
                      onChange={(checked) => {
                        form.setFieldsValue({
                          discount: {
                            ...form.getFieldValue("discount"),
                            isActive: checked,
                          },
                        });

                        if (checked) {
                          notification.success({
                            message: "Descuento Activado",
                            description:
                              "No olvide configurar el porcentaje y tipo de descuento.",
                            placement: "bottomRight",
                          });
                        } else {
                          notification.info({
                            message: "Descuento Desactivado",
                            description:
                              "El descuento ya no se aplicará a este producto.",
                            placement: "bottomRight",
                          });
                        }
                      }}
                      onFocus={() => setActiveField("discount_isActive")}
                      onBlur={() => setActiveField(null)}
                    />
                    {watchedDiscount?.isActive && (
                      <Badge
                        count="OFERTA"
                        className="ml-3"
                        style={{ backgroundColor: "#ff4d4f" }}
                      />
                    )}
                  </div>
                </Form.Item>
              </div>

              <div
                className={`transition-all duration-200 ${
                  activeField === "discount_type"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name={["discount", "type"]}
                  label={
                    <div className="flex items-center">
                      <span>Tipo de Descuento</span>
                      {renderFieldHelp(
                        "Tipo de Descuento",
                        "Permanente: El descuento se aplica indefinidamente. Temporal: El descuento se aplica solo durante un período específico."
                      )}
                    </div>
                  }
                  className={!watchedDiscount?.isActive ? "opacity-50" : ""}
                  initialValue="permanent"
                  rules={
                    watchedDiscount?.isActive
                      ? [
                          {
                            required: true,
                            message: "Seleccione el tipo de descuento",
                          },
                        ]
                      : []
                  }
                >
                  <Select
                    className="rounded-lg"
                    size="large"
                    disabled={!watchedDiscount?.isActive}
                    options={[
                      { label: "Permanente", value: "permanent" },
                      { label: "Temporal", value: "temporary" },
                    ]}
                    onFocus={() => setActiveField("discount_type")}
                    onBlur={() => setActiveField(null)}
                    onChange={(value) => {
                      form.setFieldsValue({
                        discount: {
                          ...form.getFieldValue("discount"),
                          type: value,
                          startDate:
                            value === "permanent"
                              ? undefined
                              : form.getFieldValue(["discount", "startDate"]),
                          endDate:
                            value === "permanent"
                              ? undefined
                              : form.getFieldValue(["discount", "endDate"]),
                        },
                      });
                    }}
                  />
                </Form.Item>
              </div>

              <div
                className={`transition-all duration-200 ${
                  activeField === "discount_percentage"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name={["discount", "percentage"]}
                  label={
                    <div className="flex items-center">
                      <span>Porcentaje de Descuento</span>
                      {renderFieldHelp(
                        "Porcentaje de Descuento",
                        "Porcentaje que se descontará del precio original. Debe ser un número mayor que 0 y menor o igual a 100."
                      )}
                    </div>
                  }
                  className={!watchedDiscount?.isActive ? "opacity-50" : ""}
                  rules={
                    watchedDiscount?.isActive
                      ? [
                          { required: true, message: "Ingrese el porcentaje" },
                          {
                            type: "number",
                            min: 0.01,
                            max: 100,
                            message:
                              "El porcentaje debe estar entre 0.01 y 100",
                          },
                        ]
                      : []
                  }
                >
                  <InputNumber
                    className="w-full rounded-lg"
                    min={0.01}
                    max={100}
                    size="large"
                    disabled={!watchedDiscount?.isActive}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value!.replace("%", "")}
                    onFocus={() => setActiveField("discount_percentage")}
                    onBlur={() => setActiveField(null)}
                    onChange={(value) => {
                      if (value && value > 30) {
                        notification.warning({
                          message: "Descuento Alto",
                          description:
                            "Has configurado un descuento superior al 30%. Verifica que sea correcto.",
                          placement: "bottomRight",
                        });
                      }
                    }}
                  />
                </Form.Item>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <div
                    className={`transition-all duration-200 ${
                      activeField === "discount_startDate"
                        ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                        : ""
                    }`}
                  >
                    <Form.Item
                      name={["discount", "startDate"]}
                      label={
                        <div className="flex items-center">
                          <CalendarOutlined className="mr-1 text-blue-500" />
                          <span>Fecha de Inicio</span>
                        </div>
                      }
                      className={
                        !watchedDiscount?.isActive ||
                        watchedDiscount?.type !== "temporary"
                          ? "opacity-50"
                          : ""
                      }
                      rules={
                        watchedDiscount?.isActive &&
                        watchedDiscount?.type === "temporary"
                          ? [
                              {
                                required: true,
                                message: "Ingrese fecha inicio",
                              },
                            ]
                          : []
                      }
                    >
                      <DatePicker
                        className="w-full rounded-lg"
                        size="large"
                        disabled={
                          !watchedDiscount?.isActive ||
                          watchedDiscount?.type !== "temporary"
                        }
                        placeholder="Seleccionar fecha"
                        onFocus={() => setActiveField("discount_startDate")}
                        onBlur={() => setActiveField(null)}
                      />
                    </Form.Item>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    className={`transition-all duration-200 ${
                      activeField === "discount_endDate"
                        ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                        : ""
                    }`}
                  >
                    <Form.Item
                      name={["discount", "endDate"]}
                      label={
                        <div className="flex items-center">
                          <CalendarOutlined className="mr-1 text-red-500" />
                          <span>Fecha de Fin</span>
                        </div>
                      }
                      className={
                        !watchedDiscount?.isActive ||
                        watchedDiscount?.type !== "temporary"
                          ? "opacity-50"
                          : ""
                      }
                      rules={[
                        {
                          required:
                            watchedDiscount?.isActive &&
                            watchedDiscount?.type === "temporary",
                          message: "Ingrese fecha fin",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              !watchedDiscount?.isActive ||
                              watchedDiscount?.type !== "temporary"
                            ) {
                              return Promise.resolve();
                            }
                            const startDate = getFieldValue([
                              "discount",
                              "startDate",
                            ]);
                            if (!value || !startDate || value > startDate) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "La fecha de fin debe ser posterior a la fecha de inicio"
                              )
                            );
                          },
                        }),
                      ]}
                    >
                      <DatePicker
                        className="w-full rounded-lg"
                        size="large"
                        disabled={
                          !watchedDiscount?.isActive ||
                          watchedDiscount?.type !== "temporary"
                        }
                        placeholder="Seleccionar fecha"
                        onFocus={() => setActiveField("discount_endDate")}
                        onBlur={() => setActiveField(null)}
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={12}>
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cardAnimation}
            layout
          >
            <Card
              title={
                <div className="flex items-center">
                  <AppstoreOutlined className="mr-2 text-purple-500" />
                  <span>Categorización</span>
                </div>
              }
              className="shadow-sm hover:shadow-md transition-all duration-300"
              headStyle={{ borderBottom: "2px solid #f0f0f0" }}
              bodyStyle={{ padding: "24px" }}
              extra={<InfoCircleOutlined className="text-purple-500" />}
            >
              <div
                className={`transition-all duration-200 ${
                  activeField === "group"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name="group"
                  label={
                    <div className="flex items-center">
                      <TagsOutlined className="mr-1 text-blue-500" />
                      <span>Grupo</span>
                      {renderFieldHelp(
                        "Grupo",
                        "Categoría principal del producto. La selección de un grupo determinará qué subgrupos estarán disponibles."
                      )}
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Por favor seleccione un grupo",
                    },
                  ]}
                >
                  <Select
                    placeholder="Seleccione un grupo"
                    onChange={(value) => {
                      handleGroupChange(value);
                      notification.info({
                        message: "Grupo Seleccionado",
                        description:
                          "Los subgrupos disponibles han sido actualizados.",
                        placement: "bottomRight",
                      });
                    }}
                    className="rounded-lg"
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    options={groups?.data?.groups?.map((group: any) => ({
                      label: group.name,
                      value: group.name,
                    }))}
                    onFocus={() => setActiveField("group")}
                    onBlur={() => setActiveField(null)}
                  />
                </Form.Item>
              </div>

              <div
                className={`transition-all duration-200 ${
                  activeField === "subgroup"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name="subgroup"
                  label={
                    <div className="flex items-center">
                      <TagsOutlined className="mr-1 text-green-500" />
                      <span>Subgrupo</span>
                      {renderFieldHelp(
                        "Subgrupo",
                        "Subcategoría del producto. Primero debe seleccionar un grupo para ver los subgrupos disponibles."
                      )}
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Por favor seleccione un subgrupo",
                    },
                  ]}
                >
                  <Select
                    placeholder="Seleccione un subgrupo"
                    disabled={!watchedGroup}
                    className="rounded-lg"
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    options={subgroups?.map((sg: any) => ({
                      label: sg.name,
                      value: sg.name,
                    }))}
                    notFoundContent={
                      !watchedGroup
                        ? "Seleccione un grupo primero"
                        : "No hay subgrupos disponibles"
                    }
                    onFocus={() => setActiveField("subgroup")}
                    onBlur={() => setActiveField(null)}
                  />
                </Form.Item>
              </div>

              <div
                className={`transition-all duration-200 ${
                  activeField === "shipping"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name="shipping"
                  label={
                    <div className="flex items-center">
                      <CarOutlined className="mr-1 text-orange-500" />
                      <span>Métodos de Envío</span>
                      {renderFieldHelp(
                        "Métodos de Envío",
                        "Seleccione todos los métodos de envío disponibles para este producto. Puede seleccionar múltiples opciones."
                      )}
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message:
                        "Por favor seleccione al menos un método de envío",
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Seleccione los métodos de envío"
                    className="rounded-lg"
                    size="large"
                    options={[
                      { label: "Envío Estándar", value: "standard" },
                      { label: "Envío Express", value: "express" },
                      { label: "Recogida en Tienda", value: "pickup" },
                    ]}
                    tagRender={(props) => (
                      <Badge
                        count={props.label}
                        style={{
                          backgroundColor:
                            props.value === "standard"
                              ? "#52c41a"
                              : props.value === "express"
                              ? "#1890ff"
                              : "#722ed1",
                        }}
                      />
                    )}
                    onFocus={() => setActiveField("shipping")}
                    onBlur={() => setActiveField(null)}
                  />
                </Form.Item>
              </div>

              <Divider className="my-4" />

              <div
                className={`transition-all duration-200 ${
                  activeField === "compatible_vehicles"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name="compatible_vehicles"
                  label={
                    <div className="flex items-center">
                      <CarOutlined className="mr-1 text-blue-600" />
                      <span>Vehículos Compatibles / Aplicaciones </span>
                      {renderFieldHelp(
                        "Vehículos Compatibles",
                        "Seleccione los vehículos con los que este producto es compatible. Los IDs se guardarán para el backend."
                      )}
                    </div>
                  }
                >
                  <VehicleSelector
                    isMulti={true}
                    placeholder="Buscar vehículos compatibles..."
                    onFocus={() => setActiveField("compatible_vehicles")}
                    onBlur={() => setActiveField(null)}
                    // onChange={handleVehicleChange}
                  />
                </Form.Item>
              </div>

              <div
                className={`transition-all duration-200 ${
                  activeField === "short_description"
                    ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                    : ""
                }`}
              >
                <Form.Item
                  name="short_description"
                  label={
                    <div className="flex items-center">
                      <span>Descripción Corta</span>
                      {renderFieldHelp(
                        "Descripción Corta",
                        "Breve descripción del producto que aparecerá en listados y búsquedas."
                      )}
                    </div>
                  }
                >
                  <Input.TextArea
                    className="rounded-lg"
                    rows={2}
                    placeholder="Descripción breve del producto..."
                    onFocus={() => setActiveField("short_description")}
                    onBlur={() => setActiveField(null)}
                  />
                </Form.Item>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="bg-blue-50 p-4 rounded-lg mt-6 border border-blue-100"
              >
                <Title
                  level={5}
                  className="text-blue-700 mb-2 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Información Adicional
                </Title>
                <Text className="text-blue-600 block mb-2">
                  La correcta categorización del producto mejora su visibilidad
                  en búsquedas y filtros.
                </Text>
                <Text className="text-blue-600">
                  Asegúrese de seleccionar todos los vehículos compatibles para
                  mejorar la experiencia de búsqueda de los clientes.
                </Text>
              </motion.div>
            </Card>
          </motion.div>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={cardAnimation}
            layout
          >
            <Card
              className="shadow-sm hover:shadow-md transition-all duration-300 mt-6 bg-gradient-to-r from-purple-50 to-blue-50"
              bodyStyle={{ padding: "24px" }}
              bordered={false}
            >
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="m-0 text-gray-700">
                  Vista Previa
                </Title>
                <Badge
                  count="En tiempo real"
                  style={{ backgroundColor: "#722ed1" }}
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-200 hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <Text strong className="text-lg block">
                      {watchedName || "Nombre del Producto"}
                    </Text>
                    <Text className="text-gray-500 block">
                      SKU: {watchedCode || "XXXXX"}
                    </Text>
                    {watchedCompatibleVehicles &&
                      watchedCompatibleVehicles.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Badge
                            count={`Compatible con ${watchedCompatibleVehicles.length} vehículo(s)`}
                            style={{ backgroundColor: "#1890ff" }}
                            className="mt-2"
                          />
                        </motion.div>
                      )}
                  </div>
                  <div className="text-right">
                    {watchedDiscount?.isActive &&
                    watchedDiscount?.percentage > 0 ? (
                      <>
                        <Text delete className="text-gray-500 block">
                          ${watchedPrice || "0.00"}
                        </Text>
                        <Text className="text-red-500 text-xl font-bold block">
                          $
                          {watchedPrice && watchedDiscount?.percentage
                            ? (
                                Number(watchedPrice) *
                                (1 - Number(watchedDiscount.percentage) / 100)
                              ).toFixed(2)
                            : "0.00"}
                        </Text>
                        <Badge
                          count={`${watchedDiscount?.percentage || 0}% OFF`}
                          style={{ backgroundColor: "#ff4d4f" }}
                        />
                      </>
                    ) : (
                      <Text className="text-xl font-bold block">
                        ${watchedPrice || "0.00"}
                      </Text>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center">
                  <Badge
                    status={watchedActive ? "success" : "default"}
                    text={watchedActive ? "Activo" : "Inactivo"}
                    className="mr-4"
                  />
                  <Badge
                    status="processing"
                    text={`Stock: ${watchedStock || "0"}`}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default BasicInformation;
