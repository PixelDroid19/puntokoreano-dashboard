import React from 'react';
import { Badge, Tooltip } from 'antd';
import { useQuery } from '@tanstack/react-query';
import StorageService from '../../../services/storage.service';

const OptimizationStatusBadge: React.FC = () => {
  const { data: configData, isLoading } = useQuery({
    queryKey: ['optimizationConfig'],
    queryFn: () => StorageService.getOptimizationConfig(),
    refetchInterval: 30000, 
  });

  if (isLoading || !configData?.data?.currentConfig) {
    return null;
  }

  const config = configData.data.currentConfig;
  
  const getStatusColor = () => {
    if (config.enableCompression && config.format === 'webp' && config.seoFriendlyNames) {
      return 'success';
    }
    if (config.enableCompression) {
      return 'processing';
    }
    return 'warning';
  };

  const getStatusText = () => {
    if (config.enableCompression && config.format === 'webp' && config.seoFriendlyNames) {
      return 'Optimización Completa';
    }
    if (config.enableCompression) {
      return 'Optimización Básica';
    }
    return 'Sin Optimizar';
  };

  return (
    <Tooltip
      title={
        <div className="space-y-2">
          <div><strong>Configuración Actual:</strong></div>
          <div>• Calidad: {config.quality}%</div>
          <div>• Formato: {config.format.toUpperCase()}</div>
          <div>• Dimensiones máx: {config.maxWidth}x{config.maxHeight}px</div>
          <div>• Compresión: {config.enableCompression ? 'Habilitada' : 'Deshabilitada'}</div>
          <div>• SEO Names: {config.seoFriendlyNames ? 'Habilitado' : 'Deshabilitado'}</div>
        </div>
      }
    >
      <Badge status={getStatusColor()} text={getStatusText()} />
    </Tooltip>
  );
};

export default OptimizationStatusBadge; 