'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import DashboardViewButtons, { ViewMode } from './TemperatureViewButtons';
import TemperatureBatchLoader from './TemperatureBatchLoader';
import TemperatureHubCard from './TemperatureHubCard';
import TemperatureComparisonView from './TemperatureComparisonView';
import AlertLog from './TemperatureAlertLog';
import type { TemperatureSensor } from './TemperatureSensorCard';
import type { HubSummary } from './TemperatureHubCard';

interface Props {
  initialSensors: TemperatureSensor[];
}

interface ChartDataPoint {
  label: string;
  value: number | null;
}

export default function TemperatureDashboard({ initialSensors }: Props) {
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const hubId = searchParams?.get('hubId');
  const [viewMode, setViewMode] = useState<ViewMode>('current');

  const [hubSummaries, setHubSummaries] = useState<HubSummary[]>([]);
  const [hubsLoading, setHubsLoading] = useState(false);
  const [hubsError, setHubsError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const t = await getToken();
      setToken(t);
    };
    fetchToken();
  }, [getToken]);

  // Charger les données complètes des hubs (avec graphiques)
  useEffect(() => {
    if (hubId) return; // Ne pas charger en mode hub spécifique

    const loadHubSummaries = async () => {
      setHubsLoading(true);
      setHubsError(null);

      try {
        // ✅ ATTENDRE le token avant de continuer
        const authToken = await getToken();
        if (!authToken) {
          setHubsError('Token non disponible');
          return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const sensorsWithHub = initialSensors.filter((s) => s.hub);

        const uniqueHubs = Array.from(
          new Map(
            sensorsWithHub.map((s) => [s.hub!.hub_id, { id: s.hub!.hub_id, name: s.hub!.name }])
          ).values()
        );

        const hubPromises = uniqueHubs.map(async ({ id: hId, name: hubName }) => {
          try {
            const sensorsForHub = sensorsWithHub.filter((s) => s.hub?.hub_id === hId);
            const sensorCount = sensorsForHub.length;
            const currentTemp = sensorsForHub.length
              ? parseFloat(sensorsForHub[0].displayValue) || 0
              : 0;

            // ✅ Utiliser authToken (et non token de state)
            const allReadingsPromises = sensorsForHub.map(async (sensor) => {
              try {
                const res = await fetch(
                  `${API_URL}/api/sensors/${sensor.sensor_id}/readings?period=7d`,
                  { headers: { Authorization: `Bearer ${authToken}` } }
                );
                if (!res.ok) return [];
                return await res.json();
              } catch {
                return [];
              }
            });

            const allReadings = (await Promise.all(allReadingsPromises)).flat();

            // ✅ Traiter les données comme dans TemperatureBatchLoader
            const sortedData = allReadings
              .map((r: any) => ({
                value: Number(r.value),
                timestamp: new Date(r.timestamp),
              }))
              .filter((r) => !isNaN(r.value))
              .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

            if (sortedData.length === 0) {
              return {
                hubid: hId,
                hubname: hubName,
                sensorcount: sensorCount,
                currenttemp: currentTemp,
                avgtemp7d: null,
                maxtemp7d: null,
                mintemp7d: null,
                chartData24h: [],
                chartData7dAvg: [],
                chartData7dMax: [],
                chartData7dMin: [],
              } as HubSummary;
            }

            const lastDataPoint = sortedData[sortedData.length - 1];
            const referenceDate = lastDataPoint.timestamp;
            const refHour = referenceDate.getHours();

            // 📊 GRAPHIQUE 24H
            const chartData24h: ChartDataPoint[] = [];
            for (let hour = 0; hour <= 23; hour++) {
              const hourLabel = `${hour.toString().padStart(2, '0')}h`;
              if (hour > refHour) {
                chartData24h.push({ label: hourLabel, value: null });
                continue;
              }

              const readings = sortedData.filter((d) => {
                return (
                  d.timestamp.getDate() === referenceDate.getDate() &&
                  d.timestamp.getMonth() === referenceDate.getMonth() &&
                  d.timestamp.getHours() === hour
                );
              });

              if (readings.length > 0) {
                const avg = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
                chartData24h.push({ label: hourLabel, value: Math.round(avg * 10) / 10 });
              } else {
                const prev = chartData24h.length > 0 ? chartData24h[chartData24h.length - 1].value : null;
                chartData24h.push({ label: hourLabel, value: prev });
              }
            }

            // 📊 GRAPHIQUES 7 JOURS
            const tempsByDay = new Map<string, number[]>();
            const dayKeysInOrder: string[] = [];

            sortedData.forEach((item) => {
              const dayKey = item.timestamp.toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
              });
              if (!tempsByDay.has(dayKey)) {
                dayKeysInOrder.push(dayKey);
                tempsByDay.set(dayKey, []);
              }
              tempsByDay.get(dayKey)!.push(item.value);
            });

            const chartData7dMax: ChartDataPoint[] = [];
            const chartData7dMin: ChartDataPoint[] = [];
            const chartData7dAvg: ChartDataPoint[] = [];

            dayKeysInOrder.forEach((dayKey) => {
              const temps = tempsByDay.get(dayKey)!;
              if (temps.length === 0) {
                chartData7dMax.push({ label: dayKey, value: null });
                chartData7dMin.push({ label: dayKey, value: null });
                chartData7dAvg.push({ label: dayKey, value: null });
              } else {
                const maxTemp = Math.max(...temps);
                const minTemp = Math.min(...temps);
                const avgTemp = Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10;

                chartData7dMax.push({ label: dayKey, value: maxTemp });
                chartData7dMin.push({ label: dayKey, value: minTemp });
                chartData7dAvg.push({ label: dayKey, value: avgTemp });
              }
            });

            const referenceDayKey = referenceDate.toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
            });
            const todayTemps = tempsByDay.get(referenceDayKey) || [];
            const maxtemp7d = todayTemps.length > 0 ? Math.max(...todayTemps) : null;
            const mintemp7d = todayTemps.length > 0 ? Math.min(...todayTemps) : null;
            const avgtemp7d = todayTemps.length > 0
              ? Math.round((todayTemps.reduce((a, b) => a + b, 0) / todayTemps.length) * 10) / 10
              : null;

            return {
              hubid: hId,
              hubname: hubName,
              sensorcount: sensorCount,
              currenttemp: currentTemp,
              avgtemp7d,
              maxtemp7d,
              mintemp7d,
              chartData24h,
              chartData7dAvg,
              chartData7dMax,
              chartData7dMin,
            } as HubSummary;
          } catch {
            return null;
          }
        });

        const results = await Promise.all(hubPromises);
        const validHubs = results.filter((h): h is HubSummary => h !== null);
        setHubSummaries(validHubs);
      } catch (err) {
        console.error('Erreur chargement hubs:', err);
        setHubsError('Erreur de chargement des hubs');
      } finally {
        setHubsLoading(false);
      }
    };

    loadHubSummaries();
  }, [hubId, initialSensors, getToken, viewMode]);

  if (!initialSensors || initialSensors.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-slate-500">Aucun capteur de température détecté.</p>
      </div>
    );
  }

  // MODE COMPARISON
  if (viewMode === 'comparison') {
    return (
      <div className="flex flex-col gap-6 w-full pb-10">
        <DashboardViewButtons currentMode={viewMode} onChange={setViewMode} showComparison />
        <TemperatureComparisonView sensors={initialSensors} />
        <AlertLog sensors={initialSensors} token={token} />
      </div>
    );
  }

  // MODE HUB SPÉCIFIQUE (hubId présent)
  if (hubId) {
    return (
      <div className="flex flex-col gap-6 w-full pb-10">
        <DashboardViewButtons currentMode={viewMode} onChange={setViewMode} showComparison />
        <TemperatureBatchLoader sensors={initialSensors} viewMode={viewMode} />
        <AlertLog sensors={initialSensors} token={token} />
      </div>
    );
  }

  // MODE TOUS LES HUBS
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <DashboardViewButtons currentMode={viewMode} onChange={setViewMode} showComparison={false} />

      {hubsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mr-4" />
          <p className="text-slate-500">Chargement des hubs...</p>
        </div>
      ) : hubsError ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-red-500">{hubsError}</p>
        </div>
      ) : hubSummaries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-slate-500">Aucun hub trouvé.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {hubSummaries.map((hub) => (
            <TemperatureHubCard key={hub.hubid} hub={hub} viewMode={viewMode} />
          ))}
        </div>
      )}

      <AlertLog sensors={initialSensors} token={token} />
    </div>
  );
}
