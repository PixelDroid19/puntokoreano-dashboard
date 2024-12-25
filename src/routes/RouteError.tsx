// src/routes/RouteError.tsx
import { Button, Result, Space } from 'antd';
import { useNavigate, useRouteError } from 'react-router-dom';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';

const RouteError = () => {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Result
        status="warning"
        title="Error de navegación"
        subTitle={
          <Space direction="vertical">
            <span>No pudimos cargar esta página</span>
            {import.meta.env.DEV && (
              <span className="text-sm text-red-500">
                {error?.message || 'Error desconocido'}
              </span>
            )}
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
            <Button
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
            >
              Ir al inicio
            </Button>
          </Space>
        }
      />
    </div>
  );
};

export default RouteError;