// src/pages/filters/Filters.page.tsx
// @ts-nocheck
import {
    Table,
    Button,
    Popconfirm,
    message,
    Tag,
    Space,
    Collapse,
    Descriptions,
    Modal,
  } from "antd";
  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import React from "react";
  import HeaderTable from "./components/HeaderTable.component";
  import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
  import { Filter } from "../../api/types";
  import FiltersService from "../../services/filters.service";
import FilterEditModal from "./components/FilterEditModal.componen";

  const { Panel } = Collapse;
  
  const Filters = () => {
    const queryClient = useQueryClient();
    const [selectedFilter, setSelectedFilter] = React.useState<Filter | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  
    // Query para obtener filtros
    const { data, isLoading } = useQuery({
      queryKey: ["filters"],
      queryFn: () =>
        FiltersService.getFilters(),
    });
  
    // Mutación para eliminar filtro
    const deleteFilter = useMutation({
      mutationFn: (id: string) => FiltersService.deleteFilter(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["filters"] });
        message.success("Filtro eliminado correctamente");
      },
      onError: (error: Error) => {
        message.error(error.message);
      },
    });
  
    // Mutación para actualizar filtro
    const updateFilter = useMutation({
      mutationFn: (values: { id: string; data: Partial<Filter> }) =>
        FiltersService.updateFilter(values.id, values.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["filters"] });
        message.success("Filtro actualizado correctamente");
        setIsEditModalOpen(false);
        setSelectedFilter(null);
      },
      onError: (error: Error) => {
        message.error(error.message);
      },
    });
  
    const renderFilterDetails = (record: Filter) => (
      <Descriptions column={2} bordered>
        <Descriptions.Item label="Familia" span={2}>
          {record.family_name}
        </Descriptions.Item>
        
        <Descriptions.Item label="Familias" span={2}>
          <Collapse>
            {Object.entries(record.families).map(([year, models]) => (
              <Panel header={`Año ${year}`} key={year}>
                {models.map(model => (
                  <Tag key={model.value}>{model.label}</Tag>
                ))}
              </Panel>
            ))}
          </Collapse>
        </Descriptions.Item>
        
        <Descriptions.Item label="Transmisiones" span={2}>
          <Collapse>
            {Object.entries(record.transmissions).map(([year, transmissions]) => (
              <Panel header={`Año ${year}`} key={year}>
                {Object.entries(transmissions).map(([model, trans]) => (
                  <div key={model}>
                    <Tag color="blue">{model}</Tag>
                    <div style={{ marginLeft: 20 }}>
                      {trans.map(t => (
                        <Tag key={t.value}>{t.label}</Tag>
                      ))}
                    </div>
                  </div>
                ))}
              </Panel>
            ))}
          </Collapse>
        </Descriptions.Item>
      </Descriptions>
    );
  
    const columns = [
      {
        title: "Familia",
        dataIndex: "family_name",
        key: "family_name",
      },
      {
        title: "Modelos",
        key: "families",
        render: (_: any, record: Filter) => (
          <Collapse ghost>
            <Panel header="Ver modelos" key="1">
              {Object.entries(record.families).map(([year, models]) => (
                <div key={year}>
                  <Tag color="blue">{year}</Tag>
                  <div style={{ marginLeft: 20 }}>
                    {models.map(model => (
                      <Tag key={model.value}>{model.label}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </Panel>
          </Collapse>
        ),
      },
      {
        title: "Acciones",
        key: "actions",
        render: (_: any, record: Filter) => (
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedFilter(record);
                setIsViewModalOpen(true);
              }}
            />
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedFilter(record);
                setIsEditModalOpen(true);
              }}
            />
            <Popconfirm
              title="¿Eliminar filtro?"
              description="Esta acción no se puede deshacer"
              onConfirm={() => deleteFilter.mutate(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Space>
        ),
      },
    ];
  
    return (
      <div>
        <Table
          title={() => <HeaderTable />}
          loading={isLoading}
          columns={columns}
          dataSource={data?.filters}
          rowKey="id"
        />
  
        {/* Modal de Vista */}
        <Modal
          title="Detalles del Filtro"
          open={isViewModalOpen}
          onCancel={() => {
            setIsViewModalOpen(false);
            setSelectedFilter(null);
          }}
          footer={null}
          width={1000}
        >
          {selectedFilter && renderFilterDetails(selectedFilter)}
        </Modal>
  
        {/* Modal de Edición */}
        <FilterEditModal
          filter={selectedFilter}
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedFilter(null);
          }}
          onSave={(updatedFilter) => {
            if (selectedFilter) {
              updateFilter.mutate({
                id: selectedFilter.id,
                data: updatedFilter,
              });
            }
          }}
        />
      </div>
    );
  };
  
  export default Filters;