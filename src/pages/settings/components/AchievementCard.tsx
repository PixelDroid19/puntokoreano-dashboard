import React from 'react';
import { Trash2, MoveVertical, Trophy } from 'lucide-react';
import UploadComponent from './UploadComponent';

interface Achievement {
  title: string;
  value: string;
  active: boolean;
  order: number;
  _id?: string;
  icon_url?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
  onAchievementChange: (index: number, field: keyof Achievement, value: any) => void;
  onRemoveAchievement: (index: number) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  index,
  onAchievementChange,
  onRemoveAchievement,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg overflow-hidden">
      <div className="relative bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Trophy className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Logro {index + 1}</h3>
          </div>
          <button
            onClick={() => onRemoveAchievement(index)}
            className="p-2 hover:bg-white/90 rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-5 h-5 text-gray-500 hover:text-red-500" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={achievement.title}
              onChange={(e) => onAchievementChange(index, "title", e.target.value)}
              placeholder="Título del logro"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Orden
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                value={achievement.order}
                onChange={(e) => onAchievementChange(index, "order", Number(e.target.value))}
                placeholder="Orden de visualización"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors duration-200 pl-10"
              />
              <MoveVertical className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Valor <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={achievement.value}
            onChange={(e) => onAchievementChange(index, "value", e.target.value)}
            placeholder="Valor del logro (ej: 500+)"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors duration-200"
          />
        </div>

        <UploadComponent
          label="Imagen de ícono"
          value={achievement.icon_url}
          onChange={(url) => onAchievementChange(index, "icon_url", url || "")}
          isIcon={true}
        />

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">Estado</span>
          <button
            onClick={() => onAchievementChange(index, "active", !achievement.active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 ${
              achievement.active ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                achievement.active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;

