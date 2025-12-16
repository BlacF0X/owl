'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import TemperatureComparisonChart from './TemperatureComparisonChart';
import type { TemperatureSensor } from './TemperatureSensorCard';

interface Props {
  sensors: TemperatureSensor[];
}

export default function TemperatureComparisonView({ sensors }: Props) {
  const { getToken } = useAuth(); // ✅ Pas de state token
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState<string[]>([]);
  const [sensorsData, setSensorsData] = useState<Array<{ sensorName: string; data: (number | null)[] }>>([]);
  const [averageData, setAverageData] = useState<(number | null)[]>([]);

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

    const fetchAllData = async () => {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      try {
        // ✅ Token frais à chaque chargement
        const token = await getToken();
        if (!token) {
          console.error('Token non disponible');
          setLoading(false);
          return;
        }

        const hubPromises = Array.from(sensorsByHub.entries()).map(async ([hubId, hubSensors]) => {
          try {
            const res = await fetch(`${API_URL}/api/temperature/hubs/${hubId}/readings`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) return null;

            const groupedReadings = await res.json();

            return hubSensors.map((sensor) => {
              const rawData = groupedReadings[sensor.sensor_id] || [];
              
              if (rawData.length === 0) return null;

              const sortedData = rawData.sort((a: any, b: any) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );

              const tempsByDay = new Map<string, number[]>();
              sortedData.forEach((item: any) => {
                const d = new Date(item.timestamp);
                const dayKey = d.toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric'
                });
                if (!tempsByDay.has(dayKey)) {
                  tempsByDay.set(dayKey, []);
                }
                const val = Number(item.value);
                if (!isNaN(val)) {
                  tempsByDay.get(dayKey)?.push(val);
                }
              });

              const dayLabels: string[] = [];
              const dayAverages: number[] = [];
              tempsByDay.forEach((temps, dayKey) => {
                if (temps.length > 0) {
                  dayLabels.push(dayKey);
                  dayAverages.push(temps.reduce((a, b) => a + b, 0) / temps.length);
                }
              });

              return {
                sensorName: sensor.name,
                labels: dayLabels.slice(-7),
                data: dayAverages.slice(-7)
              };
            }).filter(Boolean);
          } catch {
            return null;
          }
        });

        const results = await Promise.all(hubPromises);
        const validData = results.flat().filter(Boolean) as Array<{
          sensorName: string;
          labels: string[];
          data: number[];
        }>;

        if (validData.length === 0) {
          setLoading(false);
          return;
        }

        const commonLabels = validData[0].labels;
        setLabels(commonLabels);

        const sensorsChartData = validData.map((sensor) => ({
          sensorName: sensor.sensorName,
          data: sensor.data as (number | null)[]
        }));

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
  }, [getToken, sensorsByHub]); // ✅ getToken dans les deps

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
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        Comparaison des capteurs (7 derniers jours)
      </h3>
      <div className="w-full h-[500px]">
        <TemperatureComparisonChart
          labels={labels}
          sensorsData={sensorsData}
          averageData={averageData}
        />
      </div>
    </div>
  );
}
