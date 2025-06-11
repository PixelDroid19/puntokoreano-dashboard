import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Popconfirm,
  Select,
  Tag,
  Tooltip,
  Tabs,
  message,
  Badge,
  Card,
  Statistic,
  Row,
  Col,
  Alert,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  CarOutlined,
  FileTextOutlined,
  TagsOutlined,
  EyeOutlined,
  FilterOutlined,
  ExportOutlined,
  DashboardOutlined,
  CalendarOutlined,
  SettingOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import VehicleApplicabilityGroupsService, { 
  VehicleApplicabilityGroup, 
  CompatibleVehiclesResponse,
  GroupStatsResponse
} from "../../services/vehicle-applicability-groups.service";
import ApplicabilityGroupForm from "./forms/applicability-group-form";
import CompatibleVehiclesViewer from "./components/compatible-vehicles-viewer";
import PerformanceMetricsViewer from "./components/performance-metrics-viewer";

const { TabPane } = Tabs;
const { Option } = Select;
const { confirm } = Modal;

const categoryColors: Record<string, string> = {
  repuestos: "blue",
  accesorios: "green",
  servicio: "purple",
  blog: "orange",
  general: "default"
};

const criteriaLevelColors: Record<string, string> = {
  basic: "default",
  medium: "orange", 
  detailed: "blue"
};

