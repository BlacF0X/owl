import React from 'react';
import { TrendingUp } from 'lucide-react';

export interface HumidityDataPoint {
  hour: number;
  value: number;
}

interface HumidityEvolutionChartProps {
  data: HumidityDataPoint[];
}

const HumidityEvolutionChart: React.FC<HumidityEvolutionChartProps> = ({
  data,
}) => {
  // Trouver la valeur max pour normaliser les hauteurs
  const maxValue = Math.max(...data.map((d) => d.value), 100);
  const minValue = Math.min(...data.map((d) => d.value), 0);

  // Normaliser une valeur entre 30% et 100% de hauteur pour meilleure visibilité
  const normalizeHeight = (value: number): number => {
    const range = maxValue - minValue;
    if (range === 0) return 60;
    return ((value - minValue) / range) * 70 + 30;
  };

  // Générer les labels d'axe (0h, 4h, 8h, 12h, 16h, 20h, 24h)
  const timeLabels = [0, 4, 8, 12, 16, 20, 24];

  // Calculer la moyenne
  const average = Math.round(
    data.reduce((acc, d) => acc + d.value, 0) / data.length
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
          <TrendingUp className="h-5 w-5 text-slate-700" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">
          Évolution (dernières 24h)
        </h2>
      </div>

      {/* Chart Container */}
      <div className="space-y-3">
        {/* Chart Bars - Fixed height container */}
        <div className="relative flex h-64 items-end justify-between gap-1 border-b border-slate-200 pb-2">
          {data.map((point, index) => {
            const height = normalizeHeight(point.value);
            return (
              <div
                key={index}
                className="group relative flex flex-1 items-end justify-center"
                style={{ minWidth: '8px', maxWidth: '20px' }}
              >
                {/* Tooltip on hover */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                  {point.hour}h: {point.value}%
                </div>
                {/* Bar */}
                <div
                  className="w-full rounded-t-sm bg-gradient-to-t from-teal-600 to-teal-400 transition-all duration-300 hover:from-teal-700 hover:to-teal-500"
                  style={{ height: `${height}%` }}
                  title={`${point.hour}h: ${point.value}%`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Time Labels */}
        <div className="flex justify-between px-1 text-xs text-slate-500">
          {timeLabels.map((label) => (
            <span key={label}>{label}h</span>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 rounded-lg bg-slate-50 p-3">
        <p className="text-sm text-slate-600">
          Moyenne sur 24h:{' '}
          <span className="font-semibold text-slate-900">{average}%</span>
        </p>
      </div>
    </div>
  );
};

export default HumidityEvolutionChart;