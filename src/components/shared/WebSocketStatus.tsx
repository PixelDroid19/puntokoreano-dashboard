import React from 'react';
import { Badge, Tooltip, Button, Popover, Typography, Divider } from 'antd';
import { 
  WifiOutlined, 
  DisconnectOutlined, 
  SyncOutlined, 
  BellOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface WebSocketStatusProps {
  isConnected: boolean;
  onReconnect?: () => void;
  onReset?: () => void;
  className?: string;
}

const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  isConnected,
  onReconnect,
  onReset,
  className = ""
}) => {
  const statusContent = (
    <div className="space-y-3 min-w-[300px]">
      <div className="flex items-center justify-between">
        <Title level={5} className="!mb-0">Estado de Conexión</Title>
        <Badge 
          status={isConnected ? "success" : "error"} 
          text={isConnected ? "Conectado" : "Desconectado"}
        />
      </div>
      
      <Divider className="!my-2" />
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <BellOutlined className="text-blue-500" />
          <Text>Notificaciones en tiempo real</Text>
          <Badge 
            status={isConnected ? "processing" : "default"} 
            text={isConnected ? "Activas" : "Pausadas"}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <InfoCircleOutlined className="text-green-500" />
          <Text>Actualizaciones automáticas</Text>
          <Badge 
            status={isConnected ? "success" : "default"} 
            text={isConnected ? "Funcionando" : "Detenidas"}
          />
        </div>
      </div>
      
      {!isConnected && (
        <>
          <Divider className="!my-2" />
          <div className="space-y-2">
            <Text type="warning" className="block">
              ⚠️ Sin conexión en tiempo real
            </Text>
            <Text className="text-xs text-gray-500 block">
              Los datos se actualizarán al recargar la página
            </Text>
            <div className="flex space-x-2">
              {onReconnect && (
                <Button 
                  size="small" 
                  type="primary" 
                  icon={<SyncOutlined />}
                  onClick={onReconnect}
                >
                  Reconectar
                </Button>
              )}
              {onReset && (
                <Button 
                  size="small" 
                  icon={<DisconnectOutlined />}
                  onClick={onReset}
                >
                  Resetear
                </Button>
              )}
            </div>
          </div>
        </>
      )}
      
      {isConnected && (
        <>
          <Divider className="!my-2" />
          <div className="bg-green-50 p-2 rounded">
            <Text className="text-green-700 text-xs">
              ✅ Sistema de notificaciones optimizado activo
              <br />
              🔄 Las actualizaciones aparecen automáticamente
            </Text>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Popover 
      content={statusContent} 
      title="Estado del Sistema en Tiempo Real"
      trigger="hover"
      placement="bottomRight"
    >
      <div className={`flex items-center space-x-2 cursor-pointer ${className}`}>
        <Tooltip title={isConnected ? "Conectado en tiempo real" : "Desconectado"}>
          <Badge
            status={isConnected ? "success" : "error"}
            text={
              <span className="text-sm text-gray-600">
                {isConnected ? "En línea" : "Sin conexión"}
              </span>
            }
          />
        </Tooltip>
        <Tooltip title="Estado de la conexión WebSocket">
          {isConnected ? (
            <WifiOutlined className="text-green-500" />
          ) : (
            <DisconnectOutlined className="text-red-500" />
          )}
        </Tooltip>
      </div>
    </Popover>
  );
};

export default WebSocketStatus; 