import React, { useState, useEffect } from "react";
import { Table, Input, Select, Button, Tag, Empty, Spin, Pagination, Alert, Card, Tooltip } from "antd";
import { SearchOutlined, CarOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import VehicleApplicabilityGroupsService, { CompatibleVehiclesResponse } from "../../../services/vehicle-applicability-groups.service";

const { Option } = Select;

interface CompatibleVehiclesViewerProps {
  groupId: string;
  isOpen?: boolean;
}

const CompatibleVehiclesViewer: React.FC<CompatibleVehiclesViewerProps> = ({ groupId, isOpen = true }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Consulta para obtener vehículos compatibles - Actualizada para React Query v5
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery<CompatibleVehiclesResponse>({
    queryKey: ["compatibleVehicles", groupId, page, pageSize],
    queryFn: () => VehicleApplicabilityGroupsService.getCompatibleVehicles(groupId, { 
      page, 
      limit: pageSize,
      useCache: !isSearching // No usar caché durante búsquedas activas
    }),
    enabled: !!groupId && isOpen,
    placeholderData: (prev) => prev, // Reemplaza keepPreviousData en v5
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos (reemplazo para cacheTime)
    meta: {
      onSettled: () => {
        setIsSearching(false);
      }
    }
  });

  // Actualizar la consulta cuando cambia la página
  useEffect(() => {
    if (groupId && isOpen) {
      refetch();
    }
  }, [page, pageSize, groupId, isOpen, refetch]);

  // Manejar cambio de página
  const handlePageChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  // Manejar búsqueda
  const handleSearch = () => {
    setIsSearching(true);
    setPage(1); // Reiniciar a la primera página
    refetch();
  };

  // Efecto para gestionar el estado de búsqueda después de una consulta
  useEffect(() => {
    if (!isFetching && isSearching) {
      setIsSearching(false);
    }
  }, [isFetching, isSearching]);

  // Columnas para la tabla
  const columns = [
    {
      title: "Marca",
      dataIndex: ["model_id", "family_id", "brand_id", "name"],
      key: "brand",
      render: (text: string, record: any) => {
        return text || "N/A";
      }
    },
    {
      title: "Familia",
      dataIndex: ["model_id", "family_id", "name"],
      key: "family",
      render: (text: string) => text || "N/A"
    },
    {
      title: "Modelo",
      dataIndex: ["model_id", "year"],
      key: "model",
      render: (text: string, record: any) => {
        
        return text ? `${text}` : "N/A";
      }
    },
    {
      title: "Transmisión",
      dataIndex: ["transmission_id", "name"],
      key: "transmission",
      render: (text: string) => text || "N/A"
    },
    {
      title: "Combustible",
      dataIndex: ["fuel_id", "name"],
      key: "fuel",
      render: (text: string) => text || "N/A"
    },
    {
      title: "Motor",
      dataIndex: ["model_id", "engine_type"],
      key: "engine",
      render: (text: string) => text || "N/A"
    },
    {
      title: "Estado",
      key: "status",
      render: (_: any, record: any) => (
        <Tag color={record.active ? "green" : "red"}>
          {record.active ? "Activo" : "Inactivo"}
        </Tag>
      )
    }
  ];

  if (!isOpen) return null;

  if (isError) {
    return (
      <Alert
        message="Error"
        description={`Error al cargar vehículos compatibles: ${error instanceof Error ? error.message : 'Error desconocido'}`}
        type="error"
        showIcon
      />
    );
  }

  return (
    <Card className="mt-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Buscar vehículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              style={{ maxWidth: 300 }}
            />
            <Select
              placeholder="Filtrar por"
              style={{ width: 150 }}
              allowClear
              value={filterType}
              onChange={setFilterType}
            >
              <Option value="brand">Marca</Option>
              <Option value="model">Modelo</Option>
              <Option value="year">Año</Option>
              <Option value="transmission">Transmisión</Option>
              <Option value="fuel">Combustible</Option>
            </Select>
            <Button 
              type="primary" 
              onClick={handleSearch}
              icon={<FilterOutlined />}
            >
              Filtrar
            </Button>
          </div>

          <Tooltip title="Actualizar lista">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchTerm("");
                setFilterType(null);
                refetch();
              }}
              loading={isFetching}
            >
              Actualizar
            </Button>
          </Tooltip>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" tip="Cargando vehículos compatibles..." />
          </div>
        ) : data && data.vehicles && data.vehicles.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={data.vehicles}
              rowKey={(record) => record._id}
              pagination={false}
              size="small"
              scroll={{ x: "max-content" }}
            />

            <div className="flex justify-end mt-4">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={data.pagination?.total || 0}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `Total: ${total} vehículos`}
              />
            </div>
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                No se encontraron vehículos compatibles con este grupo
              </span>
            }
          >
            <div className="flex justify-center">
              <Tag icon={<CarOutlined />} color="blue">
                Intenta modificar los criterios de aplicabilidad
              </Tag>
            </div>
          </Empty>
        )}
      </div>
    </Card>
  );
};

export default CompatibleVehiclesViewer; 