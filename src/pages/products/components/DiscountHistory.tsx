// src/pages/products/components/DiscountHistory.tsx
import React from 'react';
import { Table, Typography, Tag, Spin, Empty, Alert, Card, Divider } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import DiscountService from '../../../services/discount.service';

const { Text } = Typography;

interface DiscountHistoryProps {
  productId: string;
}

const DiscountHistory: React.FC<DiscountHistoryProps> = ({ productId }) => {
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['discountHistory', productId, pagination.current],
    queryFn: () => DiscountService.getDiscountHistory(
      productId, 
      pagination.current, 
      pagination.pageSize
    ),
    enabled: !!productId,
  });

  const handleTableChange = (pagination: any) => {
    setPagination((prev) => ({
      ...prev,
      current: pagination.current,
    }));
  };

  React.useEffect(() => {
    if (data?.pagination) {
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    }
  }, [data]);

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Cambios',
      dataIndex: 'changes',
      key: 'changes',
      render: (_, record) => {
        // If there's no previous or current data, return empty
        if (!record.previous && !record.current) {
          return <Text type="secondary">No hay cambios disponibles</Text>;
        }

        // We'll use current data for display, falling back to previous if needed
        const discountData = record.current || record.previous || {};
        
        // Always show important discount information, even if it didn't change
        const discountInfo = [];
        
        // Show discount type
        if (discountData.discountType) {
          const typeLabel = discountData.discountType === 'permanent' ? 'Permanente' : 'Temporal';
          discountInfo.push(
            <div key="type">
              <Text strong>Tipo de descuento: </Text>
              <Tag color="blue">{typeLabel}</Tag>
            </div>
          );
        }
        
        // Show active status
        if (discountData.isActive !== undefined) {
          discountInfo.push(
            <div key="active">
              <Text strong>Estado: </Text>
              <Tag color={discountData.isActive ? "green" : "red"}>
                {discountData.isActive ? 'Activo' : 'Inactivo'}
              </Tag>
            </div>
          );
        }
        
        // Show percentage
        if (discountData.percentage !== undefined) {
          discountInfo.push(
            <div key="percentage">
              <Text strong>Porcentaje: </Text>
              <Tag color="orange">{discountData.percentage}%</Tag>
            </div>
          );
        }
        
        // Show date range for temporary discounts
        if (discountData.discountType === 'temporary' && discountData.startDate && discountData.endDate) {
          const startDate = dayjs(discountData.startDate).format('DD/MM/YYYY');
          const endDate = dayjs(discountData.endDate).format('DD/MM/YYYY');
          discountInfo.push(
            <div key="dateRange">
              <Text strong>Período: </Text>
              <Tag color="cyan">{startDate} - {endDate}</Tag>
            </div>
          );
        }
        
        // Generate changes by comparing previous and current objects
        const changes = [];
        const previous = record.previous || {};
        const current = record.current || {};
        
        // Get all unique keys from both objects
        const allKeys = [...new Set([...Object.keys(previous), ...Object.keys(current)])];
        
        // For each key, check if there's a difference
        allKeys.forEach(field => {
          if (JSON.stringify(previous[field]) !== JSON.stringify(current[field])) {
            changes.push({
              field,
              oldValue: previous[field],
              newValue: current[field]
            });
          }
        });
        
        return (
          <div className="space-y-2">
            {/* Always show discount information section */}
            {discountInfo.length > 0 && (
              <Card size="small" title="Información del descuento" className="mb-2">
                <div className="space-y-1">
                  {discountInfo}
                </div>
              </Card>
            )}
            
            {/* Show changes if there are any */}
            {changes.length > 0 && (
              <>
                <Divider orientation="left" plain style={{ margin: '12px 0' }}>
                  <Text type="secondary">Cambios realizados</Text>
                </Divider>
                <div className="space-y-1">
                  {changes.map((change, index) => {
                    let oldValue = change.oldValue;
                    let newValue = change.newValue;
                    
                    // Format values based on field type
                    if (change.field === 'percentage' || change.field === 'discount_percentage') {
                      oldValue = oldValue ? `${oldValue}%` : 'N/A';
                      newValue = newValue ? `${newValue}%` : 'N/A';
                    } else if (change.field === 'price' || change.field === 'old_price') {
                      oldValue = oldValue ? `$${Number(oldValue).toLocaleString('es-CO')}` : 'N/A';
                      newValue = newValue ? `$${Number(newValue).toLocaleString('es-CO')}` : 'N/A';
                    } else if (change.field === 'startDate' || change.field === 'endDate') {
                      oldValue = oldValue ? dayjs(oldValue).format('DD/MM/YYYY') : 'N/A';
                      newValue = newValue ? dayjs(newValue).format('DD/MM/YYYY') : 'N/A';
                    } else if (change.field === 'isActive' || change.field === 'active') {
                      oldValue = oldValue ? 'Activo' : 'Inactivo';
                      newValue = newValue ? 'Activo' : 'Inactivo';
                    } else if (change.field === 'discountType') {
                      oldValue = oldValue === 'permanent' ? 'Permanente' : oldValue === 'temporary' ? 'Temporal' : 'N/A';
                      newValue = newValue === 'permanent' ? 'Permanente' : newValue === 'temporary' ? 'Temporal' : 'N/A';
                    }
                    
                    return (
                      <div key={index}>
                        <Text strong>{change.field}: </Text>
                        <Tag color="red">{oldValue}</Tag>
                        <span>→</span>
                        <Tag color="green">{newValue}</Tag>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );
      },
    },
    {
      title: 'Razón',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => reason || <Text type="secondary">No especificada</Text>,
    },
    {
      title: 'Usuario',
      dataIndex: ['changedBy', 'name'],
      key: 'user',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description="No se pudo cargar el historial de descuentos"
        type="error"
        showIcon
      />
    );
  }

  if (!data?.history?.length) {
    return <Empty description="No hay historial de descuentos disponible" />;
  }

  return (
    <Table
      columns={columns}
      dataSource={data.history}
      rowKey="_id"
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: false,
      }}
      onChange={handleTableChange}
      size="small"
    />
  );
};

export default DiscountHistory;