'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import TemperatureComparisonChart from './TemperatureComparisonChart';
import type { TemperatureSensor } from './TemperatureSensorCard';

interface HistoryItem {
  value_num: number | string;
  timestamp: string;
}

interface Props {
  sensors: TemperatureSensor[];
}

export default function TemperatureComparisonView({ sensors }: Props) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState<string[]>([]);
  const [sensorsData, setSensorsData] = useState<Array<{ sensorName: string; data: (number | null)[] }>>([]);
  const [averageData, setAverageData] = useState<(number | null)[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      const token = await getToken();
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      try {
        const allSensorsData = await Promise.all(
          sensors.map(async (sensor) => {
            try {
              const res = await fetch(`${API_URL}/api/sensors/${sensor.sensorid}/readings?period=7d`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!res.ok) return null;

              const rawData: HistoryItem[] = await res.json();
              const sortedData = rawData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

              // Grouper par jour
              const tempsByDay = new Map<string, number[]>();
              sortedData.forEach((item) => {
                const d = new Date(item.timestamp);
                const dayKey = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
                if (!tempsByDay.has(dayKey)) tempsByDay.set(dayKey, []);
                const val = Number(item.value_num);
                if (!isNaN(val)) tempsByDay.get(dayKey)?.push(val);
              });

              // Calculer moyennes
              const dayLabels: string[] = [];
              const dayAverages: number[] = [];
              tempsByDay.forEach((temps, dayKey) => {
                if (temps.length > 0) {
                  dayLabels.push(dayKey);
                  dayAverages.push(temps.reduce((a, b) => a + b, 0) / temps.length);
                }
              });

              return { sensorName: sensor.name, labels: dayLabels.slice(-7), data: dayAverages.slice(-7) };
            } catch {
              return null;
            }
          })
        );

        const validData = allSensorsData.filter(Boolean) as Array<{ sensorName: string; labels: string[]; data: number[] }>;

        if (validData.length === 0) {
          setLoading(false);
          return;
        }

        const commonLabels = validData[0].labels;
        setLabels(commonLabels);

        const sensorsChartData = validData.map((sensor) => ({
          sensorName: sensor.sensorName,
          data: sensor.data as (number | null)[],
        }));

        // Moyenne globale
        const avgByDay: (number | null)[] = commonLabels.map((_, index) => {
          const values = validData.map((sensor) => sensor.data[index]).filter((v) => v != null);
          if (values.length === 0) return null;
          return values.reduce((a, b) => a + b, 0) / values.length;
        });

        setSensorsData(sensorsChartData);
        setAverageData(avgByDay);
      } catch (err) {
        console.error('Erreur comparison:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [sensors, getToken]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500">Chargement de la comparaison...</p>
      </div>
    );
  }

  if (sensorsData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <p className="text-slate-500">Aucune donnée disponible pour la comparaison.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Comparaison des capteurs (7 derniers jours)</h3>
      <div className="w-full h-[500px]">
        <TemperatureComparisonChart labels={labels} sensorsData={sensorsData} averageData={averageData} />
      </div>
    </div>
  );
}
