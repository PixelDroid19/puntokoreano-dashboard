import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Slider,
  Select,
  Switch,
  Divider,
  Card,
  Row,
  Col,
  Typography,
  Alert,
  Button,
  Space,
  notification,
  Spin,
} from 'antd';
import {
  SettingOutlined,
  PictureOutlined,
  CompressOutlined,
  ScissorOutlined,
  FileImageOutlined,
  LinkOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import StorageService from '../../../services/storage.service';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface OptimizationConfig {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format: 'webp' | 'jpeg' | 'png' | 'auto';
  enableResize: boolean;
  enableCompression: boolean;
  generateHash: boolean;
  seoFriendlyNames: boolean;
}

interface OptimizationConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

const OptimizationConfigModal: React.FC<OptimizationConfigModalProps> = ({
  visible,
  onClose,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Consulta para obtener la configuración actual
  const { data: configData, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['optimizationConfig'],
    queryFn: () => StorageService.getOptimizationConfig(),
    enabled: visible,
  });

  // Mutación para actualizar la configuración
  const updateConfigMutation = useMutation({
    mutationFn: (config: Partial<OptimizationConfig>) =>
      StorageService.updateOptimizationConfig(config),
    onSuccess: (response) => {
      notification.success({
        message: 'Configuración actualizada',
        description: 'Los parámetros de optimización se han guardado correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['optimizationConfig'] });
      onClose();
    },
    onError: (error: any) => {
      notification.error({
        message: 'Error al actualizar configuración',
        description: error.response?.data?.message || 'Ocurrió un error inesperado',
      });
    },
  });

  // Efectos para sincronizar formulario con datos
  useEffect(() => {
    if (configData?.data?.currentConfig && visible) {
      form.setFieldsValue(configData.data.currentConfig);
    }
  }, [configData, visible, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await updateConfigMutation.mutateAsync(values);
    } catch (error) {
      console.error('Error validating form:', error);
    }
  };

  const handleReset = () => {
    const defaultConfig = {
      quality: 75,
      maxWidth: 1280,
      maxHeight: 1280,
      format: 'webp',
      enableResize: true,
      enableCompression: true,
      generateHash: true,
      seoFriendlyNames: true,
    };
    form.setFieldsValue(defaultConfig);
  };

  const getQualityDescription = (quality: number) => {
    if (quality <= 60) return 'Máxima compresión - Ideal para miniaturas';
    if (quality <= 80) return 'Balance recomendado - Buena calidad y tamaño';
    return 'Alta calidad - Para imágenes destacadas';
  };

  const getFormatDescription = (format: string) => {
    const descriptions = {
      webp: 'Mejor compresión (-25% vs JPEG), recomendado para SEO',
      jpeg: 'Universal, mejor para fotografías sin transparencia',
      png: 'Necesario para transparencias o gráficos simples',
      auto: 'Selección automática según contenido de la imagen',
    };
    return descriptions[format as keyof typeof descriptions] || '';
  };

  const currentQuality = Form.useWatch('quality', form) || 75;
  const currentFormat = Form.useWatch('format', form) || 'webp';

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <SettingOutlined className="text-blue-500" />
          <span>Configuración de Optimización de Imágenes</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={
        <Space>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleReset}>Restablecer</Button>
          <Button
            type="primary"
            loading={updateConfigMutation.isPending}
            onClick={handleSave}
          >
            Guardar Configuración
          </Button>
        </Space>
      }
      className="optimization-config-modal"
    >
      <Spin spinning={isLoadingConfig}>
        <div className="space-y-6">
          {/* Información */}
          <Alert
            message="Configuración Global de Optimización"
            description="Estos parámetros se aplicarán automáticamente a todas las imágenes que se suban al sistema"
            type="info"
            showIcon
          />

          <Form form={form} layout="vertical" className="space-y-6">
            {/* Compresión */}
            <Card size="small" className="border-l-4 border-l-blue-500">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="flex items-center gap-2 mb-4">
                    <CompressOutlined className="text-blue-500 text-lg" />
                    <Title level={5} className="m-0">Compresión</Title>
                  </div>
                </Col>
                
                <Col span={16}>
                  <Form.Item
                    name="quality"
                    label="Calidad de Compresión"
                    rules={[{ required: true, message: 'La calidad es requerida' }]}
                  >
                    <Slider
                      min={1}
                      max={100}
                      marks={{
                        1: '1%',
                        25: '25%',
                        50: '50%',
                        75: '75%',
                        100: '100%',
                      }}
                      tooltip={{ formatter: (value) => `${value}%` }}
                    />
                  </Form.Item>
                  <Text type="secondary" className="text-sm">
                    {getQualityDescription(currentQuality)}
                  </Text>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="enableCompression"
                    label="Habilitar Compresión"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Redimensionamiento */}
            <Card size="small" className="border-l-4 border-l-green-500">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="flex items-center gap-2 mb-4">
                    <ScissorOutlined className="text-green-500 text-lg" />
                    <Title level={5} className="m-0">Redimensionamiento</Title>
                  </div>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="maxWidth"
                    label="Ancho Máximo (px)"
                    rules={[
                      { required: true, message: 'El ancho es requerido' },
                      { type: 'number', min: 100, max: 4000, message: 'Entre 100 y 4000px' },
                    ]}
                  >
                    <Slider min={100} max={4000} step={50} />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="maxHeight"
                    label="Alto Máximo (px)"
                    rules={[
                      { required: true, message: 'La altura es requerida' },
                      { type: 'number', min: 100, max: 4000, message: 'Entre 100 y 4000px' },
                    ]}
                  >
                    <Slider min={100} max={4000} step={50} />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="enableResize"
                    label="Habilitar Redimensionamiento"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Formato */}
            <Card size="small" className="border-l-4 border-l-purple-500">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="flex items-center gap-2 mb-4">
                    <FileImageOutlined className="text-purple-500 text-lg" />
                    <Title level={5} className="m-0">Formato de Salida</Title>
                  </div>
                </Col>
                
                <Col span={16}>
                  <Form.Item
                    name="format"
                    label="Formato"
                    rules={[{ required: true, message: 'El formato es requerido' }]}
                  >
                    <Select size="large">
                      <Option value="webp">WebP (Recomendado)</Option>
                      <Option value="jpeg">JPEG</Option>
                      <Option value="png">PNG</Option>
                      <Option value="auto">Automático</Option>
                    </Select>
                  </Form.Item>
                  <Text type="secondary" className="text-sm">
                    {getFormatDescription(currentFormat)}
                  </Text>
                </Col>
              </Row>
            </Card>

            {/* Optimización SEO */}
            <Card size="small" className="border-l-4 border-l-orange-500">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="flex items-center gap-2 mb-4">
                    <TagOutlined className="text-orange-500 text-lg" />
                    <Title level={5} className="m-0">Optimización SEO</Title>
                  </div>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="seoFriendlyNames"
                    label="Nombres SEO-Friendly"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                  <Text type="secondary" className="text-sm">
                    Genera nombres descriptivos para mejor indexación
                  </Text>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="generateHash"
                    label="Generar Hash"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                  <Text type="secondary" className="text-sm">
                    Previene duplicados y ahorra espacio
                  </Text>
                </Col>
              </Row>
            </Card>
          </Form>

          {/* Recomendaciones */}
          <Alert
            message="Recomendaciones para mejor rendimiento"
            description={
              <div className="space-y-2 mt-2">
                <div>• <strong>WebP:</strong> Formato preferido por Google para mejor ranking SEO</div>
                <div>• <strong>Calidad 75-85%:</strong> Balance óptimo entre calidad y tamaño</div>
                <div>• <strong>Dimensiones máximas:</strong> 1280px son ideales para web moderna</div>
                <div>• <strong>Nombres SEO:</strong> Mejoran la indexación en Google Imágenes</div>
              </div>
            }
            type="success"
            showIcon
          />
        </div>
      </Spin>
    </Modal>
  );
};

export default OptimizationConfigModal; 