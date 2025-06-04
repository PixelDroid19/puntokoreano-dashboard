import React, { useState } from 'react';
import { 
  Card, Typography, Upload, Button, message, Alert, Divider, 
  Tag, Space, InputNumber, Form, Modal, Row, Col
} from 'antd';
import { 
  InboxOutlined, DownloadOutlined, CloudUploadOutlined,
  InfoCircleOutlined, CheckCircleOutlined, WarningOutlined
} from '@ant-design/icons';
import { ENDPOINTS } from '../../../api/endpoints';
import axiosInstance from '../../../api/axiosInstance';
import VehicleImportProgress from './VehicleImportProgress';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const VehicleImport = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [importStarted, setImportStarted] = useState(false);
  
  // Configuración de subida de archivos
  const uploadProps = {
    name: 'excelFile',
    multiple: false,
    action: ENDPOINTS.VEHICLES.IMPORT_EXCEL,
    accept: '.xlsx, .xls',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                      file.type === 'application/vnd.ms-excel';
      
      if (!isExcel) {
        message.error('Solo se permiten archivos Excel (.xlsx, .xls)');
        return Upload.LIST_IGNORE;
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('El archivo debe ser menor a 10MB');
        return Upload.LIST_IGNORE;
      }
      
      return true;
    },
    onChange: (info) => {
      const { status, response } = info.file;
      
      if (status === 'uploading') {
        setLoading(true);
      }
      
      if (status === 'done') {
        if (response.success) {
          message.success(`${info.file.name} subido correctamente`);
          setJobId(response.jobId);
          setImportStarted(true);
          setLoading(false);
        } else {
          message.error(`${info.file.name}: ${response.message}`);
          setLoading(false);
        }
      } else if (status === 'error') {
        message.error(`${info.file.name} falló al subir: ${info.file.response?.message || 'Error desconocido'}`);
        setLoading(false);
      }
    },
    data: (file) => {
      return {
        batchSize: form.getFieldValue('batchSize') || 100
      };
    },
    showUploadList: false
  };
  
  // Descargar plantilla
  const handleDownloadTemplate = () => {
    window.open(ENDPOINTS.VEHICLES.DOWNLOAD_TEMPLATE, '_blank');
  };
  
  // Reiniciar importación
  const handleReset = () => {
    setJobId(null);
    setImportStarted(false);
    form.resetFields();
  };
  
  // Manejar finalización de importación
  const handleImportComplete = (result) => {
    message.success('Importación completada exitosamente!');
  };
  
  // Manejar error en importación
  const handleImportError = (error) => {
    message.error(`Error en la importación: ${error.error || 'Error desconocido'}`);
  };
  
  // Verificar estado de importación existente
  const checkExistingImport = async (existingJobId) => {
    try {
      const response = await axiosInstance.get(`${ENDPOINTS.VEHICLES.IMPORT_STATUS}/${existingJobId}`);
      if (response.data.success) {
        setJobId(existingJobId);
        setImportStarted(true);
        message.info('Recuperando estado de importación previa');
      }
    } catch (error) {
      console.error('Error verificando importación existente:', error);
    }
  };
  
  // Si hay un jobId almacenado en localStorage, verificar su estado al cargar
  React.useEffect(() => {
    const savedJobId = localStorage.getItem('vehicleImportJobId');
    if (savedJobId) {
      checkExistingImport(savedJobId);
    }
  }, []);
  
  // Guardar jobId en localStorage cuando cambia
  React.useEffect(() => {
    if (jobId) {
      localStorage.setItem('vehicleImportJobId', jobId);
    }
  }, [jobId]);
  
  return (
    <div>
      <Title level={2}>Importar Vehículos desde Excel (V2.0)</Title>
      
      {!importStarted ? (
        <>
          <Alert
            message="Instrucciones"
            description={
              <>
                <Paragraph>
                  Utilice esta herramienta para importar masivamente vehículos desde un archivo Excel.
                  El archivo debe contener las siguientes columnas:
                </Paragraph>
                
                <div style={{ marginBottom: 16 }}>
                  <Space direction="vertical">
                    <div>
                      <Text strong>Campos obligatorios:</Text>
                      <div style={{ marginTop: 8 }}>
                        <Space>
                          <Tag color="red">MARCA</Tag>
                          <Tag color="red">FAMILIA</Tag>
                          <Tag color="red">AÑO</Tag>
                          <Tag color="red">TRANSMISION</Tag>
                          <Tag color="red">COMBUSTIBLE</Tag>
                        </Space>
                      </div>
                    </div>
                    
                    <div>
                      <Text strong>Campos opcionales:</Text>
                      <div style={{ marginTop: 8 }}>
                        <Space>
                          <Tag color="blue">MOTOR</Tag>
                          <Tag color="blue">LINEA</Tag>
                          <Tag color="blue">PRECIO</Tag>
                          <Tag color="blue">COLOR</Tag>
                        </Space>
                      </div>
                    </div>
                  </Space>
                </div>
                
                <Paragraph>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={handleDownloadTemplate}
                  >
                    Descargar Plantilla V2.0
                  </Button>
                </Paragraph>
              </>
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 24 }}
          />
          
          <Card title="Configuración de importación">
            <Form
              form={form}
              layout="vertical"
              initialValues={{ batchSize: 100 }}
            >
              <Form.Item
                name="batchSize"
                label="Tamaño de lote"
                tooltip="Número de filas a procesar por lote. Para archivos grandes, use lotes más pequeños."
              >
                <InputNumber
                  min={10}
                  max={500}
                  style={{ width: 200 }}
                  addonAfter="filas por lote"
                />
              </Form.Item>
            </Form>
          </Card>
          
          <Divider />
          
          <Dragger {...uploadProps} disabled={loading}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Haga clic o arrastre un archivo Excel para importar
            </p>
            <p className="ant-upload-hint">
              Solo se permiten archivos Excel (.xlsx, .xls) hasta 10MB
            </p>
            {loading && <p>Subiendo archivo...</p>}
          </Dragger>
          
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              loading={loading}
              onClick={() => document.querySelector('.ant-upload input').click()}
            >
              Seleccionar archivo
            </Button>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button type="link" onClick={handleReset}>
              &lt; Volver a importación
            </Button>
          </div>
          
          <VehicleImportProgress 
            jobId={jobId} 
            onComplete={handleImportComplete}
            onError={handleImportError}
          />
        </>
      )}
    </div>
  );
};

export default VehicleImport; 