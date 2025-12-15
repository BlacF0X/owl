'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import TemperatureSensorCard from './TemperatureSensorCard';
import type { TemperatureSensor, SensorHistory } from './TemperatureSensorCard';

interface HistoryItem {
  value_num: number | string;
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

      // Batch fetch en parallèle
      const results = await Promise.allSettled(
        sensors.map(async (sensor) => {
          try {
            let res = await fetch(`${API_URL}/api/sensors/${sensor.sensorid}/readings?period=30d`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
              res = await fetch(`${API_URL}/api/sensors/${sensor.sensorid}/readings?period=7d`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            }

            if (!res.ok) return null;

            const rawData: HistoryItem[] = await res.json();
            return { sensorId: sensor.sensorid, rawData, sensor };
          } catch (err) {
            console.warn(`Erreur pour ${sensor.name}:`, err);
            return null;
          }
        })
      );

      // Traiter les résultats
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
          key={sensor.sensorid}
          sensor={sensor}
          history={histories[sensor.sensorid]}
          viewMode={viewMode}
          onRetry={() => setRetryTrigger((prev) => prev + 1)}
        />
      ))}
    </div>
  );
}

// Fonction de traitement
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
  const referenceDayKey = referenceDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  const refHour = referenceDate.getHours();

  // Données 24h
  const chartData24h: { label: string; value: number | null }[] = [];
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
      chartData24h.push({ label: hourLabel, value: Number(match.value_num) });
    } else {
      const prev = chartData24h.length > 0 ? chartData24h[chartData24h.length - 1].value : null;
      chartData24h.push({ label: hourLabel, value: prev });
    }
  }

  // Grouper par jour
  const tempsByDay = new Map<string, number[]>();
  const dayKeysInOrder = new Set<string>();

  sortedData.forEach((item) => {
    const d = new Date(item.timestamp);
    const dayKey = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

    if (!tempsByDay.has(dayKey)) {
      tempsByDay.set(dayKey, []);
      dayKeysInOrder.add(dayKey);
    }

    const val = Number(item.value_num);
    if (!isNaN(val)) tempsByDay.get(dayKey)?.push(val);
  });

  const chartData7dMax: { label: string; value: number }[] = [];
  const chartData7dMin: { label: string; value: number }[] = [];
  const chartData7dAvg: { label: string; value: number }[] = [];

  dayKeysInOrder.forEach((key) => {
    const temps = tempsByDay.get(key);
    if (temps && temps.length > 0) {
      const max = Math.max(...temps);
      const min = Math.min(...temps);
      const avg = temps.reduce((a, b) => a + b, 0) / temps.length;

      chartData7dMax.push({ label: key, value: max });
      chartData7dMin.push({ label: key, value: min });
      chartData7dAvg.push({ label: key, value: avg });
    }
  });

  // Stats du jour actuel
  const lastDayTemps = tempsByDay.get(referenceDayKey);
  let maxTempToday: number | null = null;
  let minTempToday: number | null = null;
  let avgTempToday: number | null = null;

  if (lastDayTemps && lastDayTemps.length > 0) {
    maxTempToday = Math.max(...lastDayTemps);
    minTempToday = Math.min(...lastDayTemps);
    avgTempToday = lastDayTemps.reduce((a, b) => a + b, 0) / lastDayTemps.length;
  }

  return {
    data24h: chartData24h,
    data7dMax: chartData7dMax.slice(-7),
    data7dMin: chartData7dMin.slice(-7),
    data7dAvg: chartData7dAvg.slice(-7),
    currentTemp: parseFloat(sensor.displayValue) || 0,
    maxTempToday,
    minTempToday,
    avgTempToday,
    currentHourIndex: refHour,
  };
}
