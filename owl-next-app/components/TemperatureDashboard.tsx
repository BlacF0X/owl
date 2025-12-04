'use client';

import React, { useEffect, useState } from 'react';
import TemperatureCircle from '@/components/TemperatureCircle';
import TemperatureDayChart from '@/components/TemperatureDayChart';
import DashboardViewButtons, { ViewMode } from '@/components/TemperatureViewButtons';

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
  value_num: number | string;
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

// --- Composant Carte Individuelle ---
const SensorCard = ({ sensor, token, viewMode }: { sensor: TemperatureSensor; token: string | null; viewMode: ViewMode }) => {
  const [loading, setLoading] = useState(true);
  
  const [data24h, setData24h] = useState<ChartDataPoint[]>([]);
  const [data7dMax, setData7dMax] = useState<ChartDataPoint[]>([]);
  const [data7dMin, setData7dMin] = useState<ChartDataPoint[]>([]);
  const [data7dAvg, setData7dAvg] = useState<ChartDataPoint[]>([]);
  
  const [currentTemp, setCurrentTemp] = useState<number>(0);
  const [maxTempToday, setMaxTempToday] = useState<number | null>(null);
  const [minTempToday, setMinTempToday] = useState<number | null>(null);
  const [avgTempToday, setAvgTempToday] = useState<number | null>(null);
  
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
        
        const res = await fetch(`${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=30d`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error('API fetch failed');
        
        const rawData: HistoryItem[] = await res.json();
        if (rawData.length === 0) return;

        const sortedData = rawData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const lastDataPoint = sortedData[sortedData.length - 1];
        
        const referenceDate = new Date(lastDataPoint.timestamp);
        const referenceDayKey = referenceDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
        
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
          const match = sortedData.find(d => {
            const dTime = new Date(d.timestamp);
            return dTime.getDate() === referenceDate.getDate() && 
                   dTime.getMonth() === referenceDate.getMonth() &&
                   dTime.getHours() === hour;
          });
          
          if (match) {
            chartPoints24h.push({ label: hourLabel, value: Number(match.value_num) });
          } else {
             const prev = chartPoints24h.length > 0 ? chartPoints24h[chartPoints24h.length - 1].value : null;
             chartPoints24h.push({ label: hourLabel, value: prev });
          }
        }
        setData24h(chartPoints24h);

        // 2. Stats JOURNALIÈRES
        const tempsByDay = new Map<string, number[]>();
        const dayKeysInOrder = new Set<string>();

        sortedData.forEach(item => {
          const d = new Date(item.timestamp);
          const dayKey = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
          
          if (!tempsByDay.has(dayKey)) {
              tempsByDay.set(dayKey, []);
              dayKeysInOrder.add(dayKey);
          }
          
          const val = Number(item.value_num);
          if (!isNaN(val)) {
            tempsByDay.get(dayKey)?.push(val);
          }
        });

        const chartPointsMax: ChartDataPoint[] = [];
        const chartPointsMin: ChartDataPoint[] = [];
        const chartPointsAvg: ChartDataPoint[] = [];

        dayKeysInOrder.forEach(key => {
             const temps = tempsByDay.get(key);
             if (temps && temps.length > 0) {
                 const max = Math.max(...temps);
                 const min = Math.min(...temps);
                 const avg = temps.reduce((a,b)=>a+b,0) / temps.length;
                 
                 chartPointsMax.push({ label: key, value: max });
                 chartPointsMin.push({ label: key, value: min });
                 chartPointsAvg.push({ label: key, value: avg });
             }
        });
        
        const sliceLast7 = (arr: ChartDataPoint[]) => arr.slice(-7);

        setData7dMax(sliceLast7(chartPointsMax));
        setData7dMin(sliceLast7(chartPointsMin));
        setData7dAvg(sliceLast7(chartPointsAvg));

        // 3. Stats du CERCLE
        const lastDayTemps = tempsByDay.get(referenceDayKey) || [];
        if (lastDayTemps.length > 0) {
            setMaxTempToday(Math.max(...lastDayTemps));
            setMinTempToday(Math.min(...lastDayTemps));
            setAvgTempToday(lastDayTemps.reduce((a, b) => a + b, 0) / lastDayTemps.length);
        } else {
            setMaxTempToday(0);
            setMinTempToday(0);
            setAvgTempToday(0);
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
  let statusLabel = "Température en temps réel";

  if (viewMode === 'max') {
      dataForChart = data7dMax;
      tempForCircle = maxTempToday ?? 0;
      statusLabel = "Température maximale";
  } else if (viewMode === 'min') {
      dataForChart = data7dMin;
      tempForCircle = minTempToday ?? 0;
      statusLabel = "Température minimale";
  } else if (viewMode === 'avg') {
      dataForChart = data7dAvg;
      tempForCircle = avgTempToday ?? 0;
      statusLabel = "Température moyenne";
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
        {loading ? (
          <div className="flex items-center justify-center w-full h-full text-slate-400 text-sm">Chargement...</div>
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
    <div className="flex flex-col gap-6 w-full pb-10">
      
      <DashboardViewButtons currentMode={viewMode} onChange={setViewMode} />

      {initialSensors.map((sensor) => (
        <SensorCard key={sensor.sensor_id} sensor={sensor} token={token} viewMode={viewMode} />
      ))}
    </div>
  );
}
