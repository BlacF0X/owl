'use client';

import React, { useEffect, useState } from 'react';
import TemperatureCircle from '@/components/TemperatureCircle';
import TemperatureDayChart from '@/components/TemperatureDayChart';

// --- Types ---
export interface TemperatureSensor {
  sensor_id: string;
  name: string;
  displayValue: string;
  type: {
    unit: string;
  };
}

interface HistoryItem {
  value_num: number;
  timestamp: string;
}

interface ChartDataPoint {
  label: string;
  value: number | null;
}

interface Props {
  initialSensors: TemperatureSensor[];
  token: string | null;
}

type ViewMode = 'current' | 'max' | 'min';

// --- Composant Carte Individuelle ---
const SensorCard = ({
  sensor,
  token,
  viewMode,
}: {
  sensor: TemperatureSensor;
  token: string | null;
  viewMode: ViewMode;
}) => {
  const [loading, setLoading] = useState(true);

  const [data24h, setData24h] = useState<ChartDataPoint[]>([]);
  const [data7dMax, setData7dMax] = useState<ChartDataPoint[]>([]);
  const [data7dMin, setData7dMin] = useState<ChartDataPoint[]>([]);

  const [currentTemp, setCurrentTemp] = useState<number>(0);
  const [maxTempToday, setMaxTempToday] = useState<number | null>(null);
  const [minTempToday, setMinTempToday] = useState<number | null>(null);

  const [currentHourIndex, setCurrentHourIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const res = await fetch(`${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=7d`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('API fetch failed');

        const rawData: HistoryItem[] = await res.json();
        if (rawData.length === 0) return;

        const sortedData = rawData.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const lastDataPoint = sortedData[sortedData.length - 1];
        const referenceDate = new Date(lastDataPoint.timestamp);

        setCurrentTemp(parseFloat(sensor.displayValue) || 0);

        // 1. Temps Réel
        const refHour = referenceDate.getHours();
        setCurrentHourIndex(refHour);
        const chartPoints24h: ChartDataPoint[] = [];
        for (let hour = 0; hour <= 23; hour++) {
          const hourLabel = `${hour.toString().padStart(2, '0')}h`;
          if (hour > refHour) {
            chartPoints24h.push({ label: hourLabel, value: null });
            continue;
          }
          const match = sortedData.find((d) => {
            const dTime = new Date(d.timestamp);
            return dTime.getDate() === referenceDate.getDate() && dTime.getHours() === hour;
          });
          if (match) {
            chartPoints24h.push({ label: hourLabel, value: match.value_num });
          } else if (chartPoints24h.length > 0) {
            chartPoints24h.push({
              label: hourLabel,
              value: chartPoints24h[chartPoints24h.length - 1].value,
            });
          } else {
            const firstVal =
              sortedData.find((d) => new Date(d.timestamp).getDate() === referenceDate.getDate())
                ?.value_num || 0;
            chartPoints24h.push({ label: hourLabel, value: firstVal });
          }
        }
        setData24h(chartPoints24h);

        // 2. Max & Min
        const tempsByDay = new Map<string, number[]>();
        sortedData.forEach((item) => {
          const d = new Date(item.timestamp);
          const dayKey = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
          if (!tempsByDay.has(dayKey)) tempsByDay.set(dayKey, []);
          tempsByDay.get(dayKey)?.push(item.value_num);
        });

        const chartPointsMax: ChartDataPoint[] = [];
        const chartPointsMin: ChartDataPoint[] = [];
        tempsByDay.forEach((temps, day) => {
          chartPointsMax.push({ label: day, value: Math.max(...temps) });
          chartPointsMin.push({ label: day, value: Math.min(...temps) });
        });
        setData7dMax(chartPointsMax);
        setData7dMin(chartPointsMin);

        const todayKeyStr = referenceDate.toLocaleDateString('fr-FR', {
          weekday: 'short',
          day: 'numeric',
        });
        const todayTemps = tempsByDay.get(todayKeyStr) || [];
        if (todayTemps.length > 0) {
          setMaxTempToday(Math.max(...todayTemps));
          setMinTempToday(Math.min(...todayTemps));
        }
      } catch (err) {
        console.error(`Erreur historique ${sensor.name}`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessData();
  }, [sensor.sensor_id, token, sensor.name, sensor.displayValue]);

  let dataForChart = data24h;
  let tempForCircle = currentTemp;
  let statusLabel = 'Température en temps réel';

  if (viewMode === 'max') {
    dataForChart = data7dMax;
    tempForCircle = maxTempToday ?? 0;
    statusLabel = 'Température maximale';
  } else if (viewMode === 'min') {
    dataForChart = data7dMin;
    tempForCircle = minTempToday ?? 0;
    statusLabel = 'Température minimale';
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col lg:flex-row items-center justify-between w-full animate-in fade-in slide-in-from-bottom-4 gap-8">
      {/* Cercle (Gauche) */}
      <div className="w-full lg:w-auto lg:min-w-[300px] flex justify-center shrink-0">
        <TemperatureCircle
          sensorName={sensor.name}
          temperature={tempForCircle}
          min={15}
          max={30}
          subtitle={statusLabel}
        />
      </div>

      {/* Graphique (Droite) */}
      <div className="w-full h-[250px] lg:h-[280px] pl-0 lg:pl-6 flex-1 max-w-5xl">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full text-slate-400 text-sm">
            Chargement...
          </div>
        ) : (
          <TemperatureDayChart
            data={dataForChart}
            currentHour={viewMode === 'current' ? currentHourIndex : null}
          />
        )}
      </div>
    </div>
  );
};

// --- Composant Principal ---
export default function TemperatureDashboard({ initialSensors, token }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('current');

  if (!initialSensors || initialSensors.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-slate-500">Aucun capteur de température détecté.</p>
      </div>
    );
  }

  return (
    // MODIFICATION ICI : Retrait de 'items-center' pour aligner à gauche comme le titre
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* --- SEGMENTED CONTROL --- */}
      {/* 'self-end' pour aligner les boutons à droite (face au titre à gauche) */}
      <div className="self-end flex bg-slate-100 p-1.5 rounded-xl shadow-inner border border-slate-200 mb-4 overflow-x-auto max-w-full">
        <button
          onClick={() => setViewMode('current')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out whitespace-nowrap ${viewMode === 'current' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
        >
          Temps Réel (24h)
        </button>
        <button
          onClick={() => setViewMode('max')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out whitespace-nowrap ${viewMode === 'max' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
        >
          Max Journalier (7j)
        </button>
        <button
          onClick={() => setViewMode('min')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out whitespace-nowrap ${viewMode === 'min' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
        >
          Minima Journalier (7j)
        </button>
      </div>

      {/* --- LISTE DES CAPTEURS --- */}
      {initialSensors.map((sensor) => (
        <SensorCard key={sensor.sensor_id} sensor={sensor} token={token} viewMode={viewMode} />
      ))}
    </div>
  );
}
