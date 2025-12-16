'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import TemperatureCircle from './TemperatureCircle';
import TemperatureDayChart from './TemperatureDayChart';

interface ChartDataPoint {
  label: string;
  value: number | null;
}

export interface TemperatureSensor {
  sensor_id: string;
  name: string;
  displayValue: string;
  state_changed_at?: string;
  hub?: {
    hub_id: string;
    name: string;
    created_at?: string; // ✅ AJOUT ICI
  };
  type: {
    typekey: string;
    name: string;
    unit: string;
  };
}

export interface SensorHistory {
  data24h: ChartDataPoint[];
  data7dMax: ChartDataPoint[];
  data7dMin: ChartDataPoint[];
  data7dAvg: ChartDataPoint[];
  currentTemp: number;
  maxTempToday: number | null;
  minTempToday: number | null;
  avgTempToday: number | null;
  currentHourIndex: number | null;
}

interface Props {
  sensor: TemperatureSensor;
  history?: SensorHistory;
  viewMode: 'current' | 'max' | 'min' | 'avg';
  onRetry?: () => void;
}

export default function TemperatureSensorCard({ sensor, history, viewMode, onRetry }: Props) {
  if (!history) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center min-h-[280px] animate-pulse">
        <div className="text-center max-w-md">
          <div className="w-48 h-48 bg-slate-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  let dataForChart = history.data24h;
  let tempForCircle = history.currentTemp;
  let statusLabel = 'Température en temps réel';
  let currentHour = history.currentHourIndex;

  if (viewMode === 'max') {
    dataForChart = history.data7dMax;
    tempForCircle = history.maxTempToday ?? 0;
    statusLabel = 'Température maximale (7j)';
    currentHour = null;
  } else if (viewMode === 'min') {
    dataForChart = history.data7dMin;
    tempForCircle = history.minTempToday ?? 0;
    statusLabel = 'Température minimale (7j)';
    currentHour = null;
  } else if (viewMode === 'avg') {
    dataForChart = history.data7dAvg;
    tempForCircle = history.avgTempToday ?? 0;
    statusLabel = 'Température moyenne (7j)';
    currentHour = null;
  }

  if (dataForChart.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center min-h-[280px]">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{sensor.name}</h3>
          <p className="text-sm text-slate-600 mb-4">Aucune donnée historique disponible</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </button>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-400">Température actuelle</p>
            <p className="text-2xl font-bold text-slate-900">{sensor.displayValue}°C</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col lg:flex-row items-center justify-between w-full animate-in fade-in slide-in-from-bottom-4 gap-8">
      <div className="w-full lg:w-auto lg:min-w-[300px] flex justify-center shrink-0">
        <TemperatureCircle
          sensorName={sensor.name}
          temperature={tempForCircle}
          min={15}
          max={30}
          subtitle={statusLabel}
        />
      </div>

      <div className="w-full h-[250px] lg:h-[280px] pl-0 lg:pl-6 flex-1 max-w-5xl">
        <TemperatureDayChart data={dataForChart} currentHour={currentHour} />
      </div>
    </div>
  );
}
