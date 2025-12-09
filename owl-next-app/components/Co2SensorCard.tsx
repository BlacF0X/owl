import React from 'react';
import { BarChart2 } from 'lucide-react';
import { RoomData } from './Co2Types';
import { useRealtimeSensor } from '@/src/hooks/useRealtimeSensor';

interface SensorCardProps {
  room: RoomData;
  isSelected: boolean;
  onSelect: () => void;
  onHistory: () => void;
  loadingHistory: boolean;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  room,
  isSelected,
  onSelect,
  onHistory,
  loadingHistory,
}) => {
  // Hook Realtime
  // room.id correspond bien au sensor_id du capteur CO2 principal de la pièce
  const { value, isLive } = useRealtimeSensor(room.id, room.value, null);

  const numericValue = Number(value);

  let computedStatus: 'good' | 'medium' | 'bad' = 'good';

  if (numericValue >= 800 && numericValue < 1200) {
    computedStatus = 'medium';
  } else if (numericValue >= 1200) {
    computedStatus = 'bad';
  }

  // 3. Définir les variables de style basées sur 'computedStatus'
  let colorClass = 'bg-emerald-500';
  let textClass = 'text-emerald-700';
  let bgClass = 'bg-emerald-50';
  let label = 'Excellent';

  if (computedStatus === 'medium') {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-700';
    bgClass = 'bg-amber-50';
    label = 'Moyen';
  } else if (computedStatus === 'bad') {
    colorClass = 'bg-rose-500';
    textClass = 'text-rose-700';
    bgClass = 'bg-rose-50';
    label = 'Critique';
  }

  const maxScale = 2000;
  const percentage = Math.min((numericValue / maxScale) * 100, 100);

  return (
    <div
      onClick={onSelect}
      className={`
        relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden
        ${
          isSelected
            ? 'bg-white border-blue-500 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)] ring-1 ring-blue-500'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
        }
        ${isLive ? 'ring-4 ring-blue-200 scale-[1.02]' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${bgClass} ${textClass}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M12.5 22l-4-8h8l-5-10" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-700 text-sm leading-tight">{room.name}</h3>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
          <span className={`relative flex h-2 w-2`}>
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-75`}
            ></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${colorClass}`}></span>
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Live
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono transition-all duration-300">
            {numericValue}
          </span>
          <span className="text-sm font-semibold text-slate-400">ppm</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-end mb-1.5">
          <span
            className={`text-xs font-bold ${textClass} uppercase tracking-wide transition-colors duration-300`}
          >
            {label}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {percentage.toFixed(0)}% Saturation
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass} transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-50 mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onHistory();
          }}
          disabled={loadingHistory}
          className={`
                w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors
                ${
                  loadingHistory
                    ? 'bg-slate-50 text-slate-400 cursor-wait'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200'
                }
            `}
        >
          {loadingHistory ? (
            <div className="h-3 w-3 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <BarChart2 className="w-3.5 h-3.5" />
          )}
          <span>Voir l'analyse détaillée</span>
        </button>
      </div>
    </div>
  );
};
