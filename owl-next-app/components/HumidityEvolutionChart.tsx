'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity } from 'lucide-react';

export interface HumidityDataPoint {
  hour: number;
  value: number;
}

interface HumidityEvolutionChartProps {
  data: HumidityDataPoint[];
}

const HumidityEvolutionChart: React.FC<HumidityEvolutionChartProps> = ({ data }) => {
  // Calcul de la moyenne pour l'affichage (optionnel)
  const average =
    data.length > 0
      ? Math.round(data.reduce((acc, curr) => acc + curr.value, 0) / data.length)
      : 0;

  // Formatage des heures (ex: "14h")
  const formatXAxis = (tickItem: number) => `${tickItem}h`;

  // Custom Tooltip pour un affichage propre au survol
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="mb-1 text-sm font-semibold text-slate-700">{label}h00</p>
          <p className="text-sm font-medium text-blue-600">
            Humidité : <span className="font-bold">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <div className="rounded-lg bg-slate-100 p-2">
          <Activity className="h-5 w-5 text-slate-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Évolution (dernières 24h)</h3>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="hour"
              tickFormatter={formatXAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              unit="%"
              domain={[0, 100]} // Force l'axe Y de 0 à 100
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" // Lissage de la courbe
              dataKey="value"
              stroke="#3b82f6" // Bleu
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorHumidity)"
              connectNulls={true} // ✅ C'est ça qui relie les points s'il y a des trous !
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 border-t pt-4">
        <p className="text-sm font-medium text-slate-500">
          Moyenne sur 24h : <span className="font-bold text-slate-900">{average}%</span>
        </p>
      </div>
    </div>
  );
};

export default HumidityEvolutionChart;
