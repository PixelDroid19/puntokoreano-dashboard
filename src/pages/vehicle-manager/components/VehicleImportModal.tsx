import React, { useState, useRef } from 'react';
import { 
  Upload, 
  message, 
  Button, 
  Modal,
  Typography, 
  Progress, 
  Alert, 
  Table,
  Collapse,
} from 'antd';
import { 
  InboxOutlined,
} from '@ant-design/icons';
import { axiosInstance } from '../../../utils/axios-interceptor';
import ENDPOINTS from '../../../api';
import type { UploadProps } from 'antd';

const { Text } = Typography;
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
      transmissions: { created: number; existing: number };
      fuels: { created: number; existing: number };
      vehicles: { created: number; existing: number };
    };
    totalRows: number;
    successRate: string;
  };
}

interface VehicleImportModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const VehicleImportModal: React.FC<VehicleImportModalProps> = ({ 
  visible, 
  onClose, 
  onSuccess 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
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
    formData.append('batchSize', '100'); // Tamaño fijo

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
        message.success(`Importación completada! ${response.data.results?.created || 0} vehículos creados`);
        onSuccess?.();
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

  // Limpiar estado al cerrar
  const handleClose = () => {
    setImportResult(null);
    setUploadProgress(0);
    setUploading(false);
    onClose();
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
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <InboxOutlined className="text-blue-600" />
          </div>
          <span className="text-lg font-semibold text-gray-800">Importar Vehículos</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={650}
      destroyOnClose
      maskClosable={!uploading}
      className="modern-import-modal"
    >
      <div className="space-y-6 p-2">
        {/* Información del formato */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 shadow-sm">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-2">Formato de archivo Excel</h4>
              <p className="text-sm text-gray-700 mb-3">
                Asegúrate de incluir las columnas: <span className="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">MARCA, FAMILIA, AÑO, TRANSMISION, COMBUSTIBLE</span>
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800 font-medium">
                  ⏱️ <strong>Tiempo estimado:</strong> 3-5 minutos dependiendo de la cantidad de vehículos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Área de subida mejorada */}
        <div className="relative">
          <Dragger 
            {...uploadProps} 
            disabled={uploading}
            className="!border-3 !border-dashed !border-blue-300 hover:!border-blue-500 !bg-gradient-to-br !from-blue-25 !to-indigo-25 hover:!bg-gradient-to-br hover:!from-blue-50 hover:!to-indigo-50 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl"
            style={{ padding: '48px 24px' }}
          >
            <div className="text-center">
              <div className="mb-4">
                <InboxOutlined 
                  style={{ 
                    fontSize: '64px', 
                    color: uploading ? '#93c5fd' : '#2563eb',
                    transition: 'color 0.3s ease',
                    filter: 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.2))'
                  }} 
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-800">
                  {uploading ? (
                    <span className="text-blue-600">Procesando tu archivo...</span>
                  ) : (
                    'Arrastra tu archivo Excel aquí'
                  )}
                </p>
                {!uploading && (
                  <p className="text-gray-600">
                    o <span className="text-blue-600 font-semibold">haz clic para seleccionar</span>
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-3 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                  Formatos: .xlsx, .xls • Máximo: 10MB
                </p>
              </div>
            </div>
          </Dragger>

          {uploading && (
            <div className="mt-6">
              <Progress 
                percent={uploadProgress} 
                status="active"
                strokeColor={{
                  '0%': '#3b82f6',
                  '100%': '#10b981',
                }}
                strokeWidth={8}
                showInfo={false}
                className="mb-2"
              />
              <p className="text-center text-sm text-gray-600">
                {uploadProgress < 90 ? 'Subiendo archivo...' : 'Procesando datos...'}
              </p>
            </div>
          )}
        </div>

        {/* Resultados de importación */}
        {importResult && (
          <div className="mt-6">
            <Alert
              message={
                <span className="font-semibold text-lg">
                  {importResult.success ? "¡Importación Completada!" : "Error en la Importación"}
                </span>
              }
              description={
                <div className="mt-2">
                  <p className="text-base">{importResult.message}</p>
                  {importResult.success && (
                    <p className="text-sm text-green-700 mt-2 bg-green-50 p-2 rounded-lg border border-green-200">
                      💡 <strong>Nota:</strong> El procesamiento puede continuar en segundo plano durante 3-5 minutos para grandes volúmenes de datos.
                    </p>
                  )}
                </div>
              }
              type={importResult.success ? "success" : "error"}
              showIcon
              className="rounded-xl border-2 shadow-lg"
            />

            {importResult.success && importResult.results && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-lg">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {importResult.results.processed}
                    </div>
                    <div className="text-sm font-semibold text-gray-600">Procesados</div>
                  </div>
                  <div className="text-center bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {importResult.results.created}
                    </div>
                    <div className="text-sm font-semibold text-gray-600">Creados</div>
                  </div>
                  <div className="text-center bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-emerald-200">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      {importResult.results.successRate}
                    </div>
                    <div className="text-sm font-semibold text-gray-600">Éxito</div>
                  </div>
                </div>

                {(importResult.results.errors.length > 0 || importResult.results.warnings.length > 0) && (
                  <div className="mt-6 pt-4 border-t-2 border-green-300">
                    <Collapse 
                      className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-md rounded-xl overflow-hidden" 
                      size="small"
                      expandIconPosition="end"
                    >
                      {importResult.results.errors.length > 0 && (
                        <Panel
                          header={
                            <span className="font-semibold text-red-600 text-base">
                              🚫 Errores encontrados ({importResult.results.errors.length})
                            </span>
                          }
                          key="errors"
                          className="border-l-4 border-red-500"
                        >
                          <Table
                            dataSource={importResult.results.errors}
                            columns={errorColumns}
                            size="small"
                            pagination={{ pageSize: 3, size: 'small' }}
                            className="rounded-lg overflow-hidden border border-gray-200"
                          />
                        </Panel>
                      )}
                      {importResult.results.warnings.length > 0 && (
                        <Panel
                          header={
                            <span className="font-semibold text-yellow-600 text-base">
                              ⚠️ Advertencias ({importResult.results.warnings.length})
                            </span>
                          }
                          key="warnings"
                          className="border-l-4 border-yellow-500"
                        >
                          <Table
                            dataSource={importResult.results.warnings}
                            columns={warningColumns}
                            size="small"
                            pagination={{ pageSize: 3, size: 'small' }}
                            className="rounded-lg overflow-hidden border border-gray-200"
                          />
                        </Panel>
                      )}
                    </Collapse>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VehicleImportModal; 