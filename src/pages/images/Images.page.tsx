// pages/Images.tsx
import React from "react";
import {
  Table,
  Space,
  Button,
  notification,
  Tooltip,
  Tag,
  Popconfirm,
  Typography,
  Empty,
  Card,
  Skeleton
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  TagsOutlined,
  FolderOpenOutlined,
  PictureOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FilesService, { ImageGroup } from "../../services/files.service";
import HeaderImageManager from "./components/HeaderTable.component";
import EditGroupModal from "./components/EditGroupModal";
import ViewGroupModal from "./components/ViewGroupModal";

const { Text, Title } = Typography;

const Images: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingGroup, setEditingGroup] = React.useState<ImageGroup | null>(
    null
  );
  const [viewingGroup, setViewingGroup] = React.useState<ImageGroup | null>(
    null
  );

  // Queries
  const { data: groups, isFetching: isLoading } = useQuery({
    queryKey: ["imageGroupsModule"],
    queryFn: async () => {
      const response = await FilesService.getGroups();
      return response.data.groups || [];
    },
  });

  // Mutations
  const updateGroup = useMutation({
    mutationFn: async ({
      identifier,
      data,
    }: {
      identifier: string;
      data: any;
    }) => {
      await FilesService.updateGroup(identifier, data);
    },
    onSuccess: () => {
      notification.success({
        message: "Grupo actualizado",
        description: "La información del grupo se actualizó correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["imageGroupsModule"] });
    },
    onError: (error: any) => {
      notification.error({
        message: "Error al actualizar grupo",
        description: error.message || "Ocurrió un error inesperado",
      });
    },
  });

  const addImages = useMutation({
    mutationFn: async ({
      identifier,
      files,
    }: {
      identifier: string;
      files: File[];
    }) => {
      if (!files.length) {
        throw new Error("No se seleccionaron imágenes");
      }

      // Validar tamaño y tipo de archivos antes de enviar
      const validFiles = files.filter((file) => {
        const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB
        const isValidType = file.type.startsWith("image/");
        return isValidSize && isValidType;
      });

      if (validFiles.length !== files.length) {
        notification.warning({
          message: "Algunas imágenes fueron ignoradas",
          description:
            "Solo se procesaron las imágenes válidas (máx. 2MB, solo imágenes)",
        });
      }

      if (!validFiles.length) {
        throw new Error("No hay imágenes válidas para procesar");
      }

      await FilesService.addImagesToGroup(identifier, validFiles);
    },
    onError: (error: any) => {
      notification.error({
        message: "Error al añadir imágenes",
        description: error.message || "Ocurrió un error inesperado",
      });
    },
  });

  const deleteImage = useMutation({
    mutationFn: async ({
      identifier,
      type,
      index,
    }: {
      identifier: string;
      type: 'thumb' | 'carousel';
      index?: number;
    }) => {
      if (type === 'thumb') {
        await FilesService.deleteThumb(identifier);
      } else if (type === 'carousel' && typeof index === 'number') {
        await FilesService.deleteCarouselImage(identifier, index);
      }
    },
    onSuccess: () => {
      notification.success({ message: "Imagen eliminada correctamente" });
      queryClient.invalidateQueries({ queryKey: ["imageGroupsModule"] });
    },
  });

  const deleteGroup = useMutation({
    mutationFn: async (identifier: string) => {
      await FilesService.deleteGroup(identifier);
    },
    onSuccess: () => {
      notification.success({ message: "Grupo eliminado correctamente" });
      queryClient.invalidateQueries({ queryKey: ["imageGroupsModule"] });
    },
  });

  // Handlers
  const handleUpdateGroup = async (values: any) => {
    if (!editingGroup) return;

    try {
      await updateGroup.mutateAsync({
        identifier: editingGroup.identifier,
        data: values,
      });
    } catch (error) {
      // El error ya se maneja en onError de la mutation
      console.error("Error in handleUpdateGroup:", error);
    }
  };

  const handleAddImages = async (files: File[]) => {
    if (!editingGroup) return;

    try {
      await addImages.mutateAsync({
        identifier: editingGroup.identifier,
        files,
      });
    } catch (error) {
      // El error ya se maneja en onError de la mutation
      console.error("Error in handleAddImages:", error);
    }
  };

  const handleDeleteImage = async (type: 'thumb' | 'carousel', index?: number) => {
    if (viewingGroup || editingGroup) {
      const identifier = viewingGroup?.identifier || editingGroup?.identifier;
      if (!identifier) return;
      
      await deleteImage.mutateAsync({
        identifier,
        type,
        index,
      });
      
      // Refrescar los datos después de eliminar
      queryClient.invalidateQueries({ queryKey: ["imageGroupsModule"] });
    }
  };

  const handleDeleteGroup = async (identifier: string) => {
    await deleteGroup.mutateAsync(identifier);
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      notification.success({
        message: "URL copiada al portapapeles",
      });
    } catch (error) {
      notification.error({
        message: "Error al copiar URL",
      });
    }
  };

  // Columns definition
  const columns = [
    {
      title: <span className="text-center w-full block">Identificador</span>,
      dataIndex: "identifier",
      key: "identifier",
      align: 'center' as 'center',
      render: (text: string) => (
        <Text strong className="text-blue-600 text-base text-center w-full block">{text}</Text>
      ),
      width: '18%',
    },
    {
      title: <span className="text-center w-full block">Descripción</span>,
      dataIndex: "description",
      key: "description",
      align: 'center' as 'center',
      render: (text: string) => (
        <Text className="text-gray-600 text-center w-full block">
          {text || <span className="text-gray-400 italic">Sin descripción</span>}
        </Text>
      ),
      width: '28%',
    },
    {
      title: <span className="text-center w-full block">Tipo</span>,
      key: "type",
      width: '18%',
      align: 'center' as 'center',
      render: (_: any, record: ImageGroup) => (
        <Space wrap size={[0, 4]} className="justify-center w-full">
          {record.thumb && (
            <Tag icon={<PictureOutlined />} color="blue" className="rounded-full px-3 py-1 text-xs">
              Miniatura
            </Tag>
          )}
          {record.carousel && record.carousel.length > 0 && (
            <Tag icon={<PictureOutlined />} color="green" className="rounded-full px-3 py-1 text-xs">
              Carrusel ({record.carousel.length})
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: <span className="text-center w-full block">Imágenes</span>,
      key: "imageCount",
      width: '18%',
      align: 'center' as 'center',
      render: (_: any, record: ImageGroup) => (
        <div className="flex items-center justify-center gap-2 w-full">
          {record.thumb && (
            <img
              src={record.thumb}
              alt="Miniatura"
              className="w-8 h-8 object-cover rounded shadow border border-gray-200"
              style={{ zIndex: 10 }}
            />
          )}
          
          {record.carousel && record.carousel.length > 0 ? (
            record.carousel.slice(0, 2).map((imgUrl, idx) => (
              <img
                key={`carousel-${idx}`}
                src={imgUrl}
                alt={`Carousel ${idx + 1}`}
                className="w-8 h-8 object-cover rounded shadow border border-gray-200"
                style={{ marginLeft: -4, zIndex: 9 - idx }}
              />
            ))
          ) : null}
          
          {!record.thumb && (!record.carousel || record.carousel.length === 0) && (
            <span className="text-gray-400 italic text-xs">Sin imágenes</span>
          )}
          
          {record.carousel && record.carousel.length > 2 && (
            <Tag color="blue" className="ml-2">+{record.carousel.length - 2}</Tag>
          )}
        </div>
      ),
    },
    {
      title: <span className="text-center w-full block">Acciones</span>,
      key: "actions",
      width: '18%',
      align: 'center' as 'center',
      render: (_: any, record: ImageGroup) => (
        <Space size="middle" className="flex items-center justify-center w-full">
          <Tooltip title="Ver imágenes">
            <Button
             
           
              icon={<EyeOutlined />}
              onClick={() => setViewingGroup(record)}
             
            />
          </Tooltip>
          <Tooltip title="Editar grupo">
            <Button
         
              icon={<EditOutlined />}
              onClick={() => setEditingGroup(record)}
              
            />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar este grupo?"
            description={
              <div className="text-sm">
                <p>Esta acción no se puede deshacer.</p>
                <p>Se eliminarán todas las imágenes asociadas.</p>
              </div>
            }
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            placement="left"
            onConfirm={() => handleDeleteGroup(record.identifier)}
          >
            <Tooltip title="Eliminar grupo">
              <Button 
                danger 
                icon={<DeleteOutlined />} 
             
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Renderizado condicional para estado vacío
  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="mt-4 w-full flex items-center justify-center" bodyStyle={{padding:0}}>
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      );
    }

    if (!groups || groups.length === 0) {
      return (
        <Card className="mt-4 w-full flex flex-col items-center justify-center" bodyStyle={{padding:0}}>
          <Empty
            image={<FolderOpenOutlined style={{ fontSize: 64 }} className="text-gray-300" />}
            description={
              <div className="mt-4">
                <Title level={4}>No hay grupos de imágenes</Title>
                <Text type="secondary">
                  Crea un nuevo grupo para comenzar a gestionar tus imágenes
                </Text>
              </div>
            }
          />
          <div className="flex justify-center w-full mb-6">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              className="mt-6"
              onClick={() => document.getElementById('createGroupBtn')?.click()}
            >
              Crear Primer Grupo
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <Card className="mt-4 w-full flex flex-col" bodyStyle={{padding:0}}>
        <Table
          columns={columns}
          dataSource={groups}
          rowKey="identifier"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `${total} ${total === 1 ? 'grupo' : 'grupos'}`,
            size: 'default'
          }}
          className="groups-table"
          rowClassName={(_, idx) => idx % 2 === 0 ? "bg-white" : "bg-blue-50"}
          size="large"
          bordered={false}
          style={{width:'100%'}}
          showHeader
        />
      </Card>
    );
  };

  const handleEditGroupModal = () => (
    <EditGroupModal
      group={editingGroup}
      visible={!!editingGroup}
      onClose={() => setEditingGroup(null)}
      onUpdate={handleUpdateGroup}
      onAddImages={handleAddImages}
      onDeleteImage={handleDeleteImage}
    />
  );

  return (
    <div className="space-y-4">
      <HeaderImageManager />
      {renderContent()}

      {/* Modal de edición */}
      {handleEditGroupModal()}

      {/* Modal de visualización */}
      <ViewGroupModal
        group={viewingGroup}
        visible={!!viewingGroup}
        onClose={() => setViewingGroup(null)}
        onDeleteImage={handleDeleteImage}
        onCopyUrl={handleCopyUrl}
      />
    </div>
  );
};

export default Images;
