'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import TemperatureSensorCard from './TemperatureSensorCard';
import type { TemperatureSensor, SensorHistory } from './TemperatureSensorCard';

interface ChartDataPoint {
  label: string;
  value: number | null;
}

interface HistoryItem {
  value: number | string;
  timestamp: string;
}

interface Props {
  sensors: TemperatureSensor[];
  viewMode: 'current' | 'max' | 'min' | 'avg';
}

export default function TemperatureBatchLoader({ sensors, viewMode }: Props) {
  const { getToken } = useAuth();
  const [histories, setHistories] = useState<Record<string, SensorHistory>>({});
  const [loading, setLoading] = useState(true);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      const token = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const results = await Promise.allSettled(
        sensors.map(async (sensor) => {
          try {
            const res = await fetch(`${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=7d`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
              return null;
            }

            const rawData: HistoryItem[] = await res.json();
            return { sensorId: sensor.sensor_id, rawData, sensor };
          } catch (err) {
            return null;
          }
        })
      );

      const processed: Record<string, SensorHistory> = {};
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          const { sensorId, rawData, sensor } = result.value;
          processed[sensorId] = processRawData(rawData, sensor);
        }
      });

      setHistories(processed);
      setLoading(false);
    };

    loadAll();
  }, [sensors, getToken, retryTrigger]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-slate-500">Chargement de l'historique des capteurs...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {sensors.map((sensor) => (
        <TemperatureSensorCard
          key={sensor.sensor_id}
          sensor={sensor}
          history={histories[sensor.sensor_id]}
          viewMode={viewMode}
          onRetry={() => setRetryTrigger((prev) => prev + 1)}
        />
      ))}
    </div>
  );
}

function processRawData(rawData: HistoryItem[], sensor: TemperatureSensor): SensorHistory {
  if (!rawData || rawData.length === 0) {
    return {
      data24h: [],
      data7dMax: [],
      data7dMin: [],
      data7dAvg: [],
      currentTemp: parseFloat(sensor.displayValue) || 0,
      maxTempToday: null,
      minTempToday: null,
      avgTempToday: null,
      currentHourIndex: null,
    };
  }

  const sortedData = rawData.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const lastDataPoint = sortedData[sortedData.length - 1];
  const referenceDate = new Date(lastDataPoint.timestamp);
  const referenceDayKey = referenceDate.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
  });
  const refHour = referenceDate.getHours();

  // ============ DONNÉES 24H ============
  const chartData24h: ChartDataPoint[] = [];
  for (let hour = 0; hour <= 23; hour++) {
    const hourLabel = `${hour.toString().padStart(2, '0')}h`;
    if (hour > refHour) {
      chartData24h.push({ label: hourLabel, value: null });
      continue;
    }

    const match = sortedData.find((d) => {
      const dTime = new Date(d.timestamp);
      return (
        dTime.getDate() === referenceDate.getDate() &&
        dTime.getMonth() === referenceDate.getMonth() &&
        dTime.getHours() === hour
      );
    });

    if (match) {
      chartData24h.push({ label: hourLabel, value: Number(match.value) });
    } else {
      const prev = chartData24h.length > 0 ? chartData24h[chartData24h.length - 1].value : null;
      chartData24h.push({ label: hourLabel, value: prev });
    }
  }

  // ============ DONNÉES 7 JOURS ============
  const tempsByDay = new Map<string, number[]>();
  const dayKeysInOrder: string[] = [];

  sortedData.forEach((item) => {
    const d = new Date(item.timestamp);
    const dayKey = d.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
    });
    
    if (!tempsByDay.has(dayKey)) {
      dayKeysInOrder.push(dayKey);
      tempsByDay.set(dayKey, []);
    }
    
    const val = Number(item.value);
    if (!isNaN(val)) {
      tempsByDay.get(dayKey)!.push(val);
    }
  });

  const data7dMax: ChartDataPoint[] = [];
  const data7dMin: ChartDataPoint[] = [];
  const data7dAvg: ChartDataPoint[] = [];

  dayKeysInOrder.forEach((dayKey) => {
    const temps = tempsByDay.get(dayKey) || [];
    
    if (temps.length === 0) {
      data7dMax.push({ label: dayKey, value: null });
      data7dMin.push({ label: dayKey, value: null });
      data7dAvg.push({ label: dayKey, value: null });
    } else {
      const maxTemp = Math.max(...temps);
      const minTemp = Math.min(...temps);
      const avgTemp = Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10;
      
      data7dMax.push({ label: dayKey, value: maxTemp });
      data7dMin.push({ label: dayKey, value: minTemp });
      data7dAvg.push({ label: dayKey, value: avgTemp });
    }
  });

  const todayTemps = tempsByDay.get(referenceDayKey) || [];
  
  const maxTempToday = todayTemps.length > 0 ? Math.max(...todayTemps) : null;
  const minTempToday = todayTemps.length > 0 ? Math.min(...todayTemps) : null;
  const avgTempToday = todayTemps.length > 0 
    ? Math.round((todayTemps.reduce((a, b) => a + b, 0) / todayTemps.length) * 10) / 10 
    : null;

  return {
    data24h: chartData24h,
    data7dMax,
    data7dMin,
    data7dAvg,
    currentTemp: parseFloat(sensor.displayValue) || 0,
    maxTempToday,
    minTempToday,
    avgTempToday,
    currentHourIndex: refHour,
  };
}
