'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import HumidityStatsCards from '@/components/HumidityStatsCards';
import HumidityRoomsView from '@/components/HumidityRoomsView';
import { type HumidityRoom } from '@/components/HumidityRoomCard';
import { type HumidityDataPoint } from '@/components/HumidityEvolutionChart';

import dynamic from 'next/dynamic';

const HumidityEvolutionChart = dynamic(
  () => import('@/components/HumidityEvolutionChart'),
  {
    loading: () => (
      <div className="h-64 w-full bg-slate-50 animate-pulse rounded-lg border border-slate-200" />
    ),
    ssr: false,
  }
);

interface HumiditySensor {
  sensor_id: string;
  hub: { hub_id: string; name: string };
  name: string;
  displayValue: string;
  state_changed_at: string | null;
  type: { type_key: string; name: string; unit: string };
}

interface HumidityStats {
  hour: number;
  avgHumidity: number;
}

export default function HumiditySensorsPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sensors, setSensors] = useState<HumiditySensor[]>([]);
  const [stats, setStats] = useState<HumidityStats[]>([]);
  const [averageHumidity, setAverageHumidity] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('N/A'); // ✅ Ajout du state pour la date

  useEffect(() => {
    const fetchHumidityData = async () => {
      try {
        setError(null);
        const token = await getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        // Fetch sensors
        const sensorsResponse = await fetch(`${apiUrl}/api/humidity`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!sensorsResponse.ok) throw new Error('Erreur fetch capteurs');
        const sensorsData: HumiditySensor[] = await sensorsResponse.json();
        setSensors(sensorsData);

        // Fetch stats
        const statsResponse = await fetch(`${apiUrl}/api/humidity/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!statsResponse.ok) throw new Error('Erreur fetch stats');
        const statsData: HumidityStats[] = await statsResponse.json();
        setStats(statsData);

        // --- CALCULS ---

        // 1. Moyenne
        const humidityValues = sensorsData.map((s) => parseInt(s.displayValue) || 0);
        const avg = Math.round(
          humidityValues.reduce((a, b) => a + b, 0) / humidityValues.length || 0
        );
        setAverageHumidity(avg);

        // 2. Alertes (Nouvelle règle : Danger si < 40 ou > 60)
        const alertCount = sensorsData.filter((s) => {
          const value = parseInt(s.displayValue) || 0;
          return value < 40 || value > 60; // ✅ Seuil strict 60%
        }).length;
        setActiveAlerts(alertCount);

        // 3. Dernière mise à jour (La plus récente parmi tous les capteurs)
        const timestamps = sensorsData
          .map((s) => (s.state_changed_at ? new Date(s.state_changed_at).getTime() : 0))
          .filter((t) => t > 0);

        if (timestamps.length > 0) {
          const last = new Date(Math.max(...timestamps));
          setLastUpdate(last.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
        } else {
          setLastUpdate('N/A');
        }
      } catch (err) {
        console.error('Erreur chargement humidité:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchHumidityData();
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex justify-center min-h-screen items-center">
        <p className="text-xl text-slate-600">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center min-h-screen items-center text-red-600">
        Erreur: {error}
      </div>
    );
  }

  // Grouper par hub avec calcul du statut pour chaque carte
  const sensorsByHub = sensors.reduce(
    (acc, sensor) => {
      const hubName = sensor.hub.name;
      if (!acc[hubName]) acc[hubName] = [];

      const value = parseInt(sensor.displayValue) || 0;

      acc[hubName].push({
        id: sensor.sensor_id,
        name: sensor.name,
        humidity: value,
        // ✅ Statut simplifié : Optimal ou Danger (pas de warning intermédiaire)
        status: value >= 40 && value <= 60 ? 'optimal' : 'danger',
        hubName: hubName,
        lastUpdate: sensor.state_changed_at || undefined,
      } as HumidityRoom);
      return acc;
    },
    {} as Record<string, HumidityRoom[]>
  );

  const mockStats = {
    averageHumidity,
    activeAlerts,
    lastUpdate, // ✅ On passe la vraie date calculée
  };

  // Convertir stats pour le graphique
  const chartData: HumidityDataPoint[] = stats.map((s) => ({
    hour: s.hour,
    value: s.avgHumidity,
  }));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Humidité - Système OwL</h1>
        <p className="text-sm text-muted-foreground">
          Surveillance en temps réel de l'humidité intérieure
        </p>
      </div>

      <HumidityStatsCards stats={mockStats} />

      <HumidityRoomsView roomsByHub={sensorsByHub} />

      <HumidityEvolutionChart data={chartData} />
    </div>
  );
}
