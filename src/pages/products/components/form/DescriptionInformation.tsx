import React from 'react';
import { Button, Card, Col, Form, Input, Row, Space } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface DescriptionInformationProps {
  quillModules: any;
  quillFormats: any;
}

const DescriptionInformation: React.FC<DescriptionInformationProps> = ({
  quillModules,
  quillFormats,
}) => {
  return (
    <Row gutter={24}>
      <Col span={24}>
        <Card title="Descripción del Producto">
          <Form.Item
            name="short_description"
            label="Descripción Corta"
            rules={[{ required: true, max: 150 }]}
            extra="Máximo 150 caracteres. Esta descripción aparecerá en las vistas previas del producto."
          >
            <Input.TextArea maxLength={150} showCount rows={3} />
          </Form.Item>

          <Form.Item
            name="long_description"
            label="Descripción Detallada"
            rules={[{ required: true }]}
          >
            <ReactQuill
              theme="snow"
              modules={quillModules}
              formats={quillFormats}
              style={{ height: "300px" }}
            />
          </Form.Item>
        </Card>

        <Card title="Especificaciones Técnicas" className="mt-4">
          <Form.List name="specifications">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "key"]}
                      rules={[
                        {
                          required: true,
                          message: "Ingrese la característica",
                        },
                      ]}
                    >
                      <Input placeholder="Característica" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "value"]}
                      rules={[
                        { required: true, message: "Ingrese el valor" },
                      ]}
                    >
                      <Input placeholder="Valor" />
                    </Form.Item>
                    <Button
                      onClick={() => remove(name)}
                      type="text"
                      danger
                    >
                      Eliminar
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  Agregar Especificación
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      </Col>
    </Row>
  );
};

export default DescriptionInformation;