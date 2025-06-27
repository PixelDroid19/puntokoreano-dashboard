import type React from "react";
import { useState } from "react"; // Mantén useState para activeField
import {
  Button,
  Card,
  Col,
  Form, // Importa Form
  Input,
  Row,
  InputNumber,
  Typography,
  Tooltip,
  Badge,
  Divider,
  Tag,
} from "antd";
import {
  FileTextOutlined,
  InfoCircleOutlined,
  EditOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  PlusOutlined,
  DeleteOutlined,
  TagsOutlined,
  DollarOutlined,
  ToolOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react"; // Asumiendo que tienes este icono

const { Title, Text } = Typography;

interface DescriptionInformationProps {
  quillModules: any;
  quillFormats: any;
}

const DescriptionInformation: React.FC<DescriptionInformationProps> = ({
  quillModules,
  quillFormats,
}) => {
  const [activeField, setActiveField] = useState<string | null>(null);
  const formInstance = Form.useFormInstance(); // Obtiene la instancia del formulario

  // Observa el valor de long_description directamente del formulario para la vista previa
  const watchedLongDescription = Form.useWatch(
    "long_description",
    formInstance
  );

  // Animaciones para las tarjetas
  const cardAnimation = {
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

  // Función para renderizar las etiquetas de variantes
  const renderVariantTags = (fields: any[]) => {
    return fields
      .map(({ key, name }) => {
        const variantName = formInstance.getFieldValue([
          "variants",
          name,
          "name",
        ]);
        const variantValue = formInstance.getFieldValue([
          "variants",
          name,
          "value",
        ]);

        if (!variantName || !variantValue) return null;

        return (
          <Tag key={key} color="blue">
            {variantName}: {variantValue}
          </Tag>
        );
      })
      .filter(Boolean);
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Title level={2} className="text-gray-800 m-0">
          Contenido del Producto
        </Title>
      </motion.div>

      <Row gutter={[24, 24]}>
        {/* Columna Izquierda: Descripción */}
        <Col xs={24} lg={16}>
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
                  <FileTextOutlined className="mr-2 text-blue-500" />
                  <span>Descripción del Producto</span>
                </div>
              }
              className="shadow-sm hover:shadow-md transition-all duration-300"
              headStyle={{ borderBottom: "2px solid #f0f0f0" }}
              bodyStyle={{ padding: "24px" }}
              extra={<InfoCircleOutlined className="text-blue-500" />}
            >


              {/* Descripción Detallada con ReactQuill */}
              <div className="mb-4">
                <Badge.Ribbon text="Editor de Contenido" color="blue">
                  <div
                    className={`transition-all duration-200 ${
                      activeField === "long_description"
                        ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                        : ""
                    }`}
                  >
                    <Form.Item
                      name="long_description"
                      label="Descripción Detallada"
                      rules={[{ required: true, message: "La descripción detallada es obligatoria" }]}
                    >
                      <ReactQuill
                        theme="snow"
                        modules={quillModules}
                        formats={quillFormats}
                        style={{ height: "300px" }}
                      />
                    </Form.Item>
                  </div>
                </Badge.Ribbon>
              </div>

              {/* Vista Previa de la Descripción Detallada */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                <Text className="text-gray-500 block text-sm">
                  <InfoCircleOutlined className="mr-1" />
                  Vista previa del contenido:{" "}
                  {watchedLongDescription &&
                  watchedLongDescription !== "<p><br></p>" &&
                  watchedLongDescription !== "<p></p>"
                    ? "Contenido listo"
                    : "Sin contenido"}
                </Text>
                {watchedLongDescription &&
                watchedLongDescription !== "<p><br></p>" &&
                watchedLongDescription !== "<p></p>" ? (
                  <div className="mt-2 p-3 bg-white rounded border border-gray-200 max-h-32 overflow-auto">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: watchedLongDescription,
                      }}
                    />
                  </div>
                ) : (
                  <Text className="text-gray-400 italic block mt-2">
                    El contenido HTML enriquecido aparecerá aquí...
                  </Text>
                )}
              </div>

              {/* Garantía */}
              <Row gutter={16}>
                <Col span={12}>
                  <div
                    className={`transition-all duration-200 ${
                      activeField === "warranty"
                        ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                        : ""
                    }`}
                  >
                    <Form.Item
                      name="warranty"
                      label={
                        <div className="flex items-center">
                          <ShieldCheck className="mr-1 text-green-600 h-4 w-4" />{" "}
                          {/* Ajusta tamaño si es necesario */}
                          <span>Garantía</span>
                        </div>
                      }
                    >
                      <Input
                        placeholder="Ej: 1 año de garantía"
                        className="rounded-lg"
                        onFocus={() => setActiveField("warranty")}
                        onBlur={() => setActiveField(null)}
                      />
                    </Form.Item>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    className={`transition-all duration-200 ${
                      activeField === "warrantyMonths"
                        ? "bg-blue-50 -mx-2 px-2 py-1 rounded-md"
                        : ""
                    }`}
                  >
                    <Form.Item
                      name="warrantyMonths"
                      label={
                        <div className="flex items-center">
                          <ClockCircleOutlined className="mr-1 text-orange-500" />
                          <span>Meses de Garantía</span>
                        </div>
                      }
                    >
                      <InputNumber
                        min={0}
                        placeholder="Ej: 12"
                        className="w-full rounded-lg"
                        onFocus={() => setActiveField("warrantyMonths")}
                        onBlur={() => setActiveField(null)}
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Card>
          </motion.div>
        </Col>

        {/* Columna Derecha: Especificaciones */}
        <Col xs={24} lg={8}>
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
                  <ToolOutlined className="mr-2 text-purple-500" />
                  <span>Especificaciones Técnicas</span>
                </div>
              }
              className="shadow-sm hover:shadow-md transition-all duration-300"
              headStyle={{ borderBottom: "2px solid #f0f0f0" }}
              bodyStyle={{ padding: "24px" }}
              extra={<SettingOutlined className="text-purple-500" />}
            >
              <Form.List name="specifications">
                {(fields, { add, remove }) => (
                  <>
                    {fields.length === 0 ? (
                      <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-4">
                        <AppstoreOutlined
                          style={{ fontSize: 24 }}
                          className="text-gray-400 mb-2"
                        />
                        <Text className="block text-gray-500">
                          Agrega especificaciones técnicas para tu producto
                        </Text>
                      </div>
                    ) : (
                      <div className="mb-4 max-h-80 overflow-auto pr-2">
                        {fields.map(({ key, name, ...restField }) => (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <Badge
                                count={name + 1}
                                style={{ backgroundColor: "#722ed1" }}
                              />
                              <Button
                                onClick={() => remove(name)}
                                danger
                                type="link"
                                icon={<DeleteOutlined />}
                                size="small"
                              >
                                Eliminar
                              </Button>
                            </div>

                            <Form.Item
                              {...restField}
                              name={[name, "key"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Ingrese la característica",
                                },
                              ]}
                              className="mb-2"
                            >
                              <Input
                                placeholder="Característica (ej: Material)"
                                prefix={
                                  <SettingOutlined className="text-gray-400" />
                                }
                                className="rounded-lg"
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "value"]}
                              rules={[
                                { required: true, message: "Ingrese el valor" },
                              ]}
                              className="mb-0"
                            >
                              <Input
                                placeholder="Valor (ej: Aluminio)"
                                prefix={
                                  <InfoCircleOutlined className="text-gray-400" />
                                }
                                className="rounded-lg"
                              />
                            </Form.Item>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      className="rounded-lg"
                    >
                      Agregar Especificación
                    </Button>
                  </>
                )}
              </Form.List>

              <Divider className="my-4" />

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <Text className="text-blue-700 block font-medium mb-1">
                  <InfoCircleOutlined className="mr-1" /> Consejos
                </Text>
                <Text className="text-blue-600 text-sm block">
                  Las especificaciones técnicas ayudan a los clientes a comparar
                  productos y tomar decisiones informadas.
                </Text>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Columna Completa Inferior: Variantes */}
        <Col xs={24}>
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
                  <TagsOutlined className="mr-2 text-green-500" />
                  <span>Variantes del Producto</span>
                </div>
              }
              className="shadow-sm hover:shadow-md transition-all duration-300"
              headStyle={{ borderBottom: "2px solid #f0f0f0" }}
              bodyStyle={{ padding: "24px" }}
              extra={<InfoCircleOutlined className="text-green-500" />}
            >
              <Form.List name="variants">
                {(fields, { add, remove }) => (
                  <>
                    {fields.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-4">
                        <TagsOutlined
                          style={{ fontSize: 24 }}
                          className="text-gray-400 mb-2"
                        />
                        <Text className="block text-gray-500 mb-1">
                          No hay variantes configuradas
                        </Text>
                        <Text className="block text-gray-400 text-sm">
                          Agrega variantes como color, tamaño, etc.
                        </Text>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <Row gutter={[16, 16]} className="mb-2">
                          <Col span={8}>
                            <Text strong className="text-gray-600">
                              Nombre de la Variante
                            </Text>
                          </Col>
                          <Col span={8}>
                            <Text strong className="text-gray-600">
                              Valor
                            </Text>
                          </Col>
                          <Col span={6}>
                            <Text strong className="text-gray-600">
                              Precio
                            </Text>
                          </Col>
                          <Col span={2}></Col>
                        </Row>

                        {fields.map(({ key, name, ...restField }) => (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-2"
                          >
                            <Row
                              gutter={16}
                              align="middle"
                              className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                            >
                              <Col span={8}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "name"]}
                                  rules={[
                                    { required: true, message: "Requerido" },
                                  ]}
                                  className="mb-0"
                                >
                                  <Input
                                    placeholder="Ej: Color"
                                    prefix={
                                      <TagsOutlined className="text-gray-400" />
                                    }
                                    className="rounded-lg"
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "value"]}
                                  rules={[
                                    { required: true, message: "Requerido" },
                                  ]}
                                  className="mb-0"
                                >
                                  <Input
                                    placeholder="Ej: Rojo"
                                    className="rounded-lg"
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={6}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "price"]}
                                  rules={[
                                    { required: true, message: "Requerido" },
                                  ]}
                                  className="mb-0"
                                >
                                  <InputNumber
                                    placeholder="Precio"
                                    min={0}
                                    className="w-full rounded-lg"
                                    formatter={(value) =>
                                      `$ ${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                      )
                                    }
                                    parser={(value) =>
                                      parseFloat(value!.replace(/\$\s?|(,*)/g, "")) as any
                                    }
                                    prefix={
                                      <DollarOutlined className="text-gray-400" />
                                    }
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={2} className="text-right">
                                <Button
                                  onClick={() => remove(name)}
                                  danger
                                  type="text"
                                  icon={<DeleteOutlined />}
                                />
                              </Col>
                            </Row>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      className="rounded-lg"
                    >
                      Agregar Variante
                    </Button>

                    {fields.length > 0 && (
                      <div className="mt-4">
                        <Text className="text-gray-500 text-sm">
                          Variantes configuradas: {fields.length}
                        </Text>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {renderVariantTags(fields)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Form.List>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default DescriptionInformation;
