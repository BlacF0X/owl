'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import TemperatureSensorCard from './TemperatureSensorCard';
import type { TemperatureSensor, SensorHistory } from './TemperatureSensorCard';

interface ChartDataPoint {
  label: string;
  value: number | null;
}

interface Props {
  sensors: TemperatureSensor[];
  viewMode: 'current' | 'max' | 'min' | 'avg';
}

export default function TemperatureBatchLoader({ sensors, viewMode }: Props) {
  const { getToken } = useAuth();
  const [histories, setHistories] = useState<Record<string, SensorHistory>>({});
  const [loading, setLoading] = useState(true);

  const sensorsByHub = useMemo(() => {
    const grouped = new Map<string, TemperatureSensor[]>();
    sensors.forEach((sensor) => {
      if (!sensor.hub) return;
      const hubId = sensor.hub.hub_id;
      if (!grouped.has(hubId)) {
        grouped.set(hubId, []);
      }
      grouped.get(hubId)!.push(sensor);
    });
    return grouped;
  }, [sensors]);

  useEffect(() => {
    if (sensorsByHub.size === 0) {
      setLoading(false);
      return;
    }

    const loadAll = async () => {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      try {
        const token = await getToken();
        if (!token) {
          console.error('Token non disponible');
          setLoading(false);
          return;
        }

        const processed: Record<string, SensorHistory> = {};

        const hubPromises = Array.from(sensorsByHub.entries()).map(async ([hubId, hubSensors]) => {
          try {
            const res = await fetch(`${API_URL}/api/temperature/hubs/${hubId}/readings`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) return;

            const groupedReadings = await res.json();

            hubSensors.forEach((sensor) => {
              const rawData = groupedReadings[sensor.sensor_id] || [];
              processed[sensor.sensor_id] = processRawData(rawData, sensor);
            });
          } catch (err) {
            console.error(`Erreur hub ${hubId}:`, err);
          }
        });

        await Promise.all(hubPromises);
        setHistories(processed);
      } catch (err) {
        console.error('Erreur batch loading:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [getToken, sensorsByHub]);

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
        />
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processRawData(rawData: any[], sensor: TemperatureSensor): SensorHistory {
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

  const now = new Date();
  const refHour = now.getHours();

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
        dTime.getDate() === now.getDate() &&
        dTime.getMonth() === now.getMonth() &&
        dTime.getFullYear() === now.getFullYear() &&
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
    const temps = tempsByDay.get(dayKey)!;
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

  const referenceDayKey = now.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
  });
  const todayTemps = tempsByDay.get(referenceDayKey) || [];
  const maxTempToday = todayTemps.length > 0 ? Math.max(...todayTemps) : null;
  const minTempToday = todayTemps.length > 0 ? Math.min(...todayTemps) : null;
  const avgTempToday =
    todayTemps.length > 0
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
