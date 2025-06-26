import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Empty,
  Spin,
  Pagination,
  Alert,
  Card,
  Tooltip,
  Space,
} from "antd";
import {
  SearchOutlined,
  CarOutlined,
  ReloadOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import VehicleApplicabilityGroupsService, {
  CompatibleVehiclesResponse,
} from "../../../services/vehicle-applicability-groups.service";

interface CompatibleVehiclesViewerProps {
  groupId: string;
  isOpen?: boolean;
}

const CompatibleVehiclesViewer: React.FC<CompatibleVehiclesViewerProps> = ({
  groupId,
  isOpen = true,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounce del término de búsqueda
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  
  // Ref para cancelar requests pendientes
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setPage(1);
    }
  }, [debouncedSearchTerm, searchTerm]);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useQuery<CompatibleVehiclesResponse>({
      queryKey: ["compatibleVehicles", groupId, page, pageSize, debouncedSearchTerm],
      queryFn: async () => {
        // Cancelar request anterior si existe
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        // Crear nuevo abort controller
        abortControllerRef.current = new AbortController();
        
        setIsSearching(true);
        
        try {
          const result = await VehicleApplicabilityGroupsService.getCompatibleVehicles(groupId, {
          page,
          limit: pageSize,
            search: debouncedSearchTerm.trim() || undefined,
            useCache: !debouncedSearchTerm.trim(), // Solo usar caché si no hay búsqueda
          });
          
          return result;
        } finally {
          setIsSearching(false);
        }
      },
      enabled: !!groupId && isOpen,
      placeholderData: (prev) => prev,
      staleTime: debouncedSearchTerm.trim() ? 0 : 2 * 60 * 1000, // Sin caché para búsquedas
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error: any) => {
        // No reintentar si es un error de cancelación
        if (error?.name === 'AbortError') {
          return false;
        }
        return failureCount < 2;
      },
    });

  // Limpiar abort controller al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    };
  }, []);

  // Manejar cambio de página
  const handlePageChange = useCallback((newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPage(1); // Resetear a primera página cuando cambia el tamaño
    }
  }, [pageSize]);

  // Manejar limpieza de búsqueda
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setPage(1);
  }, []);

  // Manejar actualización manual
  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  // Columnas para la tabla
  const columns = [
    {
      title: "Marca",
      dataIndex: ["model_id", "family_id", "brand_id", "name"],
      key: "brand",
      render: (text: string) => (
        <span className="font-medium text-blue-600">
          {text || "N/A"}
        </span>
      ),
      sorter: false,
    },
    {
      title: "Familia",
      dataIndex: ["model_id", "family_id", "name"],
      key: "family",
      render: (text: string) => text || "N/A",
      sorter: false,
    },
    {
      title: "Modelo",
      key: "model",
      render: (_: any, record: any) => {
        const familyName = record.model_id?.family_id?.name || "N/A";
        const years = record.model_id?.year;
        const yearText = Array.isArray(years) && years.length > 0 
          ? ` (${years.join(", ")})` 
          : "";

 
        return (
          <span>
          {/*   {familyName} */}
            {yearText && <span className="text-gray-500 text-sm">{yearText}</span>}
          </span>
        );
      },
    },
    {
      title: "Transmisión",
      dataIndex: ["transmission_id", "name"],
      key: "transmission",
      render: (text: string) => (
        <Tag color="blue">{text || "N/A"}</Tag>
      ),
    },
    {
      title: "Combustible",
      dataIndex: ["fuel_id", "name"],
      key: "fuel",
      render: (text: string) => (
        <Tag color="orange">{text || "N/A"}</Tag>
      ),
    },
    {
      title: "Motor",
      dataIndex: ["model_id", "engine_type"],
      key: "engine",
      render: (text: string) => (
        <Tag color="purple">{text || "N/A"}</Tag>
      ),
    },
    {
      title: "Estado",
      key: "status",
      render: (_: any, record: any) => (
        <Tag color={record.active ? "green" : "red"}>
          {record.active ? "Activo" : "Inactivo"}
        </Tag>
      ),
    },
  ];

  if (!isOpen) return null;

  if (isError) {
    return (
      <Alert
        message="Error"
        description={`Error al cargar vehículos compatibles: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={handleRefresh}>
            Reintentar
          </Button>
        }
      />
    );
  }

  const isSearchActive = debouncedSearchTerm.trim().length > 0;
  const isLoadingOrSearching = isLoading || isFetching || isSearching;

  return (
    <Card 
      className="mt-4"
      title={
        <div className="flex items-center space-x-2">
          <CarOutlined className="text-blue-600" />
          <span>Vehículos Compatibles</span>
          {data?.pagination && (
            <Tag color="blue">
              {data.pagination.total} vehículo{data.pagination.total !== 1 ? 's' : ''}
            </Tag>
          )}
        </div>
      }
    >
      <div className="flex flex-col space-y-4">
        {/* Barra de búsqueda */}
        <div className="flex gap-2 items-center">
            <Input
            placeholder="Buscar por marca, modelo, año, transmisión, combustible..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
            suffix={
              searchTerm && (
                <Button
                  type="text"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={handleClearSearch}
                  disabled={isLoadingOrSearching}
                />
              )
            }
            className="flex-1"
            disabled={isLoadingOrSearching}
            allowClear={false}
          />

          <Tooltip title="Actualizar lista">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isLoadingOrSearching}
              disabled={isLoadingOrSearching}
            >
              Actualizar
            </Button>
          </Tooltip>
        </div>

        {/* Indicador de búsqueda activa */}
        {isSearchActive && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <SearchOutlined className="text-blue-600" />
              <span className="text-blue-800">
                Búsqueda activa: <strong>"{debouncedSearchTerm}"</strong>
              </span>
              {data?.searchTerm && (
                <Tag color="blue">
                  {data.pagination?.total || 0} resultado{(data.pagination?.total || 0) !== 1 ? 's' : ''}
                </Tag>
              )}
            </div>
            <Button 
              size="small" 
              onClick={handleClearSearch}
              disabled={isLoadingOrSearching}
            >
              Limpiar búsqueda
            </Button>
          </div>
        )}

        {/* Tabla de resultados */}
        {isLoadingOrSearching ? (
          <div className="flex justify-center py-8">
            <Spin 
              size="large" 
              tip={isSearching ? "Buscando vehículos..." : "Cargando vehículos compatibles..."} 
            />
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
              loading={isLoadingOrSearching}
            />

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Mostrando {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, data.pagination?.total || 0)} de {data.pagination?.total || 0} vehículos
              </div>
              
              <Pagination
                current={page}
                pageSize={pageSize}
                total={data.pagination?.total || 0}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} de ${total} vehículos`
                }
                disabled={isLoadingOrSearching}
                pageSizeOptions={['5', '10', '20', '50']}
              />
            </div>
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" className="text-center">
              <span>
                  {isSearchActive 
                    ? `No se encontraron vehículos que coincidan con "${debouncedSearchTerm}"`
                    : "No se encontraron vehículos compatibles con este grupo"
                  }
              </span>
                {isSearchActive && (
                  <Button type="link" onClick={handleClearSearch}>
                    Ver todos los vehículos
                  </Button>
                )}
              </Space>
            }
          >
            <div className="flex justify-center">
              <Tag icon={<CarOutlined />} color="blue">
                {isSearchActive 
                  ? "Intenta con otros términos de búsqueda"
                  : "Intenta modificar los criterios de aplicabilidad"
                }
              </Tag>
            </div>
          </Empty>
        )}
      </div>
    </Card>
  );
};

export default CompatibleVehiclesViewer;
