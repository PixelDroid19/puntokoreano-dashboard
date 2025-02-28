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
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  TagsOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FilesService, { ImageGroup } from "../../services/files.service";
import HeaderImageManager from "./components/HeaderTable.component";
import EditGroupModal from "./components/EditGroupModal";
import ViewGroupModal from "./components/ViewGroupModal";

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
      await FilesService.updateGroupDetails(identifier, {
        description: data.description,
        tags: Array.isArray(data.tags) ? data.tags : [], // Asegurar que tags sea array
      });
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
      imageId,
    }: {
      identifier: string;
      imageId: string;
    }) => {
      await FilesService.deleteImage(identifier, imageId);
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

  const handleDeleteImage = async (imageId: string) => {
    if (viewingGroup) {
      await deleteImage.mutateAsync({
        identifier: viewingGroup.identifier,
        imageId,
      });
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
      title: "Identificador",
      dataIndex: "identifier",
      key: "identifier",
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
      render: (text: string) => text || "Sin descripción",
    },
    {
      title: "Etiquetas",
      key: "tags",
      render: (_: any, record: ImageGroup) => (
        <Space>
          {record.tags &&
            record?.tags?.map((tag) => (
              <Tag key={tag} icon={<TagsOutlined />}>
                {tag}
              </Tag>
            ))}
        </Space>
      ),
    },
    {
      title: "Imágenes",
      key: "imageCount",
      render: (_: any, record: ImageGroup) => (
        <Tag icon={<FolderOpenOutlined />} color="blue">
          {record?.images?.length}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: ImageGroup) => (
        <Space>
          <Tooltip title="Ver grupo">
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
            title="¿Eliminar grupo?"
            description="Esta acción eliminará todas las imágenes asociadas"
            onConfirm={() => handleDeleteGroup(record.identifier)}
          >
            <Tooltip title="Eliminar grupo">
              <Button danger type="primary" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <HeaderImageManager  />

      <Table
        columns={columns ?? []}
        dataSource={groups}
        rowKey="identifier"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} grupos`,
        }}
      />

      {/* Modal de edición */}
      <EditGroupModal
        group={editingGroup}
        visible={!!editingGroup}
        onClose={() => setEditingGroup(null)}
        onUpdate={handleUpdateGroup}
        onAddImages={handleAddImages}
      />

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
