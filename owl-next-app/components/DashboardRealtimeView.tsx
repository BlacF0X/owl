'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sensor, Hub } from '@/src/types';
import { Router, Database, Clock } from 'lucide-react';
import CategorySummaryCards from '@/components/CategorySummaryCards';
import { usePusher } from '@/components/providers/PusherProvider';
import { RealtimeUpdate } from '@/src/hooks/useRealtimeSensor';

interface Props {
  initialSensors: Sensor[];
  hubs: Hub[];
}

export default function DashboardRealtimeView({ initialSensors, hubs }: Props) {
  const [sensors, setSensors] = useState<Sensor[]>(initialSensors);
  const { channel } = usePusher();
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);

  // --- 1. Abonnement Pusher Global pour ce tableau de bord ---
  useEffect(() => {
    if (!channel) return;

    const handleUpdate = (data: RealtimeUpdate[]) => {
      console.log('⚡️ Dashboard: Mise à jour reçue', data);

      setLastEventTime(new Date());

      setSensors((prevSensors) => {
        // On crée une map pour un accès rapide par ID
        const sensorMap = new Map(prevSensors.map((s) => [s.sensor_id, s]));

        // On applique les mises à jour
        data.forEach((update) => {
          if (sensorMap.has(update.sensor_id)) {
            const existing = sensorMap.get(update.sensor_id)!;
            sensorMap.set(update.sensor_id, {
              ...existing,
              displayValue: String(update.value), // On s'assure que c'est une string pour l'affichage
              state_changed_at: update.timestamp,
            });
          }
        });

        return Array.from(sensorMap.values());
      });
    };

    channel.bind('sensors:update', handleUpdate);

    return () => {
      channel.unbind('sensors:update', handleUpdate);
    };
  }, [channel]);

  // --- 2. Recalcul des Statistiques (Mémoïsé pour la performance) ---
  const stats = useMemo(() => {
    const uniqueHubs = hubs.length;

    // Fenêtres
    const windowSensors = sensors.filter((s) => s.type.type_key === 'window');
    const openWindowsCount = windowSensors.filter((s) => s.displayValue === 'Ouvert').length;

    // Helper pour la moyenne
    const calculateAverage = (typeKey: string) => {
      const filtered = sensors.filter((s) => s.type.type_key === typeKey);
      if (filtered.length === 0) return null;

      const sum = filtered.reduce((acc, s) => {
        const val = parseFloat(s.displayValue);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);

      return Math.round(sum / filtered.length);
    };

    const avgTemp = calculateAverage('temperature');
    const avgHumidity = calculateAverage('humidity');
    const avgCo2 = calculateAverage('air_quality'); // ou 'co2' selon ta BDD

    // Unité CO2 (récupérée du premier capteur trouvé ou défaut)
    const co2Sensors = sensors.filter((s) => s.type.type_key === 'air_quality');
    const co2Unit = co2Sensors.length > 0 ? co2Sensors[0].type.unit : 'ppm';

    // Dernière mise à jour globale (la plus récente parmi tous les capteurs)
    const timestamps = sensors
      .map((s) => (s.state_changed_at ? new Date(s.state_changed_at).getTime() : 0))
      .filter((t) => t > 0);

    let lastUpdateStr = 'N/A';
    if (timestamps.length > 0) {
      const maxDate = new Date(Math.max(...timestamps));
      lastUpdateStr = maxDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return {
      uniqueHubs,
      openWindowsCount,
      avgTemp,
      avgHumidity,
      avgCo2,
      co2Unit,
      lastUpdateStr,
    };
  }, [sensors, hubs]);

  // --- 3. Rendu de l'UI ---
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* TOP BAR : CARTES RÉCAPITULATIVES */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* CARTE 1: HUBS */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-blue-200">
          <div className="absolute top-6 right-6 flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
            En ligne
          </div>

          <div className="flex flex-col justify-between h-full gap-4">
            <div>
              <div className="inline-flex rounded-lg bg-blue-50 p-2.5 text-blue-600 transition-colors group-hover:bg-blue-100">
                <Router className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold tracking-tight text-slate-900">{stats.uniqueHubs}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Hubs Connectés</p>
            </div>
          </div>
        </div>

        {/* CARTE 2: CAPTEURS */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-indigo-200">
          <div className="absolute top-6 right-6 flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
            Actifs
          </div>

          <div className="flex flex-col justify-between h-full gap-4">
            <div>
              <div className="inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                <Database className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold tracking-tight text-slate-900">{sensors.length}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Capteurs Totaux</p>
            </div>
          </div>
        </div>

        {/* CARTE 3: UPDATE */}
        <div
          className={`group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-violet-200 ${lastEventTime ? 'ring-2 ring-violet-100' : ''}`}
        >
          <div className="absolute top-6 right-6 rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
            Temps réel
          </div>

          <div className="flex flex-col justify-between h-full gap-4">
            <div>
              <div className="inline-flex rounded-lg bg-violet-50 p-2.5 text-violet-600 transition-colors group-hover:bg-violet-100">
                <Clock className={`h-6 w-6 ${lastEventTime ? 'animate-pulse' : ''}`} />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold tracking-tight text-slate-900">
                {stats.lastUpdateStr}
              </p>
              <p className="text-sm font-medium text-slate-500 mt-1">Dernière mise à jour</p>
            </div>
          </div>
        </div>
      </div>

      {/* BLOC CENTRAL */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900">Métriques Environnementales</h2>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        <CategorySummaryCards
          sensors={sensors}
          openWindowsCount={stats.openWindowsCount}
          avgTemp={stats.avgTemp}
          avgHumidity={stats.avgHumidity}
          avgCo2={stats.avgCo2}
          co2Unit={stats.co2Unit}
        />
      </div>
    </div>
  );
}
