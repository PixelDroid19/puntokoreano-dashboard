import React, { useState, useRef } from 'react';
import {
  Modal,
  Button,
  Upload,
  message,
  List,
  Card,
  Space,
  Tooltip,
  Image,
  Popconfirm,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Tag,
  Alert,
  Spin,
  Divider
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  FolderOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileOutlined,
  ReloadOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import StorageService, { type StorageFile } from '../../services/storage.service';

const { Title, Text } = Typography;
const { Option } = Select;

interface StorageTestModalProps {
  open: boolean;
  onClose: () => void;
}

const StorageTestModal: React.FC<StorageTestModalProps> = ({ open, onClose }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [folder, setFolder] = useState('test-uploads');
  const [selectedFolder, setSelectedFolder] = useState('');

  // Cargar archivos del storage
  const loadStorageFiles = async (folderPath: string = '') => {
    try {
      setLoading(true);
      const response = await StorageService.listFiles(folderPath);
      if (response.success && response.data) {
        setStorageFiles(response.data);
      }
    } catch (error) {
      message.error('Error al cargar archivos del storage');
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subir archivos
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Por favor selecciona al menos un archivo');
      return;
    }

    const files = fileList.map(file => file.originFileObj as File);
    
    // Validar archivos
    const validation = StorageService.validateFiles(files);
    if (!validation.valid) {
      Modal.error({
        title: 'Archivos inválidos',
        content: (
          <ul>
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )
      });
      return;
    }

    try {
      setUploading(true);
      
      if (files.length === 1) {
        // Subir un solo archivo
        const response = await StorageService.uploadSingleFile(files[0], folder);
        if (response.success) {
          message.success('Archivo subido exitosamente');
        }
      } else {
        // Subir múltiples archivos
        const response = await StorageService.uploadMultipleFiles(files, folder);
        if (response.success) {
          message.success(`${files.length} archivos subidos exitosamente`);
        }
      }
      
      setFileList([]);
      await loadStorageFiles(selectedFolder);
    } catch (error) {
      message.error('Error al subir archivos');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Eliminar archivo del storage
  const handleDelete = async (filename: string) => {
    try {
      await StorageService.deleteFile(filename);
      message.success('Archivo eliminado exitosamente');
      await loadStorageFiles(selectedFolder);
    } catch (error) {
      message.error('Error al eliminar archivo');
      console.error('Delete error:', error);
    }
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = (filename: string) => {
    if (StorageService.isImageFile(filename)) {
      return <FileImageOutlined style={{ color: '#1890ff' }} />;
    } else if (filename.endsWith('.pdf')) {
      return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
    }
    return <FileOutlined style={{ color: '#8c8c8c' }} />;
  };

  // Cargar archivos cuando se abre el modal
  React.useEffect(() => {
    if (open) {
      loadStorageFiles(selectedFolder);
    }
  }, [open, selectedFolder]);

  const uploadProps = {
    multiple: true,
    fileList,
    beforeUpload: () => false, // Prevenir subida automática
    onChange: ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
      setFileList(newFileList);
    },
    accept: 'image/*,.pdf',
    maxCount: 5,
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CloudUploadOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          <span>Prueba de Google Cloud Storage</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={null}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Información del servicio */}
        <Alert
          message="Prueba de Almacenamiento"
          description="Esta herramienta te permite probar la funcionalidad de subida y gestión de archivos en Google Cloud Storage."
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
        />

        <Row gutter={[16, 16]}>
          {/* Panel de subida */}
          <Col span={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UploadOutlined style={{ marginRight: 8 }} />
                  Subir Archivos
                </div>
              }
              size="small"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Carpeta de destino:</Text>
                  <Input
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    placeholder="Ej: test-uploads, images, documents"
                    prefix={<FolderOutlined />}
                    style={{ marginTop: 4 }}
                  />
                </div>

                <Upload.Dragger {...uploadProps} style={{ marginBottom: 16 }}>
                  <p className="ant-upload-drag-icon">
                    <CloudUploadOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Haz clic o arrastra archivos aquí
                  </p>
                  <p className="ant-upload-hint">
                    Máximo 5 archivos. Formatos: JPG, PNG, GIF, WebP, SVG, PDF (máx 10MB)
                  </p>
                </Upload.Dragger>

                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={fileList.length === 0}
                  block
                >
                  Subir {fileList.length > 0 ? `${fileList.length} archivo(s)` : 'Archivos'}
                </Button>
              </Space>
            </Card>
          </Col>

          {/* Panel de archivos */}
          <Col span={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FolderOutlined style={{ marginRight: 8 }} />
                    Archivos en Storage
                  </div>
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={() => loadStorageFiles(selectedFolder)}
                    loading={loading}
                  >
                    Actualizar
                  </Button>
                </div>
              }
              size="small"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Filtrar por carpeta:</Text>
                  <Select
                    value={selectedFolder}
                    onChange={setSelectedFolder}
                    placeholder="Todas las carpetas"
                    style={{ width: '100%', marginTop: 4 }}
                    allowClear
                  >
                    <Option value="">Todas las carpetas</Option>
                    <Option value="test-uploads">test-uploads</Option>
                    <Option value="images">images</Option>
                    <Option value="documents">documents</Option>
                    <Option value="uploads">uploads</Option>
                  </Select>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  <Spin spinning={loading}>
                    {storageFiles.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px 0', color: '#8c8c8c' }}>
                        <FolderOutlined style={{ fontSize: 48, opacity: 0.3 }} />
                        <p>No hay archivos en esta carpeta</p>
                      </div>
                    ) : (
                      <List
                        dataSource={storageFiles}
                        size="small"
                        renderItem={(file) => (
                          <List.Item
                            actions={[
                              <Tooltip title="Ver archivo">
                                <Button
                                  type="text"
                                  icon={<EyeOutlined />}
                                  onClick={() => window.open(file.url, '_blank')}
                                />
                              </Tooltip>,
                              <Popconfirm
                                title="¿Eliminar archivo?"
                                description="Esta acción no se puede deshacer"
                                onConfirm={() => handleDelete(file.name)}
                              >
                                <Tooltip title="Eliminar">
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                  />
                                </Tooltip>
                              </Popconfirm>
                            ]}
                          >
                            <List.Item.Meta
                              avatar={getFileIcon(file.name)}
                              title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <Text ellipsis style={{ maxWidth: 150 }}>
                                    {file.name.split('/').pop()}
                                  </Text>
                                                                     {StorageService.isImageFile(file.name) && (
                                     <Tag color="blue" style={{ marginLeft: 8, fontSize: 10 }}>IMG</Tag>
                                   )}
                                </div>
                              }
                              description={
                                <div>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {file.size && typeof file.size === 'string' 
                                      ? file.size 
                                      : StorageService.formatFileSize(Number(file.size) || 0)
                                    }
                                  </Text>
                                  {StorageService.isImageFile(file.name) && (
                                    <div style={{ marginTop: 4 }}>
                                      <Image
                                        width={40}
                                        height={40}
                                        src={file.url}
                                        style={{ borderRadius: 4 }}
                                        preview={false}
                                      />
                                    </div>
                                  )}
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </Spin>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Estadísticas */}
        <Card size="small">
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                  {storageFiles.length}
                </Text>
                <br />
                <Text type="secondary">Archivos Totales</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                  {storageFiles.filter(f => StorageService.isImageFile(f.name)).length}
                </Text>
                <br />
                <Text type="secondary">Imágenes</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Text strong style={{ fontSize: 18, color: '#faad14' }}>
                  {StorageService.formatFileSize(
                    storageFiles.reduce((acc, file) => 
                      acc + (Number(file.size) || 0), 0
                    )
                  )}
                </Text>
                <br />
                <Text type="secondary">Tamaño Total</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

export default StorageTestModal; 