import type React from "react";
import { useState } from "react";
import { Modal, Button, Tabs, Typography, Popconfirm, message, Badge, Card, Divider } from "antd";
import { DeleteOutlined, HistoryOutlined, PercentageOutlined, TagOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DiscountHistory from "./DiscountHistory";
// Asegúrate que la importación de Product usa la versión actualizada
import type { Product } from "../../../api/types";
import DiscountForm from "./DiscountForm";
// Asume que DiscountData ahora coincide con la estructura esperada por el servicio/backend
import DiscountService, { type DiscountData } from "../../../services/discount.service";
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface DiscountModalProps {
  open: boolean;
  onClose: () => void;
  // El modal recibe el objeto Product completo (o ProductListItem si se ajustó el paso)
  product: Product;
}

const DiscountModal: React.FC<DiscountModalProps> = ({ open, onClose, product }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("1");

  // Determinar si hay descuento y calcular precio original
  const hasDiscount = product.discount?.isActive === true;
  // Calcular precio original (base) a partir del precio actual y el porcentaje
  const calculatedOldPrice = hasDiscount && product.discount.percentage > 0 
    ? Math.round(product.price / (1 - product.discount.percentage / 100))
    : product.price;

  // Preparar datos iniciales para el formulario
  const initialDiscountData: DiscountData = hasDiscount
    ? {
        isActive: true,
        type: product.discount.type || "permanent",
        percentage: product.discount.percentage,
        startDate: product.discount.startDate ? new Date(product.discount.startDate) : undefined,
        endDate: product.discount.endDate ? new Date(product.discount.endDate) : undefined,
        old_price: calculatedOldPrice
      }
    : {
        isActive: false,
        type: "permanent",
        percentage: 0,
        old_price: product.price
      };

  // Mutación para aplicar descuento
  const applyDiscountMutation = useMutation({
    mutationFn: (discountData: DiscountData) => DiscountService.applyDiscount(product.id, discountData),
    onSuccess: () => {
      message.success("Descuento aplicado correctamente");
      // Invalida queries que dependen de los datos del producto
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Para la lista
      queryClient.invalidateQueries({ queryKey: ["product", product.id] }); // Para detalles si existe
      onClose();
    },
    onError: (error: any) => {
      message.error(`Error al aplicar descuento: ${error?.response?.data?.message || error.message}`);
    },
  });

  // Mutación para eliminar descuento
  const removeDiscountMutation = useMutation({
    mutationFn: () => DiscountService.removeDiscount(product.id),
    onSuccess: () => {
      message.success("Descuento eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", product.id] });
      onClose();
    },
    onError: (error: any) => {
      message.error(`Error al eliminar descuento: ${error?.response?.data?.message || error.message}`);
    },
  });

  const handleSubmit = (values: DiscountData) => {
    // Asegurarse de que los datos tienen el formato correcto para el backend
    const dataToSubmit: DiscountData = {
      isActive: values.isActive,
      type: values.type || "permanent",
      percentage: values.percentage,
      startDate: values.type === "temporary" ? values.startDate : undefined,
      endDate: values.type === "temporary" ? values.endDate : undefined
    };
    
    applyDiscountMutation.mutate(dataToSubmit);
  };

  const handleRemoveDiscount = () => {
    removeDiscountMutation.mutate();
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null || isNaN(price)) return "-";
    return price.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <Modal
      title={
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <PercentageOutlined className="text-red-500 mr-2 text-xl" />
            <span className="text-lg font-medium">Gestión de Descuentos</span>
          </div>
          {/* Mostrar botón de eliminar solo si hay descuento activo */}
          {hasDiscount && (
            <Popconfirm
              title="¿Eliminar descuento?"
              description="Esta acción restablecerá el precio original del producto."
              onConfirm={handleRemoveDiscount}
              okText="Sí"
              cancelText="No"
              placement="left"
              okButtonProps={{ danger: true, loading: removeDiscountMutation.isPending }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={removeDiscountMutation.isPending}
                className="hover:scale-105 transition-transform"
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
      className="discount-modal"
      destroyOnClose
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="mb-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <Title level={5} className="m-0 mb-2">
                {product.name}
              </Title>
              <div className="flex flex-wrap gap-2 items-center">
                <Text className="text-gray-500">Precio actual:</Text>
                <Text strong className="text-lg">
                  {formatPrice(product.price)}
                </Text>

                {/* Mostrar precio original calculado si hay descuento */}
                {hasDiscount && (
                  <>
                    <Divider type="vertical" className="hidden sm:block" />
                    <Text className="text-gray-500">Precio original:</Text>
                    <Text delete className="text-gray-500">
                      {formatPrice(calculatedOldPrice)}
                    </Text>
                  </>
                )}
              </div>
            </div>

            {/* Mostrar tarjeta de porcentaje de descuento */}
            {hasDiscount && (
              <div className="mt-3 sm:mt-0">
                <Badge.Ribbon text="OFERTA" color="red">
                  <Card className="bg-red-50 border border-red-100 w-32 h-20 flex items-center justify-center flex-col">
                    <Text className="text-2xl font-bold text-red-500">{product.discount.percentage}%</Text>
                    <Text className="text-red-500 text-xs">descuento</Text>
                  </Card>
                </Badge.Ribbon>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="discount-tabs"
        items={[
          {
            key: "1",
            label: (
              <span className="flex items-center">
                <TagOutlined className="mr-1" />
                Configurar Descuento
              </span>
            ),
            children: (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                {!hasDiscount && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start">
                    <InfoCircleOutlined className="text-blue-500 mr-2 mt-1" />
                    <div>
                      <Text strong className="text-blue-700 block mb-1">Información</Text>
                      <Text className="text-blue-600">
                        Este producto no tiene descuentos aplicados actualmente. Complete el formulario para aplicar un descuento.
                      </Text>
                    </div>
                  </div>
                )}

                <DiscountForm
                  initialValues={initialDiscountData}
                  originalPrice={product.price}
                  currentPrice={product.price}
                  onSubmit={handleSubmit}
                  onCancel={onClose}
                  loading={applyDiscountMutation.isPending}
                />
              </motion.div>
            ),
          },
          {
            key: "2",
            label: (
              <span className="flex items-center">
                <HistoryOutlined className="mr-1" />
                Historial de Descuentos
              </span>
            ),
            children: (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <DiscountHistory productId={product.id} />
              </motion.div>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default DiscountModal;