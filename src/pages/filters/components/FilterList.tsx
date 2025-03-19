import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash, Plus, Loader2 } from 'lucide-react';
import FiltersService from '../../../services/filters.service';

interface FilterListProps {
  onSelectFilter: (filterId: string) => void;
  selectedFilterId?: string;
}

export const FilterList: React.FC<FilterListProps> = ({ onSelectFilter, selectedFilterId }) => {
  const queryClient = useQueryClient();
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  // Fetch all filters
  const { data: filters = [], isLoading } = useQuery({
    queryKey: ['filters'],
    queryFn: async () => {
      const response = await FiltersService.getFilters();
      return response.filters || [];
    }
  });

  // Delete filter mutation
  const { mutate: deleteFilter, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      await FiltersService.deleteFilter(id);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['filters'] });
      if (selectedFilterId === deletedId) {
        onSelectFilter('');
      }
      setShowConfirmDelete(null);
    }
  });

  const handleDeleteClick = (id: string) => {
    setShowConfirmDelete(id);
  };

  const confirmDelete = (id: string) => {
    deleteFilter(id);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Filtros de Vehículos</h3>
        <button 
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          onClick={() => onSelectFilter('new')}
        >
          <Plus className="w-4 h-4 mr-1" />
          Nuevo Filtro
        </button>
      </div>
      
      {filters.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No hay filtros disponibles
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {filters.map((filter) => (
            <li key={filter.id} className="px-4 py-3 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => onSelectFilter(filter.id)}
                  className={`text-left flex-grow ${selectedFilterId === filter.id ? 'font-semibold text-blue-600' : ''}`}
                >
                  <div className="font-medium">{filter.family_name}</div>
                  <div className="text-sm text-gray-500">
                    {Object.keys(filter.families || {}).length} años, 
                    {Object.values(filter.families || {}).reduce((acc, models) => acc + models.length, 0)} modelos
                  </div>
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSelectFilter(filter.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  
                  {showConfirmDelete === filter.id ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => confirmDelete(filter.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Eliminando...' : 'Confirmar'}
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                        disabled={isDeleting}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteClick(filter.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
