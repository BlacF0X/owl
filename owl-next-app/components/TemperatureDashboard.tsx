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

// ✅ Interface pour les données brutes de l'API
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

export default function TemperatureDashboard({ initialSensors }: Props) {
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const hubId = searchParams?.get('hubId');
  const [viewMode, setViewMode] = useState<ViewMode>('current');

  // États pour le mode "Tous les hubs"
  const [hubSummaries, setHubSummaries] = useState<HubSummary[]>([]);
  const [hubsLoading, setHubsLoading] = useState(false);
  const [hubsError, setHubsError] = useState<string | null>(null);

  // ⚙️ Charger les summaries par hub (uniquement si pas de hubId spécifique)
  useEffect(() => {
    if (hubId || viewMode === 'comparison') return;

    const loadHubSummaries = async () => {
      setHubsLoading(true);
      setHubsError(null);

      try {
        const token = await getToken();
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        // Grouper par hub
        const hubMap = new Map<string, TemperatureSensor[]>();
        initialSensors.forEach((sensor) => {
          const hId = sensor.hub?.hub_id || 'unknown';
          if (!hubMap.has(hId)) hubMap.set(hId, []);
          hubMap.get(hId)?.push(sensor);
        });

        // Charger données pour chaque hub
        const hubPromises = Array.from(hubMap.entries()).map(async ([hId, sensors]) => {
          try {
            const hubName = sensors[0]?.hub?.name || `Hub ${hId.slice(0, 8)}`;
            const sensorCount = sensors.length;

            // Charger les données de tous les capteurs du hub
            const sensorDataPromises = sensors.map(async (sensor) => {
              try {
                const sId = sensor.sensor_id;
                
                const res = await fetch(`${API_URL}/api/sensors/${sId}/readings?period=7d`, {
                  headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) return null;

                const rawData: HistoryItem[] = await res.json();
                return rawData;
              } catch (err) {
                console.warn(`Erreur capteur ${sensor.name}:`, err);
                return null;
              }
            });

            const allSensorData = await Promise.all(sensorDataPromises);
            const validData = allSensorData.filter(Boolean).flat() as HistoryItem[];

            if (validData.length === 0) {
              return {
                hubid: hId,
                hubname: hubName,
                sensorcount: sensorCount,
                currenttemp: 0,
                avgtemp7d: 0,
                maxtemp7d: 0,
                mintemp7d: 0,
                chartData24h: [],
              };
            }

            // Trier par timestamp
            const sortedData = validData.sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            const lastDataPoint = sortedData[sortedData.length - 1];
            const referenceDate = new Date(lastDataPoint.timestamp);

            // CALCUL TEMPS RÉEL 24h
            const refHour = referenceDate.getHours();
            const chartData24h: ChartDataPoint[] = [];

            for (let hour = 0; hour <= 23; hour++) {
              const hourLabel = `${hour.toString().padStart(2, '0')}h`;

              if (hour > refHour) {
                chartData24h.push({ label: hourLabel, value: null });
                continue;
              }

              const hourData = sortedData.filter((d) => {
                const dTime = new Date(d.timestamp);
                return (
                  dTime.getDate() === referenceDate.getDate() &&
                  dTime.getMonth() === referenceDate.getMonth() &&
                  dTime.getHours() === hour
                );
              });

              if (hourData.length > 0) {
                const avgHour = hourData.reduce((sum, d) => sum + Number(d.value_num), 0) / hourData.length;
                chartData24h.push({ label: hourLabel, value: avgHour });
              } else {
                const prev = chartData24h.length > 0 ? chartData24h[chartData24h.length - 1].value : null;
                chartData24h.push({ label: hourLabel, value: prev });
              }
            }

            // Température actuelle
            const lastHourData = sortedData.filter((d) => {
              const dTime = new Date(d.timestamp);
              return (
                dTime.getDate() === referenceDate.getDate() &&
                dTime.getMonth() === referenceDate.getMonth() &&
                dTime.getHours() === refHour
              );
            });

            const currentTemp =
              lastHourData.length > 0
                ? lastHourData.reduce((sum, d) => sum + Number(d.value_num), 0) / lastHourData.length
                : 0;

            // Calcul simple des stats 7j (sans graphiques détaillés)
            const allTemps = sortedData.map(d => Number(d.value_num)).filter(v => !isNaN(v));
            const avg7d = allTemps.length > 0 ? allTemps.reduce((a, b) => a + b, 0) / allTemps.length : 0;
            const max7d = allTemps.length > 0 ? Math.max(...allTemps) : 0;
            const min7d = allTemps.length > 0 ? Math.min(...allTemps) : 0;

            return {
              hubid: hId,
              hubname: hubName,
              sensorcount: sensorCount,
              currenttemp: currentTemp,
              avgtemp7d: avg7d,
              maxtemp7d: max7d,
              mintemp7d: min7d,
              chartData24h: chartData24h,
            };
          } catch (err) {
            console.warn(`Erreur hub ${hId}:`, err);
            return null;
          }
        });

        const results = await Promise.all(hubPromises);
        const validHubs = results.filter(Boolean) as HubSummary[];
        setHubSummaries(validHubs);
      } catch (err) {
        console.warn('Erreur chargement hubs:', err);
        setHubsError('Erreur de chargement des hubs');
      } finally {
        setHubsLoading(false);
      }
    };

    loadHubSummaries();
  }, [hubId, initialSensors, getToken, viewMode]);

  // Validation initiale
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
        <AlertLog sensors={initialSensors} token={null} />
      </div>
    );
  }

  // MODE HUB SPÉCIFIQUE (hubId présent)
  if (hubId) {
    return (
      <div className="flex flex-col gap-6 w-full pb-10">
        <DashboardViewButtons currentMode={viewMode} onChange={setViewMode} showComparison />
        <TemperatureBatchLoader sensors={initialSensors} viewMode={viewMode} />
        <AlertLog sensors={initialSensors} token={null} />
      </div>
    );
  }

  // MODE TOUS LES HUBS
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <DashboardViewButtons currentMode={viewMode} onChange={setViewMode} showComparison={false} />

      {hubsLoading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600 mb-4" />
          <p className="text-slate-500">Chargement des données des hubs...</p>
        </div>
      )}

      {hubsError && (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-lg font-semibold text-slate-800">{hubsError}</p>
        </div>
      )}

      {!hubsLoading && !hubsError && hubSummaries.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-slate-500">Aucun hub configuré.</p>
        </div>
      )}

      {!hubsLoading && hubSummaries.map((hub) => (
        <TemperatureHubCard key={hub.hubid} hub={hub} viewMode={viewMode} />
      ))}

      <AlertLog sensors={initialSensors} token={null} />
    </div>
  );
}