const ApplicabilityGroupsView: React.FC = () => {
  const [selectedVehicleGroupId, setSelectedVehicleGroupId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [editingGroup, setEditingGroup] = useState<VehicleApplicabilityGroup | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewingVehicles, setIsViewingVehicles] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("groups");

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc" as "asc" | "desc",
    search: "",
    category: "",
    activeOnly: true,
  });

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["applicabilityGroups", queryParams],
    queryFn: () => VehicleApplicabilityGroupsService.getGroups(queryParams),
  });

  const groupsData = apiResponse?.groups;
  const paginationData = apiResponse?.pagination;
  const { data: statsData, refetch: refetchStats } = useQuery<GroupStatsResponse>({
    queryKey: ["applicabilityGroupStats"],
    queryFn: () => VehicleApplicabilityGroupsService.getGroupStats(),
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (newGroup: Partial<VehicleApplicabilityGroup>) => VehicleApplicabilityGroupsService.createGroup(newGroup),
    onSuccess: () => {
      message.success("Grupo de aplicabilidad creado correctamente");
      setIsModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["applicabilityGroups"] });
      queryClient.invalidateQueries({ queryKey: ["applicabilityGroupStats"] });
    },
    onError: (error: any) => {
      message.error(
        `Error al crear el grupo: ${
          error.message || "Error desconocido"
        }`
      );
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      VehicleApplicabilityGroupsService.updateGroup(id, data),
    onSuccess: () => {
      message.success("Grupo de aplicabilidad actualizado correctamente");
      setIsEditModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["applicabilityGroups"] });
      queryClient.invalidateQueries({ queryKey: ["applicabilityGroupStats"] });
    },
    onError: (error: any) => {
      message.error(
        `Error al actualizar el grupo: ${
          error.message || "Error desconocido"
        }`
      );
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => VehicleApplicabilityGroupsService.deleteGroup(id),
    onSuccess: () => {
      message.success("Grupo de aplicabilidad eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["applicabilityGroups"] });
      queryClient.invalidateQueries({ queryKey: ["applicabilityGroupStats"] });
    },
    onError: (error: any) => {
      message.error(
        `Error al eliminar el grupo: ${
          error.message || "Error desconocido"
        }`
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

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setQueryParams((prevParams) => ({
      ...prevParams,
      category: value,
      page: 1,
    }));
  };



  const handleEdit = (record: VehicleApplicabilityGroup) => {
    setEditingGroup(record);
    setIsEditModalVisible(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "¿Estás seguro de eliminar este grupo?",
      content: "Esta acción no se puede deshacer y podría afectar productos o blogs que utilicen este grupo.",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk() {
    deleteMutation.mutate(id);
      }
    });
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setQueryParams((prevParams) => ({
      ...prevParams,
      page: pagination.current,
      limit: pagination.pageSize,
      sortBy: sorter.field || "name",
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
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    setEditingGroup(null);
  };

  const handleViewVehicles = (groupId: string) => {
    setSelectedVehicleGroupId(groupId);
    setIsViewingVehicles(true);
  };



  const resetFilters = () => {
    setSearchText("");
    setSelectedCategory("");
    setQueryParams((prevParams) => ({
      ...prevParams,
      page: 1,
    }));
  };

  // Función para renderizar criterios de manera más detallada
  const renderCriteriaDetails = (record: VehicleApplicabilityGroup) => {
    const criteria = record.criteria || {};
    const details: string[] = [];
    
    // Criterios jerárquicos
    if (criteria.brands?.length) details.push(`${criteria.brands.length} marca(s)`);
    if (criteria.families?.length) details.push(`${criteria.families.length} familia(s)`);
    if (criteria.models?.length) details.push(`${criteria.models.length} modelo(s)`);
    if (criteria.lines?.length) details.push(`${criteria.lines.length} línea(s)`);
    
    // Criterios técnicos
    if (criteria.transmissions?.length) details.push(`${criteria.transmissions.length} transmisión(es)`);
    if (criteria.fuels?.length) details.push(`${criteria.fuels.length} combustible(s)`);
    if (criteria.engineTypes?.length) details.push(`${criteria.engineTypes.length} tipo(s) de motor`);
    
    // Criterios de años mejorados
    if (criteria.specificYears?.length > 0) {
      const formattedYears = formatSpecificYears(criteria.specificYears);
      details.push(`Años específicos: ${formattedYears}`);
    } else if (criteria.minYear || criteria.maxYear) {
      if (criteria.minYear && criteria.maxYear) {
        details.push(`Años: ${criteria.minYear}-${criteria.maxYear}`);
      } else if (criteria.minYear) {
        details.push(`Desde: ${criteria.minYear}`);
      } else if (criteria.maxYear) {
        details.push(`Hasta: ${criteria.maxYear}`);
      }
    }
    
    // Agregar información sobre excepciones si existen
    if (record.includedVehicles?.length > 0) {
      details.push(`+${record.includedVehicles.length} incluido(s)`);
    }
    if (record.excludedVehicles?.length > 0) {
      details.push(`-${record.excludedVehicles.length} excluido(s)`);
    }
    
    return details.join(', ') || 'Sin criterios específicos';
  };

  // Función para validar criterios de años y mostrar advertencias
  const validateAndShowYearWarnings = (record: VehicleApplicabilityGroup) => {
    const validation = VehicleApplicabilityGroupsService.validateYearCriteria(record.criteria);
    
    if (validation.warnings.length > 0) {
      return (
        <Tooltip title={
          <div>
            <div><strong>Advertencias:</strong></div>
            {validation.warnings.map((warning, index) => (
              <div key={index}>• {warning}</div>
            ))}
            {validation.suggestions.length > 0 && (
              <>
                <div style={{ marginTop: 8 }}><strong>Sugerencias:</strong></div>
                {validation.suggestions.map((suggestion, index) => (
                  <div key={index}>• {suggestion}</div>
                ))}
              </>
            )}
          </div>
        }>
          <WarningOutlined style={{ color: '#faad14', marginLeft: 4 }} />
          </Tooltip>
      );
    }
    
    return null;
  };

  // Función utilitaria para formatear años específicos de manera legible
  const formatSpecificYears = (years: number[]): string => {
    if (!years || years.length === 0) return '';
    
    const sortedYears = [...years].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sortedYears[0];
    let end = sortedYears[0];
    
    for (let i = 1; i < sortedYears.length; i++) {
      if (sortedYears[i] === end + 1) {
        end = sortedYears[i];
      } else {
        // Agregar el rango actual
        if (start === end) {
          ranges.push(start.toString());
        } else if (end - start === 1) {
          ranges.push(`${start}, ${end}`);
        } else {
          ranges.push(`${start}-${end}`);
        }
        start = end = sortedYears[i];
      }
    }
    
    // Agregar el último rango
    if (start === end) {
      ranges.push(start.toString());
    } else if (end - start === 1) {
      ranges.push(`${start}, ${end}`);
    } else {
      ranges.push(`${start}-${end}`);
    }
    
    return ranges.join(', ');
  };

  const renderGroupsTab = () => (
    <div className="space-y-4">
      {/* Controles y filtros */}
      <Card size="default" bodyStyle={{ padding: "16px" }}>
        <div className="flex flex-wrap gap-3 items-center">
            <Input
              placeholder="Buscar grupos..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              className="w-full sm:w-48 md:w-64"
            />
            <Select
              placeholder="Categoría"
              value={selectedCategory}
              onChange={handleCategoryChange}
              allowClear
              className="w-full sm:w-40"
            >
              <Option value="repuestos">Repuestos</Option>
              <Option value="accesorios">Accesorios</Option>
              <Option value="servicio">Servicio</Option>
              <Option value="blog">Blog</Option>
              <Option value="general">General</Option>
            </Select>
          
          {/* Separador visual */}
          <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1" />
          
          {/* Acciones */}
          <Tooltip title="Limpiar filtros">
            <Button 
              onClick={resetFilters} 
              icon={<FilterOutlined />} 
              className="sm:min-w-0"
            >
              <span className="hidden md:inline">Limpiar</span>
            </Button>
          </Tooltip>
          
          <Tooltip title="Buscar grupos">
            <Button 
              onClick={handleSearch} 
              type="primary" 
              icon={<SearchOutlined />} 
              className="sm:min-w-0"
            >
              <span className="hidden md:inline">Buscar</span>
            </Button>
          </Tooltip>
          
         
          
          <Tooltip title="Crear nuevo grupo">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              className="sm:min-w-0"
            >
              <span className="hidden md:inline">Nuevo</span>
            </Button>
          </Tooltip>
        </div>
      </Card>

      {/* Tabla de grupos */}
      <Card size="default" bodyStyle={{ padding: "0" }}>
        <Table
          dataSource={groupsData}
          loading={isLoading}
          rowKey="_id"
          onChange={handleTableChange}
          pagination={{
            style: {
              marginBottom: '20px',
              padding: '0 16px 16px 16px',
            },
            current: paginationData?.currentPage || 1,
            total: paginationData?.totalItems || 0,
            pageSize: paginationData?.itemsPerPage || 10,
            showSizeChanger: true,
            showQuickJumper: true,
            size: "default",
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} grupos`,
          }}
          scroll={{ x: 900 }}
          size="middle"
          style={{ fontSize: '20px' }}
          columns={[
            {
              title: "Nombre",
              dataIndex: "name",
              key: "name",
              sorter: true,
              width: 180,
              render: (text: string, record: VehicleApplicabilityGroup) => (
                <div>
                  <div className="font-medium text-sm">{text}</div>
                  {record.description && (
                    <div className="text-gray-500 text-xs truncate max-w-[160px]">{record.description}</div>
                  )}
                </div>
              ),
            },
            {
              title: "Categoría",
              dataIndex: "category",
              key: "category",
              width: 110,
              render: (category: string) => (
                <Tag color={categoryColors[category] || "default"} className="text-xs px-2 py-0.5">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Tag>
              ),
            },
            {
              title: "Estado",
              dataIndex: "active",
              key: "active",
              width: 100,
              render: (active: boolean) => (
                <Badge
                  status={active ? "success" : "error"}
                  text={<span className="text-sm">{active ? "Activo" : "Inactivo"}</span>}
                />
              ),
            },
            {
              title: "Nivel",
              key: "criteriaLevel",
              width: 120,
              render: (_, record: VehicleApplicabilityGroup) => {
                const criteria = record.criteria || {};
                const criteriaCount = Object.entries(criteria).reduce((count, [key, value]) => {
                  if (Array.isArray(value) && value.length > 0) return count + 1;
                  if (value && !Array.isArray(value) && key !== 'minYear' && key !== 'maxYear') return count + 1;
                  if ((key === 'minYear' || key === 'maxYear') && value) return count + 0.5;
                  return count;
                }, 0);

                const level = criteriaCount >= 4 ? 'detailed' : 
                             criteriaCount >= 2 ? 'medium' : 'basic';
                const levelText = level === 'detailed' ? 'Detallado' :
                                 level === 'medium' ? 'Medio' : 'Básico';

                return (
                  <div>
                    <Tag color={criteriaLevelColors[level]} className="text-xs px-2 py-0.5">
                      {levelText}
                    </Tag>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.floor(criteriaCount)} criterio(s)
                      {validateAndShowYearWarnings(record)}
                    </div>
                  </div>
                );
              },
            },
            {
              title: "Criterios",
              key: "criteriaDetails",
              width: 180,
              render: (_, record: VehicleApplicabilityGroup) => (
                <Tooltip title={renderCriteriaDetails(record)}>
                  <div className="text-sm cursor-help truncate max-w-[160px]">
                    {renderCriteriaDetails(record)}
                  </div>
                </Tooltip>
              ),
            },
            {
              title: "Acciones",
              key: "actions",
              width: 140,
              render: (_, record: VehicleApplicabilityGroup) => (
                <Space size="small">
                  <Button
                    type="text"
                    icon={<EditOutlined style={{ fontSize: '16px' }} />}
                    onClick={() => handleEdit(record)}
                    size="middle"
                    className="p-0"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined style={{ fontSize: '16px' }} />}
                    onClick={() => handleDelete(record._id)}
                    size="middle"
                    className="p-0"
                  />
                  <Button
                    type="text"
                    icon={<EyeOutlined style={{ fontSize: '16px' }} />}
                    onClick={() => handleViewVehicles(record._id)}
                    size="middle"
                    className="p-0"
                  />
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Grupos de Aplicabilidad
        </h3>
        <p className="text-gray-500 text-base mt-1">
          Define criterios para determinar compatibilidad de vehículos
        </p>
      </div>

      {/* Contenido principal */}
      <div className="text-base">
        {renderGroupsTab()}
      </div>

      {/* Modales sin cambios */}
      <Modal
        title="Nuevo Grupo de Aplicabilidad"
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={960}
        destroyOnClose
      >
        <ApplicabilityGroupForm
          initialData={null}
          onCancel={handleModalCancel}
          onSuccess={() => {
            setIsModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ["applicabilityGroups"] });
            queryClient.invalidateQueries({ queryKey: ["applicabilityGroupStats"] });
          }}
          mode="create"
        />
      </Modal>

      <Modal
        title="Editar Grupo de Aplicabilidad"
        open={isEditModalVisible}
        onCancel={handleEditModalCancel}
        footer={null}
        width={960}
        destroyOnClose
      >
        {editingGroup && (
          <ApplicabilityGroupForm
            initialData={editingGroup}
            onCancel={handleEditModalCancel}
            onSuccess={() => {
              setIsEditModalVisible(false);
              queryClient.invalidateQueries({ queryKey: ["applicabilityGroups"] });
              queryClient.invalidateQueries({ queryKey: ["applicabilityGroupStats"] });
            }}
            mode="edit"
          />
        )}
      </Modal>

      <Modal
        title="Vehículos Compatibles"
        open={isViewingVehicles}
        onCancel={() => setIsViewingVehicles(false)}
        footer={null}
        width={1280}
        destroyOnClose
      >
        {selectedVehicleGroupId && (
          <CompatibleVehiclesViewer groupId={selectedVehicleGroupId} />
        )}
      </Modal>
    </div>
  );
};

export default ApplicabilityGroupsView;