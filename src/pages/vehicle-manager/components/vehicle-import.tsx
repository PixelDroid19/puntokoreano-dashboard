import React, { useState, useRef } from 'react';
import { 
  Upload, 
  message, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Progress, 
  Alert, 
  Divider,
  Table,
  Tag,
  Collapse,
  Modal,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  InboxOutlined, 
  DownloadOutlined, 
  FileExcelOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { axiosInstance } from '../../../utils/axios-interceptor';
import ENDPOINTS from '../../../api';
import type { UploadProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Dragger } = Upload;

interface ImportResult {
  success: boolean;
  message: string;
  results?: {
    processed: number;
    created: number;
    updated: number;
    errors: Array<{
      row: number;
      error: string;
      data: any;
    }>;
    warnings: Array<{
      row: number;
      warning: string;
    }>;
    summary: {
      brands: { created: number; existing: number };
      families: { created: number; existing: number };
      models: { created: number; existing: number };
      lines: { created: number; existing: number };
      transmissions: { created: number; existing: number };
      fuels: { created: number; existing: number };
      vehicles: { created: number; existing: number };
    };
    totalRows: number;
    successRate: string;
  };
}

const VehicleImport: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const fileInputRef = useRef<any>(null);

  // Configuración de upload
  const uploadProps: UploadProps = {
    name: 'excelFile',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        message.error('Solo se permiten archivos Excel (.xlsx, .xls)');
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('El archivo debe ser menor a 10MB');
        return false;
      }

      handleUpload(file);
      return false; // Prevenir upload automático
    },
    onDrop(e) {
      console.log('Archivos soltados', e.dataTransfer.files);
    },
  };

  // Manejar subida de archivo
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('excelFile', file);

    setUploading(true);
    setUploadProgress(0);
    setImportResult(null);

    try {
      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await axiosInstance.post(ENDPOINTS.VEHICLES.IMPORT_EXCEL.url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          setUploadProgress(progress);
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success) {
        setImportResult(response.data);
        message.success(`Importación completada! ${response.data.results.created} vehículos creados`);
      } else {
        message.error(response.data.message || 'Error en la importación');
      }

    } catch (error: any) {
      console.error('Error en importación:', error);
      
      if (error.response?.data) {
        setImportResult({
          success: false,
          message: error.response.data.message || 'Error en la importación'
        });
        message.error(error.response.data.message || 'Error en la importación');
      } else {
        message.error('Error de conexión al servidor');
      }
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Descargar plantilla
  const downloadTemplate = async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.VEHICLES.DOWNLOAD_TEMPLATE.url, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla_vehiculos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Plantilla descargada exitosamente');
    } catch (error) {
      console.error('Error descargando plantilla:', error);
      message.error('Error al descargar la plantilla');
    }
  };

  // Columnas para tabla de errores
  const errorColumns = [
    {
      title: 'Fila',
      dataIndex: 'row',
      key: 'row',
      width: 80,
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      ellipsis: true,
    },
    {
      title: 'Datos',
      dataIndex: 'data',
      key: 'data',
      render: (data: any) => (
        <Text code>{JSON.stringify(data, null, 2)}</Text>
      ),
      ellipsis: true,
    },
  ];

  // Columnas para tabla de advertencias
  const warningColumns = [
    {
      title: 'Fila',
      dataIndex: 'row',
      key: 'row',
      width: 80,
    },
    {
      title: 'Advertencia',
      dataIndex: 'warning',
      key: 'warning',
      ellipsis: true,
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={2} className="mb-0">
              <FileExcelOutlined className="mr-2" />
              Importar Vehículos desde Excel 
            </Title>
            <Text type="secondary">
              Carga masiva de vehículos con formato mejorado y más campos de información
            </Text>
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={downloadTemplate}
            size="large"
            className="flex items-center gap-2"
          >
            Descargar Plantilla
          </Button>
        </div>

        {/* Instrucciones */}
        <Card className="mb-6 shadow-sm border-gray-200">
          <div className="flex items-center mb-2">
            <InfoCircleOutlined className="text-blue-500 mr-2" />
            <Title level={5} className="m-0">Instrucciones de Uso</Title>
          </div>

          <Alert
            type="info"
            showIcon
            message={<span className="font-medium">Formato requerido</span>}
            description={
              <div className="flex flex-wrap gap-2 mt-1 items-center">
                <Text className="font-medium mr-1">Obligatorios:</Text>
                <Tag color="blue" className="px-2 py-0.5">MARCA</Tag>
                <Tag color="green" className="px-2 py-0.5">FAMILIA</Tag>
                <Tag color="purple" className="px-2 py-0.5">AÑO</Tag>
                <Tag color="orange" className="px-2 py-0.5">TRANSMISION</Tag>
                <Tag color="red" className="px-2 py-0.5">COMBUSTIBLE</Tag>
                <Text className="font-medium ml-3 mr-1">Opcionales:</Text>
                <Tag color="cyan" className="px-2 py-0.5">MOTOR</Tag>
                <Tag color="yellow" className="px-2 py-0.5">LINEA</Tag>
                <Tag color="magenta" className="px-2 py-0.5">PRECIO</Tag>
                <Tag color="lime" className="px-2 py-0.5">COLOR</Tag>
              </div>
            }
          />
        </Card>

        {/* Área de carga */}
        <Card className="mb-6 shadow-sm border-gray-200">
          <Dragger 
            {...uploadProps} 
            disabled={uploading}
            className={`${uploading ? 'uploading' : ''} bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors`}
            style={{ padding: '32px 16px' }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: '48px', color: '#1677ff' }} />
            </p>
            <p className="ant-upload-text text-lg font-medium">
              {uploading 
                ? 'Procesando archivo...' 
                : 'Haz clic o arrastra el archivo Excel aquí'
              }
            </p>
            <p className="ant-upload-hint text-gray-500">
              Solo archivos .xlsx y .xls. Máximo 10MB.
            </p>
          </Dragger>

          {uploading && (
            <div className="mt-6">
              <Progress 
                percent={uploadProgress} 
                status="active"
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                strokeWidth={8}
              />
              <Text className="mt-2 block text-center">
                {uploadProgress < 90 ? 'Subiendo archivo...' : 'Procesando datos...'}
              </Text>
            </div>
          )}
        </Card>

        {/* Resultados de importación */}
        {importResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <div className="flex justify-between items-start mb-4">
                <Title level={4}>
                  {importResult.success ? (
                    <>
                      <CheckCircleOutlined className="text-green-500 mr-2" />
                      Importación Completada
                    </>
                  ) : (
                    <>
                      <ExclamationCircleOutlined className="text-red-500 mr-2" />
                      Error en Importación
                    </>
                  )}
                </Title>
                {importResult.results && (
                  <Button onClick={() => setShowDetailsModal(true)}>
                    Ver Detalles
                  </Button>
                )}
              </div>

              <Alert
                type={importResult.success ? "success" : "error"}
                message={importResult.message}
                className="mb-4"
              />

              {importResult.results && (
                <>
                  <Row gutter={[16, 16]} className="mb-4">
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Filas Procesadas"
                        value={importResult.results.processed}
                        prefix={<InfoCircleOutlined />}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Vehículos Creados"
                        value={importResult.results.created}
                        prefix={<CheckCircleOutlined className="text-green-500" />}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Errores"
                        value={importResult.results.errors.length}
                        prefix={<ExclamationCircleOutlined className="text-red-500" />}
                      />
                    </Col>
                    <Col xs={12} sm={6}>
                      <Statistic
                        title="Tasa de Éxito"
                        value={importResult.results.successRate}
                        suffix="%"
                        prefix={<CheckCircleOutlined className="text-green-500" />}
                      />
                    </Col>
                  </Row>

                  {(importResult.results.errors.length > 0 || importResult.results.warnings.length > 0) && (
                    <Collapse className="mt-4">
                      {importResult.results.errors.length > 0 && (
                        <Panel
                          header={
                            <span>
                              <ExclamationCircleOutlined className="text-red-500 mr-2" />
                              Errores ({importResult.results.errors.length})
                            </span>
                          }
                          key="errors"
                        >
                          <Table
                            dataSource={importResult.results.errors}
                            columns={errorColumns}
                            size="small"
                            scroll={{ x: 600 }}
                            pagination={{ pageSize: 5 }}
                          />
                        </Panel>
                      )}

                      {importResult.results.warnings.length > 0 && (
                        <Panel
                          header={
                            <span>
                              <WarningOutlined className="text-yellow-500 mr-2" />
                              Advertencias ({importResult.results.warnings.length})
                            </span>
                          }
                          key="warnings"
                        >
                          <Table
                            dataSource={importResult.results.warnings}
                            columns={warningColumns}
                            size="small"
                            scroll={{ x: 600 }}
                            pagination={{ pageSize: 5 }}
                          />
                        </Panel>
                      )}
                    </Collapse>
                  )}
                </>
              )}
            </Card>
          </motion.div>
        )}

        {/* Modal de detalles */}
        <Modal
          title="Detalles de Importación"
          open={showDetailsModal}
          onCancel={() => setShowDetailsModal(false)}
          footer={null}
          width={800}
        >
          {importResult?.results && (
            <div>
              <Title level={5}>Resumen por Entidad</Title>
              <Row gutter={[16, 8]}>
                {Object.entries(importResult.results.summary).map(([entity, counts]) => (
                  <Col span={12} key={entity}>
                    <Card size="small">
                      <Text strong className="capitalize">{entity}</Text>
                      <div className="flex justify-between mt-1">
                        <Text>Creados: <Tag color="green">{counts.created}</Tag></Text>
                        <Text>Existentes: <Tag color="blue">{counts.existing}</Tag></Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Modal>
      </motion.div>
    </div>
  );
};

export default VehicleImport; 