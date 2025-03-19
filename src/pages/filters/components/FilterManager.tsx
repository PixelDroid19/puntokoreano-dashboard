import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Plus, Trash, Save, Loader2 } from 'lucide-react';
import FiltersService from '../../../services/filters.service';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterData {
  id: string;
  family_name: string;
  families: {
    [year: string]: FilterOption[];
  };
  transmissions: {
    [year: string]: {
      [model: string]: FilterOption[];
    };
  };
  fuels: {
    [year: string]: {
      [model: string]: {
        [transmission: string]: FilterOption[];
      };
    };
  };
  lines: {
    [year: string]: {
      [model: string]: {
        [transmission: string]: {
          [fuel: string]: FilterOption[];
        };
      };
    };
  };
  auto_sync: boolean;
}

interface FilterManagerProps {
  filterId?: string;
}

export const FilterManager: React.FC<FilterManagerProps> = ({ filterId }) => {
  const queryClient = useQueryClient();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [newOption, setNewOption] = useState<Record<string, { label: string; value: string }>>({});

  // Fetch filter data
  const { data: filter, isLoading } = useQuery({
    queryKey: ['filter', filterId],
    queryFn: async () => {
      if (!filterId) return null;
      return await FiltersService.getFilterById(filterId);
    },
    enabled: !!filterId
  });

  // Mutation for updating filter sections
  const { mutate: updateSection, isPending: isUpdating } = useMutation({
    mutationFn: async ({ section, data }: { section: string; data: any }) => {
      if (!filterId) return null;
      return await FiltersService.updateFilterSection(filterId, section as any, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filter', filterId] });
    }
  });

  const toggleExpand = (key: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleEditMode = (key: string) => {
    setEditMode(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNewOptionChange = (key: string, field: 'label' | 'value', value: string) => {
    setNewOption(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const addOption = (section: string, path: string[], options: FilterOption[]) => {
    if (!newOption[path.join('.')]) return;
    
    const updatedOptions = [...options, newOption[path.join('.')]];
    
    // Build the data structure based on the path
    let data: any = {};
    let current = data;
    
    for (let i = 0; i < path.length; i++) {
      if (i === path.length - 1) {
        current[path[i]] = updatedOptions;
      } else {
        current[path[i]] = {};
        current = current[path[i]];
      }
    }
    
    updateSection({ section, data });
    
    // Reset the new option for this path
    setNewOption(prev => {
      const updated = { ...prev };
      delete updated[path.join('.')];
      return updated;
    });
  };

  const removeOption = (section: string, path: string[], options: FilterOption[], index: number) => {
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    
    // Build the data structure based on the path
    let data: any = {};
    let current = data;
    
    for (let i = 0; i < path.length; i++) {
      if (i === path.length - 1) {
        current[path[i]] = updatedOptions;
      } else {
        current[path[i]] = {};
        current = current[path[i]];
      }
    }
    
    updateSection({ section, data });
  };

  const renderFamilies = () => {
    if (!filter?.families) return null;
    
    return Object.entries(filter.families).map(([year, models]) => (
      <div key={`families-${year}`} className="ml-4 border-l-2 border-gray-200 pl-4 my-2">
        <div className="flex items-center">
          <button 
            onClick={() => toggleExpand(`families-${year}`)}
            className="mr-2 text-gray-500 hover:text-gray-700"
          >
            {expandedSections[`families-${year}`] ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          <span className="font-medium">{year}</span>
          <button
            onClick={() => toggleEditMode(`families-${year}`)}
            className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
          >
            {editMode[`families-${year}`] ? 'Done' : 'Edit'}
          </button>
        </div>
        
        {expandedSections[`families-${year}`] && (
          <div className="ml-6 mt-2">
            {models.map((model, index) => (
              <div key={`model-${model.value}`} className="flex items-center mb-1">
                <span>{model.label}</span>
                {editMode[`families-${year}`] && (
                  <button
                    onClick={() => removeOption('families', [year], models, index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <Trash size={14} />
                  </button>
                )}
              </div>
            ))}
            
            {editMode[`families-${year}`] && (
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  placeholder="Label"
                  className="px-2 py-1 border border-gray-300 rounded mr-2 text-sm"
                  value={newOption[`families.${year}`]?.label || ''}
                  onChange={(e) => handleNewOptionChange(`families.${year}`, 'label', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Value"
                  className="px-2 py-1 border border-gray-300 rounded mr-2 text-sm"
                  value={newOption[`families.${year}`]?.value || ''}
                  onChange={(e) => handleNewOptionChange(`families.${year}`, 'value', e.target.value)}
                />
                <button
                  onClick={() => addOption('families', [year], models)}
                  className="text-green-500 hover:text-green-700"
                  disabled={!newOption[`families.${year}`]?.label || !newOption[`families.${year}`]?.value}
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!filter) {
    return (
      <div className="text-center py-8">
        <p>Seleccione un filtro para gestionar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Gestión de Filtros: {filter.family_name}</h2>
      
      <div className="mb-4">
        <div className="flex items-center">
          <button 
            onClick={() => toggleExpand('families')}
            className="mr-2 text-gray-500 hover:text-gray-700"
          >
            {expandedSections['families'] ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          <h3 className="text-lg font-medium">Familias</h3>
        </div>
        
        {expandedSections['families'] && renderFamilies()}
      </div>
      
      <div className="mb-4">
        <div className="flex items-center">
          <button 
            onClick={() => toggleExpand('transmissions')}
            className="mr-2 text-gray-500 hover:text-gray-700"
          >
            {expandedSections['transmissions'] ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          <h3 className="text-lg font-medium">Transmisiones</h3>
        </div>
        
        {/* Similar structure for transmissions */}
      </div>
      
      <div className="mb-4">
        <div className="flex items-center">
          <button 
            onClick={() => toggleExpand('fuels')}
            className="mr-2 text-gray-500 hover:text-gray-700"
          >
            {expandedSections['fuels'] ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          <h3 className="text-lg font-medium">Combustibles</h3>
        </div>
        
        {/* Similar structure for fuels */}
      </div>
      
      <div className="mb-4">
        <div className="flex items-center">
          <button 
            onClick={() => toggleExpand('lines')}
            className="mr-2 text-gray-500 hover:text-gray-700"
          >
            {expandedSections['lines'] ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          <h3 className="text-lg font-medium">Líneas</h3>
        </div>
        
        {/* Similar structure for lines */}
      </div>
      
      <div className="flex items-center mt-6">
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={filter.auto_sync} 
            onChange={() => updateSection({ section: 'auto_sync', data: { auto_sync: !filter.auto_sync } })}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2 text-gray-700">Sincronización automática</span>
        </label>
        
        {isUpdating && (
          <div className="ml-4 text-blue-600 flex items-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span>Guardando...</span>
          </div>
        )}
      </div>
    </div>
  );
};
