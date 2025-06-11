// src/pages/images/components/HeaderTable.component.tsx
import { Button, Alert, Card, Row, Col, Typography, Space } from "antd";
import { 
  InfoCircleOutlined, 
  PlusOutlined, 
  PictureOutlined, 
  TagOutlined, 
  FileImageOutlined, 
  IdcardOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { useState } from "react";
import CreateGroupModal from "./CreateGroupModal";
import OptimizationConfigModal from "./OptimizationConfigModal";
import OptimizationStatusBadge from "./OptimizationStatusBadge";

const { Text, Title } = Typography;

const HeaderImageManager = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestor de Imágenes</h2>
          <p className="text-gray-500 mt-1">
            Organiza y administra grupos de imágenes para tu aplicación
          </p>
          <div className="mt-2">
            <OptimizationStatusBadge />
          </div>
        </div>
        <Space size="middle">
          <Button 
            icon={<SettingOutlined />}
            size="large"
            className="flex items-center"
            onClick={() => setIsConfigModalVisible(true)}
            type="default"
          >
            Configurar Optimización
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            size="large"
            className="flex items-center"
            onClick={() => setIsModalVisible(true)}
            id="createGroupBtn"
          >
            Nuevo Grupo
          </Button>
        </Space>
      </div>

      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <InfoCircleOutlined className="text-blue-500 mr-2 text-lg" />
            <Title level={5} style={{margin: 0}}>Guía de uso</Title>
          </div>
          <Text className="text-xs text-gray-500">
            Las imágenes se optimizan automáticamente según tu configuración
          </Text>
        </div>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" bordered={false} className="bg-white bg-opacity-70 h-full">
              <div className="flex items-start">
                <PictureOutlined className="text-lg text-blue-500 mt-1 mr-2" />
                <div>
                  <Text strong>Grupos de Imágenes</Text>
                  <div className="text-sm text-gray-600 mt-1">
                    Organiza tus imágenes en grupos para una gestión eficiente
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" bordered={false} className="bg-white bg-opacity-70 h-full">
              <div className="flex items-start">
                <SettingOutlined className="text-lg text-green-500 mt-1 mr-2" />
                <div>
                  <Text strong>Optimización Automática</Text>
                  <div className="text-sm text-gray-600 mt-1">
                    Compresión WebP y nombres SEO-friendly configurables
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" bordered={false} className="bg-white bg-opacity-70 h-full">
              <div className="flex items-start">
                <IdcardOutlined className="text-lg text-blue-500 mt-1 mr-2" />
                <div>
                  <Text strong>Identificador</Text>
                  <div className="text-sm text-gray-600 mt-1">
                    Úsalo en Excel para asociar imágenes a productos
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" bordered={false} className="bg-white bg-opacity-70 h-full">
              <div className="flex items-start">
                <TagOutlined className="text-lg text-blue-500 mt-1 mr-2" />
                <div>
                  <Text strong>Etiquetas</Text>
                  <div className="text-sm text-gray-600 mt-1">
                    Facilitan búsqueda y organización de los grupos
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <CreateGroupModal 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />

      <OptimizationConfigModal
        visible={isConfigModalVisible}
        onClose={() => setIsConfigModalVisible(false)}
      />
    </div>
  );
};

export default HeaderImageManager;