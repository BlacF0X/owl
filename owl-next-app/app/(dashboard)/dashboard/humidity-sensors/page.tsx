'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import HumidityStatsCards from '@/components/HumidityStatsCards';
import HumidityRoomsView from '@/components/HumidityRoomsView';
import HumidityEvolutionChart, {
  type HumidityDataPoint,
} from '@/components/HumidityEvolutionChart';
import { type HumidityRoom } from '@/components/HumidityRoomCard';

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

        // Calculer les stats
        const humidityValues = sensorsData.map((s) => parseInt(s.displayValue) || 0);
        const avg = Math.round(
          humidityValues.reduce((a, b) => a + b, 0) / humidityValues.length || 0
        );
        setAverageHumidity(avg);

        // Compter les alertes
        const alertCount = sensorsData.filter((s) => {
          const value = parseInt(s.displayValue) || 0;
          return value < 40 || value > 70;
        }).length;
        setActiveAlerts(alertCount);
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

  // Grouper par hub
  const sensorsByHub = sensors.reduce(
    (acc, sensor) => {
      const hubName = sensor.hub.name;
      if (!acc[hubName]) acc[hubName] = [];
      acc[hubName].push({
        id: sensor.sensor_id,
        name: sensor.name,
        humidity: parseInt(sensor.displayValue) || 0,
        status:
          parseInt(sensor.displayValue) >= 40 && parseInt(sensor.displayValue) <= 60
            ? ('optimal' as const)
            : parseInt(sensor.displayValue) > 60
              ? ('warning' as const)
              : ('danger' as const),
        hubName: hubName,
        lastUpdate: new Date().toISOString(),
      } as HumidityRoom);
      return acc;
    },
    {} as Record<string, HumidityRoom[]>
  );

  const mockStats = {
    averageHumidity,
    activeAlerts,
    lastUpdate: 'Maintenant',
  };

  // Convertir stats pour le graphique
  const chartData: HumidityDataPoint[] = stats.map((s) => ({
    hour: s.hour,
    value: s.avgHumidity,
  }));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard Humidité - Système OwL</h1>
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
