import React, { useState, useEffect } from 'react';
import { Progress, Card, Typography, Alert, Statistic, Row, Col, Button, Spin, Table, Tabs, Badge, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, StopOutlined } from '@ant-design/icons';
import axios from 'axios';
import { ENDPOINTS } from '../../../api/endpoints';
import axiosInstance from '../../../api/axiosInstance';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/**
 * Componente para mostrar el progreso de la importación de vehículos en tiempo real
 */
const VehicleImportProgress = ({ jobId, onComplete, onError }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollInterval, setPollInterval] = useState(2000); // 2 segundos inicialmente
  
  // Obtener estado de la importación
  const fetchStatus = async () => {
    try {
      const response = await axiosInstance.get(`${ENDPOINTS.VEHICLES.IMPORT_STATUS}/${jobId}`);
      
      if (response.data.success) {
        setStatus(response.data.data);
        setLoading(false);
        
        // Si el trabajo está completado o falló, detener el polling
        if (response.data.data.status === 'completed') {
          setPollInterval(null);
          if (onComplete) onComplete(response.data.data);
        } else if (response.data.data.status === 'failed') {
          setPollInterval(null);
          if (onError) onError(response.data.data);
        } else {
          // Ajustar intervalo de polling basado en progreso
          // Menos frecuente si está en progreso activo
          const progress = response.data.data.progress || 0;
          if (progress > 80) {
            setPollInterval(1000); // Más rápido al final
          } else if (progress > 30) {
            setPollInterval(2000); // Normal durante el proceso
          } else {
            setPollInterval(3000); // Más lento al inicio
          }
        }
      } else {
        setError(response.data.message || 'Error obteniendo estado de la importación');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error de conexión');
      setLoading(false);
    }
  };
  
  // Efecto para polling
  useEffect(() => {
    if (!jobId) return;
    
    // Obtener estado inicial
    fetchStatus();
    
    // Configurar polling
    let interval = null;
    if (pollInterval) {
      interval = setInterval(fetchStatus, pollInterval);
    }
    
    // Limpiar al desmontar
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jobId, pollInterval]);
  
  // Determinar estado y color
  const getStatusInfo = () => {
    if (!status) return { color: '#1890ff', text: 'Iniciando...', icon: <ClockCircleOutlined /> };
    
    switch (status.status) {
      case 'pending':
        return { color: '#1890ff', text: 'Pendiente', icon: <ClockCircleOutlined /> };
      case 'processing':
        return { color: '#1890ff', text: 'Procesando', icon: <Spin size="small" /> };
      case 'completed':
        return { color: '#52c41a', text: 'Completado', icon: <CheckCircleOutlined /> };
      case 'failed':
        return { color: '#f5222d', text: 'Error', icon: <StopOutlined /> };
      default:
        return { color: '#faad14', text: 'Desconocido', icon: <WarningOutlined /> };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  // Formatear duración
  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Renderizar tablas de errores y advertencias
  const renderErrorsTable = () => {
    if (!status?.result?.errors?.length) return <Alert message="No se encontraron errores" type="success" />;
    
    const columns = [
      { title: 'Fila', dataIndex: 'row', key: 'row', width: 80 },
      { title: 'Error', dataIndex: 'error', key: 'error' },
      { 
        title: 'Datos', 
        dataIndex: 'data', 
        key: 'data',
        render: (data) => data ? (
          <pre style={{ maxHeight: '100px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : 'N/A'
      }
    ];
    
    return (
      <Table 
        columns={columns} 
        dataSource={status.result.errors.map((err, i) => ({ ...err, key: i }))} 
        size="small"
        pagination={{ pageSize: 5 }}
      />
    );
  };
  
  const renderWarningsTable = () => {
    if (!status?.result?.warnings?.length) return <Alert message="No se encontraron advertencias" type="success" />;
    
    const columns = [
      { title: 'Fila', dataIndex: 'row', key: 'row', width: 80 },
      { title: 'Advertencia', dataIndex: 'warning', key: 'warning' }
    ];
    
    return (
      <Table 
        columns={columns} 
        dataSource={status.result.warnings.map((warn, i) => ({ ...warn, key: i }))} 
        size="small"
        pagination={{ pageSize: 5 }}
      />
    );
  };
  
  // Renderizar resumen de entidades
  const renderEntitySummary = () => {
    if (!status?.result?.summary) return null;
    
    const { summary } = status.result;
    const entities = [
      { name: 'Marcas', data: summary.brands },
      { name: 'Familias', data: summary.families },
      { name: 'Modelos', data: summary.models },
      { name: 'Líneas', data: summary.lines },
      { name: 'Transmisiones', data: summary.transmissions },
      { name: 'Combustibles', data: summary.fuels },
      { name: 'Vehículos', data: summary.vehicles }
    ];
    
    return (
      <div style={{ marginTop: 16 }}>
        <Title level={5}>Resumen por entidad</Title>
        <Row gutter={[16, 16]}>
          {entities.map((entity) => (
            <Col span={8} key={entity.name}>
              <Card size="small">
                <Statistic title={entity.name} value={entity.data.created + entity.data.existing} />
                <div style={{ marginTop: 8 }}>
                  <Tag color="green">Creados: {entity.data.created}</Tag>
                  <Tag color="blue">Existentes: {entity.data.existing}</Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };
  
  // Renderizar información de lotes
  const renderBatchInfo = () => {
    if (!status?.result?.batches?.length) return null;
    
    const columns = [
      { title: 'Lote', dataIndex: 'batchNumber', key: 'batchNumber', width: 80 },
      { title: 'Filas procesadas', dataIndex: 'rowsProcessed', key: 'rowsProcessed', width: 120 },
      { title: 'Creados', dataIndex: 'created', key: 'created', width: 100 },
      { 
        title: 'Errores', 
        dataIndex: 'errors', 
        key: 'errors',
        width: 100,
        render: (errors) => errors.length ? (
          <Badge count={errors.length} style={{ backgroundColor: '#f5222d' }} />
        ) : 0
      },
      { 
        title: 'Advertencias', 
        dataIndex: 'warnings', 
        key: 'warnings',
        width: 100,
        render: (warnings) => warnings.length ? (
          <Badge count={warnings.length} style={{ backgroundColor: '#faad14' }} />
        ) : 0
      }
    ];
    
    return (
      <div style={{ marginTop: 16 }}>
        <Title level={5}>Información de lotes</Title>
        <Table 
          columns={columns} 
          dataSource={status.result.batches.map(batch => ({ ...batch, key: batch.batchNumber }))} 
          size="small"
          pagination={{ pageSize: 5 }}
        />
      </div>
    );
  };
  
  if (loading && !status) {
    return <Spin tip="Cargando estado de la importación..." />;
  }
  
  if (error && !status) {
    return <Alert message="Error" description={error} type="error" />;
  }
  
  return (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ marginBottom: 8 }}>
          Importación de Vehículos
        </Title>
        <Text type="secondary">ID de trabajo: {jobId}</Text>
      </div>
      
      <Card
        style={{ marginBottom: 16 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: statusInfo.color, marginRight: 8 }}>{statusInfo.icon}</span>
            <span>Estado: {statusInfo.text}</span>
          </div>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Progress 
            percent={status?.progress || 0} 
            status={status?.status === 'failed' ? 'exception' : 'active'} 
            strokeColor={statusInfo.color}
          />
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <Text>{status?.message || 'Procesando...'}</Text>
          </div>
        </div>
        
        {status?.result && (
          <Row gutter={16}>
            <Col span={6}>
              <Statistic 
                title="Filas totales" 
                value={status.result.totalRows || 0} 
                suffix={status.result.totalRows > 1000 ? '(archivo grande)' : ''} 
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Procesadas" 
                value={status.result.processed || 0} 
                suffix={status.result.totalRows ? `(${Math.round(status.result.processed * 100 / status.result.totalRows)}%)` : ''} 
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Creados" 
                value={status.result.created || 0}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Tiempo" 
                value={formatDuration(status.result.duration)} 
              />
            </Col>
          </Row>
        )}
        
        {status?.status === 'failed' && (
          <Alert 
            message="Error en la importación" 
            description={status.error}
            type="error" 
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
      
      {status?.result && (
        <Tabs defaultActiveKey="1">
          <TabPane 
            tab={
              <span>
                Resumen 
                <Badge count={status.result.created} style={{ backgroundColor: '#52c41a', marginLeft: 8 }} />
              </span>
            } 
            key="1"
          >
            {renderEntitySummary()}
            {renderBatchInfo()}
          </TabPane>
          <TabPane 
            tab={
              <span>
                Errores 
                <Badge count={status.result.errors?.length || 0} style={{ backgroundColor: '#f5222d', marginLeft: 8 }} />
              </span>
            } 
            key="2"
          >
            {renderErrorsTable()}
          </TabPane>
          <TabPane 
            tab={
              <span>
                Advertencias 
                <Badge count={status.result.warnings?.length || 0} style={{ backgroundColor: '#faad14', marginLeft: 8 }} />
              </span>
            } 
            key="3"
          >
            {renderWarningsTable()}
          </TabPane>
        </Tabs>
      )}
      
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Button 
          type="primary"
          onClick={() => window.location.reload()}
          disabled={status?.status === 'processing' || status?.status === 'pending'}
        >
          {status?.status === 'completed' ? 'Volver a importar' : 'Actualizar'}
        </Button>
      </div>
    </Card>
  );
};

export default VehicleImportProgress; 