'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Router } from 'lucide-react';
import TemperatureCircle from './TemperatureCircle';
import TemperatureDayChart from './TemperatureDayChart';

interface ChartDataPoint {
  label: string;
  value: number | null;
}

export interface HubSummary {
  hubid: string;
  hubname: string;
  hubcreatedat?: string;
  sensorcount: number;
  currenttemp: number;
  avgtemp7d: number | null;
  maxtemp7d: number | null;
  mintemp7d: number | null;
  chartData24h: ChartDataPoint[];
  chartData7dAvg: ChartDataPoint[];
  chartData7dMax: ChartDataPoint[];
  chartData7dMin: ChartDataPoint[];
}

interface Props {
  hub: HubSummary;
  viewMode: 'current' | 'max' | 'min' | 'avg';
}

// Sous-composant pour le badge (réutilisé pour Mobile et Desktop)
const SensorCountBadge = ({ count, className = '' }: { count: number; className?: string }) => (
  <div
    className={`flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200/50 ${className}`}
  >
    <div className="flex items-center gap-2 mb-1 lg:mb-2">
      <Router className="w-4 h-4 text-blue-500 opacity-60" />
      <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Capteurs</span>
    </div>
    <p className="text-3xl lg:text-5xl font-extrabold text-blue-600 leading-none">{count}</p>
  </div>
);

export default function TemperatureHubCard({ hub, viewMode }: Props) {
  const router = useRouter();

  const { temperature, chartData, subtitle, currentHour } = useMemo(() => {
    let temp = hub.avgtemp7d ?? 0;
    let data = hub.chartData7dAvg;
    let sub = 'Moyenne 7 jours';
    let hour: number | null = null;

    if (viewMode === 'current') {
      temp = hub.currenttemp;
      data = hub.chartData24h;
      sub = 'Actuelle (24h)';
      const now = new Date();
      hour = now.getHours();
    } else if (viewMode === 'max') {
      temp = hub.maxtemp7d ?? 0;
      data = hub.chartData7dMax;
      sub = 'Max 7 jours';
    } else if (viewMode === 'min') {
      temp = hub.mintemp7d ?? 0;
      data = hub.chartData7dMin;
      sub = 'Min 7 jours';
    }

    return { temperature: temp, chartData: data, subtitle: sub, currentHour: hour };
  }, [hub, viewMode]);

  const isNewHub = useMemo(() => {
    if (!hub.hubcreatedat) return false;
    const createdDate = new Date(hub.hubcreatedat);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdDate > sevenDaysAgo;
  }, [hub.hubcreatedat]);

  const handleClick = () => {
    router.push(`/dashboard/temperatures-datas?hubId=${hub.hubid}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 w-full animate-in fade-in slide-in-from-bottom-4 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all duration-300"
    >
      {/* Badge NOUVEAU */}
      {isNewHub && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-lg shadow-md animate-pulse">
            <Sparkles className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-wide">New</span>
          </div>
        </div>
      )}

      {/* CONTENEUR PRINCIPAL : Flex column sur mobile, Row sur desktop */}
      <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        {/* BLOC GAUCHE : Info Hub & Cercle */}
        <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4">
          {/* Cercle */}
          <div className="shrink-0 transform transition-transform group-hover:scale-105">
            <TemperatureCircle
              sensorName={hub.hubname}
              temperature={temperature}
              min={15}
              max={30}
              subtitle={subtitle}
            />
          </div>

          {/* VERSION MOBILE du Badge Compteur (Caché sur LG+) */}
          <div className="lg:hidden flex-1 max-w-[120px]">
            <SensorCountBadge count={hub.sensorcount} className="p-3 h-full" />
          </div>
        </div>

        {/* SEPARATEUR (Visible uniquement sur Desktop) */}
        <div className="hidden lg:block w-px h-32 bg-slate-100 mx-2"></div>

        {/* BLOC CENTRAL : Graphique */}
        <div className="w-full flex-1 min-w-0">
          {/* Hauteur ajustée : 200px sur mobile, 260px sur desktop */}
          <div className="w-full h-[200px] lg:h-[260px]">
            <TemperatureDayChart data={chartData} currentHour={currentHour} />
          </div>
        </div>

        {/* BLOC DROITE : Badge Compteur (Visible uniquement sur Desktop) */}
        <div className="hidden lg:block w-[180px] shrink-0">
          <SensorCountBadge count={hub.sensorcount} className="p-6 h-full min-h-[160px]" />
        </div>
      </div>
    </div>
  );
}
