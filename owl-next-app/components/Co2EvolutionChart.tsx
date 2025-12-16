'use client';

import React from 'react';
import { Wind, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// 1. Définition du type pour un point de donnée
export interface Co2DataPoint {
  hour: string;
  ppm: number;
  height?: number;
}

interface Co2EvolutionChartProps {
  data: Co2DataPoint[];
  loading: boolean;
  titleSuffix?: string;
}

// 2. Interface pour les props du Tooltip Recharts pour éviter le 'any'
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

export const EvolutionChart: React.FC<Co2EvolutionChartProps> = ({
  data,
  loading,
  titleSuffix,
}) => {
  const ppmValues = data.map((d) => d.ppm);

  // Calcul du Max
  const max = ppmValues.length > 0 ? Math.max(...ppmValues) : 0;

  // Calcul de la Moyenne
  const avg =
    ppmValues.length > 0 ? Math.round(ppmValues.reduce((a, b) => a + b, 0) / ppmValues.length) : 0;

  // Détermine la couleur
  const getColor = () => {
    if (max > 1200) return '#f43f5e'; // Rouge
    if (max > 800) return '#f59e0b'; // Orange
    return '#10b981'; // Vert
  };

  const mainColor = getColor();

  // Tooltip personnalisé avec le type corrigé
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg text-xs">
          <p className="font-bold text-slate-800 mb-1">Qualité de l'air</p>
          <p className="text-slate-600">
            Heure : <span className="font-semibold">{label}</span>
          </p>
          <p className="text-slate-600">
            CO₂ : <span className="font-semibold">{payload[0].value} ppm</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 h-full flex flex-col">
      {/* En-tête avec Icone et Titre */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="p-2 rounded-lg border"
          style={{
            backgroundColor: `${mainColor}10`,
            borderColor: `${mainColor}30`,
          }}
        >
          <Wind className="h-5 w-5" style={{ color: mainColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Évolution CO₂</h2>
          <p className="text-xs font-medium text-slate-500">
            {titleSuffix || '24 dernières heures'}
          </p>
        </div>
      </div>

      {/* Résumé des stats (Moyenne + Max) */}
      {!loading && data.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="rounded-lg bg-slate-50 px-4 py-2 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Moyenne</p>
            <p className="text-2xl font-bold text-slate-700">
              {avg} <span className="text-sm font-normal text-slate-400">ppm</span>
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-2 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Max</p>
            <p className="text-2xl font-bold text-slate-700">
              {max} <span className="text-sm font-normal text-slate-400">ppm</span>
            </p>
          </div>
        </div>
      )}

      {/* Zone du Graphique */}
      <div className="relative flex-1 min-h-[250px] w-full">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 rounded-lg backdrop-blur-sm">
            <Activity className="h-8 w-8 text-slate-300 animate-bounce mb-2" />
            <p className="text-sm font-medium text-slate-400">Chargement...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200">
            <Wind className="h-10 w-10 mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-400">Aucune donnée récente</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={mainColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={mainColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                domain={[0, (dataMax: number) => Math.max(dataMax + 100, 1000)]}
                unit=" ppm"
                width={50}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="ppm"
                stroke={mainColor}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCo2)"
                activeDot={{ r: 6, strokeWidth: 0, fill: mainColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
