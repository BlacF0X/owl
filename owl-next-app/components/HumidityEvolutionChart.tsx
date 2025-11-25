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

  // Axe Y de 0 à 100%
  const yTicks = [100, 80, 60, 40, 20, 0];

  // Calculer la moyenne
  const average = Math.round(
    data.reduce((acc, d) => acc + d.value, 0) / data.length
  );

  // Fonction pour obtenir la couleur selon le pourcentage
  const getBarColor = (value: number) => {
    if (value >= 40 && value <= 60) {
      return 'from-green-600 to-green-400';
    } else if (value > 60 && value <= 70) {
      return 'from-yellow-600 to-yellow-400';
    } else {
      return 'from-red-600 to-red-400';
    }
  };

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
      <div className="relative flex gap-3">
        {/* Axe Y avec labels */}
        <div
          className="flex flex-col justify-between py-1"
          style={{ height: '256px' }}
        >
          {yTicks.map((tick) => (
            <div
              key={tick}
              className="text-xs font-medium text-slate-500"
              style={{ width: '35px', textAlign: 'right', lineHeight: '1' }}
            >
              {tick}%
            </div>
          ))}
        </div>

        {/* Zone du graphique */}
        <div className="relative flex-1">
          {/* Lignes de grille horizontales - SANS ligne à 0% */}
          <div className="absolute inset-0 flex flex-col justify-between py-1">
            {yTicks.map((tick, index) => (
              <div
                key={tick}
                className={
                  index === yTicks.length - 1
                    ? '' // Pas de bordure pour 0%
                    : 'border-b border-slate-100'
                }
                style={{ height: '0px' }}
              />
            ))}
          </div>

          {/* Container des barres */}
          <div className="relative flex h-64 items-end justify-between gap-1 px-1 pb-3">
            {data.map((point, index) => {
              const heightPx = (point.value / 100) * 256;
              const colorClass = getBarColor(point.value);

              return (
                <div
                  key={index}
                  className="group relative flex flex-1 items-end justify-center"
                  style={{ minWidth: '6px', maxWidth: '24px' }}
                >
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
                    <div className="text-center">
                      {point.hour}h: {point.value}%
                    </div>
                  </div>

                  {/* Barre avec couleur dynamique */}
                  <div
                    className={`w-full rounded-t-sm bg-gradient-to-t ${colorClass} transition-all duration-200 hover:opacity-80`}
                    style={{
                      height: `${heightPx}px`,
                      minHeight: point.value > 0 ? '2px' : '0px',
                    }}
                    title={`${point.hour}h: ${point.value}%`}
                  />
                </div>
              );
            })}
          </div>

          {/* Labels de l'axe X */}
          <div className="flex justify-between px-1 text-xs font-medium text-slate-500">
            {data
              .filter((_, i) => i % 4 === 0)
              .map((point) => (
                <span key={point.hour}>{point.hour}h</span>
              ))}
          </div>
        </div>
      </div>

      {/* Info moyenne */}
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