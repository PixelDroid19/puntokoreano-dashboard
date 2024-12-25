// src/components/ErrorBoundary.tsx
import React from 'react';
import { Button, Result, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Aquí podrías enviar el error a un servicio de logging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

// Componente separado para mostrar el error
const ErrorDisplay: React.FC<{
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}> = ({ error, errorInfo }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Result
        status="error"
        title="Oops! Algo salió mal"
        subTitle={
          <Space direction="vertical" size="small">
            <Text>Lo sentimos, ha ocurrido un error inesperado.</Text>
            {import.meta.env.DEV && (
              <Text type="danger" className="text-sm">
                {error?.message}
              </Text>
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
              Recargar página
            </Button>
            <Button
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
            >
              Ir al inicio
            </Button>
          </Space>
        }
      >
        {import.meta.env.DEV && errorInfo && (
          <div className="mt-4">
            <details className="whitespace-pre-wrap">
              <summary className="text-sm text-gray-500 cursor-pointer">
                Detalles técnicos
              </summary>
              <Text className="text-xs" type="secondary">
                {errorInfo.componentStack}
              </Text>
            </details>
          </div>
        )}
      </Result>
    </div>
  );
};

export default ErrorBoundary;