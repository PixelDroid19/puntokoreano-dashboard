import React, { useState, useEffect } from 'react';
import { Tree, Input, Button, Spin, message, Modal, Form, Select } from 'antd';
import { DownOutlined, SyncOutlined, SaveOutlined, DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import VehicleFiltersService, { FilterTreeNode, SavedFilterSearch } from '../../services/vehicle-filters.service';
import { Filter } from '../../api/types';

const { Search } = Input;
const { Option } = Select;

interface VehicleFilterTreeProps {
  onFilterSelect?: (selectedKeys: string[], info: any) => void;
  showSavedSearches?: boolean;
  enableEditing?: boolean;
}

const VehicleFilterTree: React.FC<VehicleFilterTreeProps> = ({
  onFilterSelect,
  showSavedSearches = true,
  enableEditing = false,
}) => {
  const [treeData, setTreeData] = useState<FilterTreeNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ lastSynced: Date | null; status: string; message?: string }>({ 
    lastSynced: null, 
    status: 'idle' 
  });
  const [savedSearches, setSavedSearches] = useState<SavedFilterSearch[]>([]);
  const [saveSearchModalVisible, setSaveSearchModalVisible] = useState(false);
  const [currentSearchCriteria, setCurrentSearchCriteria] = useState<SavedFilterSearch['criteria']>({});
  const [form] = Form.useForm();

  // Cargar los filtros al montar el componente
  useEffect(() => {
    loadFilters();
    loadSavedSearches();
  }, []);

  const loadFilters = async () => {
    setLoading(true);
    try {
      const filters = await VehicleFiltersService.getFilters();
      if (filters && filters.length > 0) {
        const treeNodes = VehicleFiltersService.convertToTreeView(filters[0]);
        setTreeData(treeNodes);
        
        // Expandir los nodos de primer nivel por defecto
        const rootKeys = treeNodes.map(node => node.id);
        setExpandedKeys(rootKeys);
      }
      
      // Obtener el estado de sincronización
      const status = await VehicleFiltersService.getSyncStatus();
      setSyncStatus({
        lastSynced: status.lastSynced,
        status: status.status,
        message: status.message
      });
    } catch (error) {
      console.error('Error loading filters:', error);
      message.error('Error al cargar los filtros de vehículos');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedSearches = () => {
    const searches = VehicleFiltersService.getSavedSearches();
    setSavedSearches(searches);
  };

  const handleSync = async () => {
    setSyncStatus(prev => ({ ...prev, status: 'in-progress', message: 'Sincronizando filtros...' }));
    try {
      const result = await VehicleFiltersService.syncFilters();
      setSyncStatus({
        lastSynced: result.lastSynced,
        status: result.status,
        message: result.message
      });
      
      if (result.status === 'success') {
        message.success('Filtros sincronizados correctamente');
        loadFilters(); // Recargar los filtros después de sincronizar
      } else {
        message.error(result.message || 'Error al sincronizar filtros');
      }
    } catch (error) {
      console.error('Error syncing filters:', error);
      setSyncStatus(prev => ({ 
        ...prev, 
        status: 'failed', 
        message: 'Error al sincronizar filtros' 
      }));
      message.error('Error al sincronizar los filtros de vehículos');
    }
  };

  const handleExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    
    if (value) {
      // Buscar en todos los nodos y expandir los padres de los nodos que coinciden
      const expandedKeys = findMatchingNodes(treeData, value);
      setExpandedKeys(expandedKeys);
      setAutoExpandParent(true);
    } else {
      // Si se borra la búsqueda, colapsar todo excepto el primer nivel
      const rootKeys = treeData.map(node => node.id);
      setExpandedKeys(rootKeys);
      setAutoExpandParent(false);
    }
  };

  // Función recursiva para encontrar nodos que coinciden con la búsqueda
  const findMatchingNodes = (nodes: FilterTreeNode[], searchText: string): React.Key[] => {
    const matchingKeys: React.Key[] = [];
    
    const traverse = (node: FilterTreeNode) => {
      // Verificar si el nodo actual coincide
      if (node.label.toLowerCase().includes(searchText.toLowerCase())) {
        matchingKeys.push(node.id);
        // Agregar todos los padres para asegurar que el nodo sea visible
        let parentId = node.parentId;
        while (parentId) {
          matchingKeys.push(parentId);
          // Encontrar el nodo padre
          const parent = findNodeById(treeData, parentId);
          parentId = parent?.parentId;
        }
      }
      
      // Recorrer los hijos
      if (node.children && node.children.length > 0) {
        node.children.forEach(traverse);
      }
    };
    
    nodes.forEach(traverse);
    return [...new Set(matchingKeys)]; // Eliminar duplicados
  };

  // Función para encontrar un nodo por su ID
  const findNodeById = (nodes: FilterTreeNode[], id: string): FilterTreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Función para resaltar el texto buscado en los nodos
  const highlightSearchText = (text: string) => {
    if (!searchValue) return text;
    
    const index = text.toLowerCase().indexOf(searchValue.toLowerCase());
    if (index === -1) return text;
    
    const beforeStr = text.substring(0, index);
    const matchStr = text.substring(index, index + searchValue.length);
    const afterStr = text.substring(index + searchValue.length);
    
    return (
      <span>
        {beforeStr}
        <span className="site-tree-search-value">{matchStr}</span>
        {afterStr}
      </span>
    );
  };

  // Función para renderizar los nodos del árbol con el texto resaltado
  const renderTreeNodes = (data: FilterTreeNode[]) => {
    return data.map(item => {
      const title = highlightSearchText(item.label);
      
      if (item.children && item.children.length > 0) {
        return {
          title,
          key: item.id,
          children: renderTreeNodes(item.children),
          selectable: true,
        };
      }
      
      return {
        title,
        key: item.id,
        selectable: true,
      };
    });
  };

  // Guardar búsqueda actual
  const showSaveSearchModal = () => {
    form.resetFields();
    setSaveSearchModalVisible(true);
  };

  const handleSaveSearch = () => {
    form.validateFields().then(values => {
      const newSearch = VehicleFiltersService.saveFilterSearch(values.name, currentSearchCriteria);
      setSavedSearches([...savedSearches, newSearch]);
      setSaveSearchModalVisible(false);
      message.success('Búsqueda guardada correctamente');
    });
  };

  const handleDeleteSavedSearch = (id: string) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta búsqueda guardada?',
      content: 'Esta acción no se puede deshacer',
      onOk: () => {
        VehicleFiltersService.deleteSavedSearch(id);
        setSavedSearches(savedSearches.filter(search => search.id !== id));
        message.success('Búsqueda eliminada correctamente');
      },
    });
  };

  const handleApplySavedSearch = (search: SavedFilterSearch) => {
    setCurrentSearchCriteria(search.criteria);
    // Implementar la lógica para aplicar los criterios de búsqueda guardados
    // Esto dependerá de cómo se integre con el resto de la aplicación
    if (onFilterSelect) {
      // Convertir los criterios a un formato que pueda ser utilizado por el componente padre
      const selectedKeys = Object.values(search.criteria).filter(Boolean) as string[];
      onFilterSelect(selectedKeys, { criteria: search.criteria });
    }
    message.info(`Búsqueda aplicada: ${search.name}`);
  };

  return (
    <div className="vehicle-filter-tree">
      <div className="filter-tree-header">
        <Search
          placeholder="Buscar filtros"
          onChange={handleSearch}
          style={{ marginBottom: 8 }}
          allowClear
        />
        <div className="filter-tree-actions">
          <Button 
            icon={<SyncOutlined spin={syncStatus.status === 'in-progress'} />} 
            onClick={handleSync}
            disabled={syncStatus.status === 'in-progress'}
            title="Sincronizar filtros"
          >
            Sincronizar
          </Button>
          {syncStatus.lastSynced && (
            <span className="sync-status">
              Última sincronización: {new Date(syncStatus.lastSynced).toLocaleString()}
            </span>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <Spin tip="Cargando filtros..." />
        </div>
      ) : (
        <>
          <Tree
            showLine
            switcherIcon={<DownOutlined />}
            onExpand={handleExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            treeData={renderTreeNodes(treeData)}
            onSelect={onFilterSelect}
            className="vehicle-filter-tree-component"
          />
          
          {showSavedSearches && (
            <div className="saved-searches-section">
              <div className="saved-searches-header">
                <h3>Búsquedas guardadas</h3>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={showSaveSearchModal}
                  size="small"
                >
                  Guardar búsqueda actual
                </Button>
              </div>
              
              <ul className="saved-searches-list">
                {savedSearches.length === 0 ? (
                  <li className="no-saved-searches">No hay búsquedas guardadas</li>
                ) : (
                  savedSearches.map(search => (
                    <li key={search.id} className="saved-search-item">
                      <div className="saved-search-info">
                        <span className="saved-search-name">{search.name}</span>
                        <span className="saved-search-date">
                          {new Date(search.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="saved-search-actions">
                        <Button 
                          type="link" 
                          onClick={() => handleApplySavedSearch(search)}
                          title="Aplicar búsqueda"
                        >
                          Aplicar
                        </Button>
                        <Button 
                          type="link" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => handleDeleteSavedSearch(search.id)}
                          title="Eliminar búsqueda"
                        />
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </>
      )}
      
      <Modal
        title="Guardar búsqueda"
        visible={saveSearchModalVisible}
        onOk={handleSaveSearch}
        onCancel={() => setSaveSearchModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre de la búsqueda"
            rules={[{ required: true, message: 'Por favor ingresa un nombre para la búsqueda' }]}
          >
            <Input placeholder="Ej: Filtros para Toyota Corolla" />
          </Form.Item>
        </Form>
      </Modal>
      
      <style jsx>{`
        .vehicle-filter-tree {
          padding: 16px;
          background: #fff;
          border-radius: 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .filter-tree-header {
          margin-bottom: 16px;
        }
        
        .filter-tree-actions {
          display: flex;
          align-items: center;
          margin-top: 8px;
          gap: 12px;
        }
        
        .sync-status {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          padding: 24px 0;
        }
        
        .vehicle-filter-tree-component {
          margin-bottom: 16px;
        }
        
        .site-tree-search-value {
          color: #1890ff;
          background-color: rgba(24, 144, 255, 0.1);
          padding: 0 2px;
        }
        
        .saved-searches-section {
          margin-top: 24px;
          border-top: 1px solid #f0f0f0;
          padding-top: 16px;
        }
        
        .saved-searches-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .saved-searches-header h3 {
          margin: 0;
          font-size: 16px;
        }
        
        .saved-searches-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .saved-search-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .saved-search-info {
          display: flex;
          flex-direction: column;
        }
        
        .saved-search-name {
          font-weight: 500;
        }
        
        .saved-search-date {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);
        }
        
        .saved-search-actions {
          display: flex;
          gap: 8px;
        }
        
        .no-saved-searches {
          color: rgba(0, 0, 0, 0.45);
          padding: 16px 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default VehicleFilterTree;