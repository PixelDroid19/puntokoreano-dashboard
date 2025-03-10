// src/pages/products/components/DiscountModal.tsx
import React, { useState } from 'react';
import { Modal, Button, Tabs, Space, Typography, Popconfirm, message } from 'antd';
import { DeleteOutlined, HistoryOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DiscountHistory from './DiscountHistory';
import { Product } from '../../../api/types';
import DiscountForm from './DiscountForm';
import DiscountService, { DiscountData } from '../../../services/discount.service';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface DiscountModalProps {
  open: boolean;
  onClose: () => void;
  product: Product;
}

const DiscountModal: React.FC<DiscountModalProps> = ({ open, onClose, product }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('1');
  
  // Get current discount data from product if it exists
  const hasDiscount = product.old_price !== undefined && product.old_price > product.price;
  
  // Calculate initial discount data if product has a discount
  const initialDiscountData: DiscountData | undefined = hasDiscount ? {
    isActive: true,
    type: 'permanent', // Default to permanent since we don't know the type from product data
    percentage: product.discount_percentage,
    old_price: product.old_price,
    reason: ''
  } : undefined;

  // Mutation to apply discount
  const applyDiscountMutation = useMutation({
    mutationFn: (discountData: DiscountData) => 
      DiscountService.applyDiscount(product.id, discountData),
    onSuccess: () => {
      message.success('Descuento aplicado correctamente');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (error: Error) => {
      message.error(`Error al aplicar descuento: ${error.message}`);
    }
  });

  // Mutation to remove discount
  const removeDiscountMutation = useMutation({
    mutationFn: () => DiscountService.removeDiscount(product.id),
    onSuccess: () => {
      message.success('Descuento eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (error: Error) => {
      message.error(`Error al eliminar descuento: ${error.message}`);
    }
  });

  const handleSubmit = (values: DiscountData) => {
    applyDiscountMutation.mutate(values);
  };

  const handleRemoveDiscount = () => {
    removeDiscountMutation.mutate();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Gestión de Descuentos</span>
          {hasDiscount && (
            <Popconfirm
              title="¿Eliminar descuento?"
              description="Esta acción eliminará el descuento actual del producto."
              onConfirm={handleRemoveDiscount}
              okText="Sí"
              cancelText="No"
            >
              <Button 
                danger 
                icon={<DeleteOutlined />}
                loading={removeDiscountMutation.isPending}
              >
                Eliminar Descuento
              </Button>
            </Popconfirm>
          )}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>{product.name}</Title>
        <Space>
          <Text>Precio actual:</Text>
          <Text strong>
            {product.price.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
            })}
          </Text>
          
          {hasDiscount && (
            <>
              <Text>Precio original:</Text>
              <Text delete>
                {product.old_price?.toLocaleString('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                })}
              </Text>
              
              <Text>Descuento:</Text>
              <Text type="danger">{product.discount_percentage}%</Text>
            </>
          )}
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Configurar Descuento" key="1">
          <DiscountForm
            initialValues={initialDiscountData}
            productPrice={product.price}
            onSubmit={handleSubmit}
            onCancel={onClose}
            loading={applyDiscountMutation.isPending}
          />
        </TabPane>
        <TabPane tab="Historial de Descuentos" key="2">
          <DiscountHistory productId={product.id} />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default DiscountModal;