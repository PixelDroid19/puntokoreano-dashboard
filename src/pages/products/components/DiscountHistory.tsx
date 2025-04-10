// src/pages/products/components/DiscountHistory.tsx
import React, { useState } from 'react';
import { Table, Typography, Tag, Empty, Spin, Button } from 'antd';
import { DiscountHistoryItem } from '../../../services/discount.service';
import { useQuery } from '@tanstack/react-query';
import DiscountService from '../../../services/discount.service';
import dayjs from 'dayjs';

const { Text } = Typography;

interface DiscountHistoryProps {
  productId: string;
}

const DiscountHistory: React.FC<DiscountHistoryProps> = ({ productId }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['discountHistory', productId, page, pageSize],
    queryFn: () => DiscountService.getDiscountHistory(productId, page, pageSize),
    enabled: !!productId, // Solo ejecutar cuando hay un productId
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const formatAction = (action: string) => {
    const actions: Record<string, { text: string; color: string }> = {
      apply: { text: 'Aplicado', color: 'green' },
      remove: { text: 'Eliminado', color: 'red' },
      update: { text: 'Actualizado', color: 'blue' },
    };

    const info = actions[action] || { text: action, color: 'default' };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return `${value}%`;
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '-';
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Acción',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => formatAction(action),
    },
    {
      title: 'Estado Anterior',
      dataIndex: 'previousState',
      key: 'previousState',
      render: (previousState: DiscountHistoryItem['previousState']) => (
        <div>
          <Text>{previousState.hasDiscount ? 'Activo' : 'Inactivo'}</Text>
          <br />
          {previousState.hasDiscount && (
            <Text type="secondary">
              {formatPercentage(previousState.discountValue)} / {previousState.discountType === 'percentage' ? 'Porcentaje' : 'Fijo'}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Estado Nuevo',
      dataIndex: 'currentState',
      key: 'currentState',
      render: (currentState: DiscountHistoryItem['currentState']) => (
        <div>
          <Text>{currentState.hasDiscount ? 'Activo' : 'Inactivo'}</Text>
          <br />
          {currentState.hasDiscount && (
            <Text type="secondary">
              {formatPercentage(currentState.discountValue)} / {currentState.discountType === 'percentage' ? 'Porcentaje' : 'Fijo'}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Precio Final',
      dataIndex: ['currentState', 'finalPrice'],
      key: 'finalPrice',
      render: (finalPrice: number) => formatPrice(finalPrice),
    },
    {
      title: 'Usuario',
      dataIndex: ['user', 'name'],
      key: 'user',
      render: (_, record: DiscountHistoryItem) => record.user?.name || '-',
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <Spin tip="Cargando historial..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center my-8">
        <Text type="danger">Error al cargar el historial de descuentos</Text>
        <br />
        <Button
          type="primary"
          onClick={() => {
            // Reintentar la consulta
            window.location.reload();
          }}
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (!data?.history || data.history.length === 0) {
    return (
      <Empty
        description="No hay historial de descuentos para este producto"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="my-8"
      />
    );
  }

  return (
    <div className="discount-history">
      <Table
        columns={columns}
        dataSource={data.history}
        rowKey="_id"
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data.pagination.total,
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            if (newPageSize) setPageSize(newPageSize);
          },
          showSizeChanger: true,
        }}
        scroll={{ x: 'max-content' }}
        size="small"
      />
    </div>
  );
};

export default DiscountHistory;