'use client';

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
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Aucune donnée disponible</p>
      </div>
    );
  }

  // Calculer min et max des valeurs
  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1; // Éviter division par zéro

  // Calculer la moyenne
  const average = Math.round(
    values.reduce((acc, val) => acc + val, 0) / values.length
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

      {/* Chart */}
      <div className="space-y-3">
        {/* Chart bars container with fixed height */}
        <div className="relative h-64 border-b border-slate-200">
          <div className="flex h-full items-end justify-between gap-1 pb-2">
            {data.map((point, index) => {
              // Normaliser la hauteur entre 20% et 95% pour meilleure visibilité
              const normalizedHeight = 
                range > 0 
                  ? ((point.value - minValue) / range) * 75 + 20
                  : 50;

              return (
                <div
                  key={index}
                  className="group relative flex flex-1 items-end justify-center"
                  style={{ minWidth: '4px', maxWidth: '24px' }}
                >
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                    {point.hour}h: {point.value}%
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full rounded-t-sm bg-gradient-to-t from-teal-600 to-teal-400 transition-all duration-200 hover:from-teal-700 hover:to-teal-500"
                    style={{ 
                      height: `${normalizedHeight}%`,
                      minHeight: '8px'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Time labels */}
        <div className="flex justify-between text-xs text-slate-500">
          <span>0h</span>
          <span>4h</span>
          <span>8h</span>
          <span>12h</span>
          <span>16h</span>
          <span>20h</span>
          <span>24h</span>
        </div>
      </div>

      {/* Average info */}
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