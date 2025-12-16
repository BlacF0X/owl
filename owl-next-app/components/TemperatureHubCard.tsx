'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import TemperatureCircle from './TemperatureCircle';
import TemperatureDayChart from './TemperatureDayChart';

interface ChartDataPoint {
  label: string;
  value: number | null;
}

export interface HubSummary {
  hubid: string;
  hubname: string;
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

  let temperature = hub.avgtemp7d ?? 0;
  let chartData = hub.chartData7dAvg;
  let subtitle = 'Moyenne 7 jours';
  let currentHour: number | null = null;

  if (viewMode === 'current') {
    temperature = hub.currenttemp;
    chartData = hub.chartData24h;
    subtitle = 'Température actuelle (24h)';
    
    // 🔥 FIX : Heure locale de Bruxelles
    const now = new Date();
    currentHour = now.getHours();
  } else if (viewMode === 'max') {
    temperature = hub.maxtemp7d ?? 0;
    chartData = hub.chartData7dMax;
    subtitle = 'Maximum 7 jours';
  } else if (viewMode === 'min') {
    temperature = hub.mintemp7d ?? 0;
    chartData = hub.chartData7dMin;
    subtitle = 'Minimum 7 jours';
  }

  const handleClick = () => {
    router.push(`/dashboard/temperatures-datas?hubId=${hub.hubid}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-md p-6 flex flex-col lg:flex-row items-center justify-between w-full animate-in fade-in slide-in-from-bottom-4 gap-8 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
    >
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
