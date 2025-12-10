'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface HumidityDataPoint {
  hour: number;
  value: number;
}

interface HumidityEvolutionChartProps {
  data: HumidityDataPoint[];
}

export default function HumidityEvolutionChart({ data }: HumidityEvolutionChartProps) {
  // Calcul de la moyenne
  const average =
    data.length > 0 ? Math.round(data.reduce((acc, d) => acc + d.value, 0) / data.length) : 0;

  // Format des données pour Recharts
  const chartData = data.map((item) => ({
    hour: `${item.hour}h00`,
    value: item.value,
  }));

  // Tooltip personnalisé
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg text-xs">
          <p className="font-bold text-slate-800">Humidité</p>
          <p className="text-slate-600">
            Heure: <span className="font-semibold">{label}</span>
          </p>
          <p className="text-slate-600">
            Valeur: <span className="font-semibold">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
          <Activity className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Évolution de l'humidité (24h)</h3>
          <p className="text-sm text-slate-500">Tendance horaire</p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="mb-6 flex gap-4">
        <div className="rounded-lg bg-blue-50 px-4 py-2">
          <p className="text-xs font-semibold text-slate-600 uppercase">Moyenne</p>
          <p className="text-2xl font-bold text-blue-600">{average}%</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-2">
          <p className="text-xs font-semibold text-slate-600 uppercase">Min</p>
          <p className="text-2xl font-bold text-slate-600">
            {data.length > 0 ? Math.min(...data.map((d) => d.value)) : '-'}%
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-2">
          <p className="text-xs font-semibold text-slate-600 uppercase">Max</p>
          <p className="text-2xl font-bold text-slate-600">
            {data.length > 0 ? Math.max(...data.map((d) => d.value)) : '-'}%
          </p>
        </div>
      </div>

      {/* Graphique */}
      {data.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <p className="text-slate-500">Aucune donnée disponible</p>
        </div>
      )}
    </div>
  );
}
