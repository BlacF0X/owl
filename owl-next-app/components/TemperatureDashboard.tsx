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

export default function TemperatureDashboard({ initialSensors }: Props) {
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const hubId = searchParams?.get('hubId');
  const [viewMode, setViewMode] = useState<ViewMode>('current');

  // États pour le mode "Tous les hubs"
  const [hubSummaries, setHubSummaries] = useState<HubSummary[]>([]);
  const [hubsLoading, setHubsLoading] = useState(false);
  const [hubsError, setHubsError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // ✅ Récupérer le token au montage
  useEffect(() => {
    const fetchToken = async () => {
      const t = await getToken();
      setToken(t);
    };
    fetchToken();
  }, [getToken]);

  // Charger les summaries par hub uniquement si pas de hubId et mode "current"
  useEffect(() => {
    if (hubId || viewMode !== 'current') return;

    const loadHubSummaries = async () => {
      setHubsLoading(true);
      setHubsError(null);

      try {
        const token = await getToken();
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        // ✅ Filtrer les capteurs qui ont un hub défini
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

            const summaryPromises = sensorsForHub.map(async (s) => {
              try {
                const res = await fetch(
                  `${API_URL}/api/sensors/${s.sensor_id}/readings?period=7d`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!res.ok) return null;

                const rawData: Array<{ value: number | string; timestamp: string }> =
                  await res.json();

                const values = rawData
                  .map((r) => Number(r.value))
                  .filter((v) => !isNaN(v));

                return {
                  max7d: values.length ? Math.max(...values) : null,
                  min7d: values.length ? Math.min(...values) : null,
                  avg7d: values.length
                    ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
                    : null,
                  data24h: [],
                };
              } catch {
                return null;
              }
            });

            const allData = (await Promise.all(summaryPromises)).filter(Boolean);
            const max7d = allData.length
              ? Math.max(...allData.map((d) => d!.max7d).filter((v) => v !== null))
              : null;
            const min7d = allData.length
              ? Math.min(...allData.map((d) => d!.min7d).filter((v) => v !== null))
              : null;
            const avg7d =
              allData.length && allData.some((d) => d!.avg7d !== null)
                ? Math.round(
                    (allData
                      .map((d) => d!.avg7d)
                      .filter((v) => v !== null)
                      .reduce((a, b) => a! + b!, 0) as number) /
                      allData.filter((d) => d!.avg7d !== null).length
                  )
                : null;

            const chartData24h: Array<{ label: string; value: number | null }> = [];

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
            console.warn('Erreur hub', hId, err);
            return null;
          }
        });

        const results = await Promise.all(hubPromises);
        const validHubs = results.filter(Boolean) as HubSummary[];
        setHubSummaries(validHubs);
      } catch (err) {
        console.warn('Erreur chargement hubs', err);
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

  // MODE TOUS LES HUBS (liste des cartes)
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <DashboardViewButtons currentMode={viewMode} onChange={setViewMode} showComparison />

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hubSummaries.map((hub) => (
            <TemperatureHubCard key={hub.hubid} hub={hub} viewMode={viewMode} />
          ))}
        </div>
      )}

      <AlertLog sensors={initialSensors} token={token} />
    </div>
  );
}
