'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
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

export default function TemperatureHubCard({ hub, viewMode }: Props) {
  const router = useRouter();

  // ✅ OPTIMISATION : Mémoïsation du calcul de température
  const { temperature, chartData, subtitle, currentHour } = useMemo(() => {
    let temp = hub.avgtemp7d ?? 0;
    let data = hub.chartData7dAvg;
    let sub = 'Moyenne 7 jours';
    let hour: number | null = null;

    if (viewMode === 'current') {
      temp = hub.currenttemp;
      data = hub.chartData24h;
      sub = 'Température actuelle (24h)';
      const now = new Date();
      hour = now.getHours();
    } else if (viewMode === 'max') {
      temp = hub.maxtemp7d ?? 0;
      data = hub.chartData7dMax;
      sub = 'Maximum 7 jours';
    } else if (viewMode === 'min') {
      temp = hub.mintemp7d ?? 0;
      data = hub.chartData7dMin;
      sub = 'Minimum 7 jours';
    }

    return { temperature: temp, chartData: data, subtitle: sub, currentHour: hour };
  }, [hub, viewMode]);

  // ✅ Badge NOUVEAU si hub créé il y a moins de 7 jours
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
      className="bg-white rounded-xl shadow-md p-6 flex flex-col lg:flex-row items-center justify-between w-full animate-in fade-in slide-in-from-bottom-4 gap-8 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-200 relative"
    >
      {/* ✅ Badge NOUVEAU */}
      {isNewHub && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full shadow-lg animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-bold uppercase tracking-wide">Nouveau</span>
          </div>
        </div>
      )}

      {/* Cercle */}
      <div className="w-full lg:w-auto lg:min-w-[300px] flex justify-center shrink-0">
        <TemperatureCircle
          sensorName={hub.hubname}
          temperature={temperature}
          min={15}
          max={30}
          subtitle={subtitle}
        />
      </div>

      {/* Container flex pour graphique + badge */}
      <div className="flex-1 flex flex-col lg:flex-row items-center gap-6 w-full">
        {/* Graphique */}
        <div className="w-full lg:w-3/4 h-[250px]">
          <TemperatureDayChart data={chartData} currentHour={currentHour} />
        </div>

        {/* Badge nombre de capteurs */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 min-w-[200px]">
          <p className="text-5xl font-extrabold text-blue-600">{hub.sensorcount}</p>
          <p className="text-sm font-semibold text-blue-800 mt-2">
            Capteur{hub.sensorcount > 1 ? 's' : ''} connecté{hub.sensorcount > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
