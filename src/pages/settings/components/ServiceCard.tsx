import React from "react";
import { Trash2 } from "lucide-react";
import UploadComponent from "./UploadComponent";

interface HighlightedServiceStat {
  value: string | number;
}

interface HighlightedService {
  title: string;
  description: string;
  image: string;
  stats?: HighlightedServiceStat[];
  active?: boolean;
  order?: number;
  identifier?: string;
  _id?: string;
}

interface ServiceCardProps {
  service: HighlightedService;
  index: number;
  onServiceChange: (
    index: number,
    field: keyof HighlightedService,
    value: any
  ) => void;
  onRemoveService: (index: number) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  index,
  onServiceChange,
  onRemoveService,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-48 object-cover rounded-t-2xl"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-t-2xl" />
        )}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => onRemoveService(index)}
            className="bg-white/90 backdrop-blur-sm hover:bg-white/95 text-gray-700 p-2 rounded-full shadow-sm transition-all duration-200 hover:shadow group"
          >
            <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={service.title}
                onChange={(e) =>
                  onServiceChange(index, "title", e.target.value)
                }
                placeholder="Título del servicio"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
            <div className="w-24 ml-4">
              <label className="block text-sm font-medium text-gray-700">
                Orden
              </label>
              <input
                type="number"
                min={0}
                value={service.order}
                onChange={(e) =>
                  onServiceChange(index, "order", Number(e.target.value))
                }
                placeholder="#"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              value={service.description}
              onChange={(e) =>
                onServiceChange(index, "description", e.target.value)
              }
              placeholder="Descripción del servicio"
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200 resize-none"
            />
          </div>

          <UploadComponent
            label="Imagen"
            value={service.image}
            onChange={(url) => onServiceChange(index, "image", url || "")}
            required
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">Estado</span>
          <button
            onClick={() => onServiceChange(index, "active", !service.active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 ${
              service.active ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                service.active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
