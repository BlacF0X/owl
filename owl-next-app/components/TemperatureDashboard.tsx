'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
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
import { usePusher } from '@/components/providers/PusherProvider';
import { RealtimeUpdate } from '@/src/hooks/useRealtimeSensor';

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

  const [sensors, setSensors] = useState<TemperatureSensor[]>(initialSensors);
  const { channel } = usePusher();

  const [hubSummaries, setHubSummaries] = useState<HubSummary[]>([]);
  const [hubsLoading, setHubsLoading] = useState(false);

  const hasLoadedHistory = useRef(false);

  // Synchronisation de l'état lors de la navigation
  useEffect(() => {
    setSensors(initialSensors);
    hasLoadedHistory.current = false;
  }, [initialSensors]);

  // Filtrage pour le mode détail
  const filteredSensors = useMemo(() => {
    if (hubId) {
      return sensors.filter((s) => s.hub?.hub_id === hubId);
    }
    return sensors;
  }, [sensors, hubId]);

  // --- LOGIQUE PUSHER ---
  useEffect(() => {
    if (!channel) return;

    const handleUpdate = (data: RealtimeUpdate[]) => {
      setSensors((prevSensors) => {
        const sensorMap = new Map(prevSensors.map((s) => [s.sensor_id, s]));
        let hasChanges = false;

        data.forEach((update) => {
          if (sensorMap.has(update.sensor_id) && update.type === 'temperature') {
            const existing = sensorMap.get(update.sensor_id)!;
            sensorMap.set(update.sensor_id, {
              ...existing,
              displayValue: String(update.value),
              state_changed_at: update.timestamp,
            });
            hasChanges = true;
          }
        });

        if (!hasChanges) return prevSensors;

        const newSensors = Array.from(sensorMap.values());

        // Mise à jour temps réel des cartes Hub
        setHubSummaries((prevSummaries) => {
          return prevSummaries.map((hub) => {
            const hubSensors = newSensors.filter((s) => s.hub?.hub_id === hub.hubid);
            if (hubSensors.length === 0) return hub;

            const validSensors = hubSensors.filter(
              (s) => !isNaN(parseFloat(s.displayValue)) && parseFloat(s.displayValue) !== 0
            );

            if (validSensors.length === 0) return { ...hub, currenttemp: 0 };

            const sum = validSensors.reduce((acc, s) => acc + parseFloat(s.displayValue), 0);
            const newCurrentTemp = parseFloat((sum / validSensors.length).toFixed(1));

            return {
              ...hub,
              currenttemp: newCurrentTemp,
            };
          });
        });

        return newSensors;
      });
    };

    channel.bind('sensors:update', handleUpdate);
    return () => {
      channel.unbind('sensors:update', handleUpdate);
    };
  }, [channel]);

  // Liste des Hubs uniques (stable)
  const uniqueHubs = useMemo(() => {
    const sensorsWithHub = initialSensors.filter((s) => s.hub);
    return Array.from(
      new Map(
        sensorsWithHub.map((s) => [
          s.hub!.hub_id,
          {
            id: s.hub!.hub_id,
            name: s.hub!.name,
            created_at: s.hub!.created_at,
          },
        ])
      ).values()
    );
  }, [initialSensors]);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    if (hubId || viewMode === 'comparison' || hasLoadedHistory.current) return;

    const loadHubSummaries = async () => {
      setHubsLoading(true);

      try {
        const token = await getToken();
        if (!token) {
          setHubsLoading(false);
          return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const hubPromises = uniqueHubs.map(async ({ id: hId, name: hubName, created_at }) => {
          try {
            // ✅ CORRECTION MAJEURE : Utiliser initialSensors au lieu de sensors
            // Cela garantit qu'on utilise la liste complète fraîchement reçue du serveur
            // même si le state 'sensors' n'a pas encore fini sa mise à jour asynchrone.
            const sensorsForHub = initialSensors.filter((s) => s.hub?.hub_id === hId);
            const sensorCount = sensorsForHub.length;

            let currentTemp = 0;
            const validSensors = sensorsForHub.filter((s) => {
              const val = parseFloat(s.displayValue);
              return !isNaN(val) && val !== 0;
            });

            if (validSensors.length > 0) {
              const sum = validSensors.reduce((acc, s) => acc + parseFloat(s.displayValue), 0);
              currentTemp = parseFloat((sum / validSensors.length).toFixed(1));
            }

            const res = await fetch(`${API_URL}/api/temperature/hubs/${hId}/readings`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) return null;

            const groupedReadings = await res.json();

            // ... Traitement inchangé des données ...
            const allReadings: Array<{ value: number; timestamp: Date }> = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Object.values(groupedReadings).forEach((readings: any) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              readings.forEach((r: any) => {
                allReadings.push({
                  value: Number(r.value),
                  timestamp: new Date(r.timestamp),
                });
              });
            });

            const sortedData = allReadings
              .filter((r) => !isNaN(r.value))
              .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

            // Valeurs par défaut
            const emptyStats = {
              avgtemp7d: null,
              maxtemp7d: null,
              mintemp7d: null,
              chartData24h: [],
              chartData7dAvg: [],
              chartData7dMax: [],
              chartData7dMin: [],
            };

            const resultStats = sortedData.length === 0 ? emptyStats : calculateStats(sortedData);

            return {
              hubid: hId,
              hubname: hubName,
              hubcreatedat: created_at,
              sensorcount: sensorCount,
              currenttemp: currentTemp,
              ...resultStats,
            } as HubSummary;
          } catch {
            return null;
          }
        });

        const results = await Promise.all(hubPromises);
        const validHubs = results.filter((h): h is HubSummary => h !== null);
        setHubSummaries(validHubs);
        hasLoadedHistory.current = true;
      } catch (err) {
        console.error('Erreur chargement hubs:', err);
      } finally {
        setHubsLoading(false);
      }
    };

    loadHubSummaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hubId, getToken, viewMode, uniqueHubs]); // initialSensors est implicitement inclus via uniqueHubs

  if (!initialSensors || initialSensors.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-slate-500">Aucun capteur de température détecté.</p>
      </div>
    );
  }

  if (viewMode === 'comparison') {
    return (
      <div className="flex flex-col gap-6 w-full pb-10">
        <DashboardViewButtons currentMode={viewMode} onChange={setViewMode} showComparison />
        <TemperatureComparisonView sensors={sensors} />
        <AlertLog sensors={sensors} />
      </div>
    );
  }

  if (hubId) {
    return (
      <div className="flex flex-col gap-6 w-full pb-10">
        <DashboardViewButtons currentMode={viewMode} onChange={setViewMode} showComparison />
        <TemperatureBatchLoader sensors={filteredSensors} viewMode={viewMode} />
        <AlertLog sensors={filteredSensors} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <DashboardViewButtons currentMode={viewMode} onChange={setViewMode} showComparison={false} />

      {hubsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mr-4" />
          <p className="text-slate-500">Chargement des hubs...</p>
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
    </div>
  );
}

// Fonction utilitaire pour alléger le useEffect et éviter la duplication de code
function calculateStats(sortedData: { value: number; timestamp: Date }[]) {
  const now = new Date();
  const refHour = now.getHours();

  const chartData24h: ChartDataPoint[] = [];
  for (let hour = 0; hour <= 23; hour++) {
    const hourLabel = `${hour.toString().padStart(2, '0')}h`;
    if (hour > refHour) {
      chartData24h.push({ label: hourLabel, value: null });
      continue;
    }
    const readings = sortedData.filter((d) => {
      const localDate = new Date(d.timestamp.getTime());
      return (
        localDate.getDate() === now.getDate() &&
        localDate.getMonth() === now.getMonth() &&
        localDate.getFullYear() === now.getFullYear() &&
        localDate.getHours() === hour
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

  const referenceDayKey = now.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
  });
  const todayTemps = tempsByDay.get(referenceDayKey) || [];
  const maxtemp7d = todayTemps.length > 0 ? Math.max(...todayTemps) : null;
  const mintemp7d = todayTemps.length > 0 ? Math.min(...todayTemps) : null;
  const avgtemp7d =
    todayTemps.length > 0
      ? Math.round((todayTemps.reduce((a, b) => a + b, 0) / todayTemps.length) * 10) / 10
      : null;

  return {
    avgtemp7d,
    maxtemp7d,
    mintemp7d,
    chartData24h,
    chartData7dAvg,
    chartData7dMax,
    chartData7dMin,
  };
}
