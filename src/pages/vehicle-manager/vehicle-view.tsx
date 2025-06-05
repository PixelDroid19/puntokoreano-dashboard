import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Popconfirm,
  Switch,
  message,
  Tooltip,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileExcelOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import VehicleFamiliesService, { GetVehiclesResponse } from "../../services/vehicle-families.service";
import VehicleMainForm from "./forms/VehicleMainForm";
import VehicleImportModal from "./components/VehicleImportModal";
import { axiosInstance } from "../../utils/axios-interceptor";
import ENDPOINTS from "../../api";

interface Vehicle {
  _id: string;
  color: string | null;
  price: number | null;
  transmission_id: { _id: string; name: string } | null;
  fuel_id: { _id: string; name: string } | null;
  model_id: { 
    _id: string; 
    displayName?: string;
    engine_type?: string;
    year?: number[];
    family_id?: {
      name?: string;
      brand_id?: {
        name?: string;
      };
    };
  } | null;
  active: boolean;
}

interface QueryParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  search: string;
  activeOnly: boolean;
}

const VehicleView: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    search: "",
    activeOnly: true,
  });

  const { data: apiResponse, isLoading } = useQuery<GetVehiclesResponse>({
    queryKey: ["vehicles", queryParams],
    queryFn: () => VehicleFamiliesService.getVehicles(queryParams),
  });

  const vehiclesData = apiResponse?.vehicles;
  const paginationData = apiResponse?.pagination;

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      VehicleFamiliesService.updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      message.success("Vehículo actualizado correctamente");
      setIsModalVisible(false);
    },
    onError: (error: any) => {
      message.error(
        `Error al actualizar el vehículo: ${
          error.message || "Error desconocido"
        }`
      );
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => VehicleFamiliesService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      message.success("Vehículo eliminado correctamente");
      if (vehiclesData?.length === 1 && queryParams.page > 1) {
        setQueryParams((prev) => ({ ...prev, page: prev.page - 1 }));
      }
    },
    onError: (error: any) => {
      message.error(
        `Error al eliminar el vehículo: ${error.message || "Error desconocido"}`
      );
      console.error(error);
    },
  });

  const handleSearch = () => {
    setQueryParams((prevParams) => ({
      ...prevParams,
      search: searchText,
      page: 1,
    }));
  };

  const handleEdit = (record: Vehicle) => {
    setEditingVehicle(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setQueryParams((prevParams) => ({
      ...prevParams,
      page: pagination.current,
      limit: pagination.pageSize,
      sortBy: sorter.field || "createdAt",
      sortOrder:
        sorter.order === "ascend"
          ? "asc"
          : sorter.order === "descend"
          ? "desc"
          : prevParams.sortOrder,
    }));
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingVehicle(null);
    form.resetFields();
  };

  const getModelDisplayName = (model: Vehicle['model_id']) => {
    if (!model) return "N/D";
    
    if (model.displayName) {
      return model.displayName;
    }
    
    // Construir el nombre si no está disponible displayName
    const familyName = model.family_id?.name || "";
    const engineType = model.engine_type || "";

    
    return `${familyName} ${engineType}`.trim() || "N/D";
  };

  const columns = [
    {
      title: (
        <div className="flex items-center gap-1">
          <span>Identificador del Vehículo</span>
          <Tooltip 
            title="Este es el identificador único asignado al vehículo al momento de crearlo. Se utiliza para asociar el vehículo con productos cuando se cargan mediante Excel."
            placement="top"
          >
            <InfoCircleOutlined className="text-blue-500 cursor-help text-xs" />
          </Tooltip>
        </div>
      ),
      dataIndex: "tag_id",
      key: "tag_id",
    },
    {
      title: "Modelo",
      key: "model",
      render: (_: any, record: Vehicle) => getModelDisplayName(record.model_id),
    },
    {
      title: "Transmisión",
      dataIndex: ["transmission_id", "name"],
      key: "transmission",
      render: (_: any, record: any) => record.transmission_id?.name || "N/D",
    },
    {
      title: "Combustible",
      dataIndex: ["fuel_id", "name"],
      key: "fuel",
      render: (_: any, record: any) => record.fuel_id?.name || "N/D",
    },
  
    {
      title: "Estado",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <span style={{ color: active ? "green" : "red" }}>
          {active ? "Activo" : "Inactivo"}
        </span>
      ),
      align: "center" as const,
    },
    {
      title: "Acciones",
      key: "actions",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Editar Vehículo">
            <Button
              type="default"
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => {}}
              aria-label={`Editar vehículo ${getModelDisplayName(record.model_id) || record._id}`}
              disabled
            />
          </Tooltip>
          <Tooltip title="Eliminar Vehículo">
            <Popconfirm
              title="¿Estás seguro de eliminar este vehículo?"
              onConfirm={() => handleDelete(record._id)}
              okText="Sí"
              cancelText="No"
              okButtonProps={{
                loading:
                  deleteMutation.isPending &&
                  deleteMutation.variables === record._id,
              }}
            >
              <Button
                danger
                icon={<DeleteOutlined style={{ fontSize: 16 }} />}
                aria-label={`Eliminar vehículo ${getModelDisplayName(record.model_id) || record._id}`}
                disabled={
                  deleteMutation.isPending &&
                  deleteMutation.variables === record._id
                }
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Función para descargar plantilla
  const handleDownloadTemplate = async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.VEHICLES.DOWNLOAD_TEMPLATE.url, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla_vehiculos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Plantilla descargada exitosamente');
    } catch (error) {
      console.error('Error descargando plantilla:', error);
      message.error('Error al descargar la plantilla');
    }
  };

  // Manejar éxito de importación
  const handleImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    message.success("Vehículos importados exitosamente");
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <Space>
          <Input
            placeholder="Buscar por tag_id..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            allowClear
          />
          <Button
            type="primary"
            onClick={handleSearch}
            icon={<SearchOutlined />}
          >
            Buscar
          </Button>
        </Space>
        
        <Space.Compact>
          {/* Botón para descargar plantilla */}
          <Tooltip 
            title={
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Plantilla Excel para Vehículos</div>
                <div style={{ fontSize: '12px' }}>
                  Descarga la plantilla con el formato correcto incluyendo:
                  <br />• Campos obligatorios: MARCA, FAMILIA, AÑO, TRANSMISION, COMBUSTIBLE
                  <br />• Campos opcionales: MOTOR, PRECIO, COLOR
                  <br />• Ejemplos de datos válidos
                </div>
              </div>
            }
            placement="topRight"
          >
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              style={{ borderRadius: '6px 0 0 6px' }}
            >
              Descargar Plantilla
            </Button>
          </Tooltip>

          {/* Botón para importar */}
          <Tooltip 
            title={
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Importar Vehículos desde Excel</div>
                <div style={{ fontSize: '12px' }}>
                  Sube un archivo Excel con múltiples vehículos:
                  <br />• Formato: .xlsx o .xls (máx. 10MB)
                  <br />• Procesamiento por lotes configurable
                  <br />• Validación automática de datos
                  <br />• Reporte detallado de errores y advertencias
                </div>
              </div>
            }
            placement="topLeft"
          >
            <Button
              icon={<UploadOutlined />}
              onClick={() => setIsImportModalVisible(true)}
              style={{ borderRadius: '0 6px 6px 0', borderLeft: 'none' }}
            >
              Importar Excel
            </Button>
          </Tooltip>

          <Divider type="vertical" style={{ height: '100%', margin: '0 12px' }} />

        <Button
          type="primary"
          icon={<PlusOutlined style={{ fontSize: 16 }} />}
          onClick={() => {
            setEditingVehicle(null);
            setIsModalVisible(true);
            form.resetFields();
          }}
        >
          Nuevo Vehículo
        </Button>
        </Space.Compact>
      </div>

      <Table
        columns={columns}
        dataSource={vehiclesData || []}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          current: paginationData?.currentPage || 1,
          pageSize: paginationData?.itemsPerPage || 10,
          total: paginationData?.totalItems || 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} vehículos`,
        }}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
      />

      {/* Modal para crear/editar vehículo */}
      <Modal
        title={editingVehicle ? "Editar Vehículo" : "Añadir Vehículo"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnClose
        maskClosable={false}
      width={'80vh'}
      >
        <VehicleMainForm />
      </Modal>

      {/* Modal para importar vehículos */}
      <VehicleImportModal
        visible={isImportModalVisible}
        onClose={() => setIsImportModalVisible(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default VehicleView;
