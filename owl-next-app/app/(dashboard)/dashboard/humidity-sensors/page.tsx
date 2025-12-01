import React, { useMemo } from 'react';
import type { Metadata } from 'next';
import HumidityStatsCards from '@/components/HumidityStatsCards';
import HumidityRoomsView from '@/components/HumidityRoomsView';
import HumidityEvolutionChart, { type HumidityDataPoint } from '@/components/HumidityEvolutionChart';
import { HumidityRoom } from '@/components/HumidityRoomCard';

export const metadata: Metadata = {
  title: "Capteurs d'humidité | Dashboard OwL",
  description: "Surveillance en temps réel de l'humidité intérieure",
};

async function fetchHumiditySensors(token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const response = await fetch(`${apiUrl}/api/humidity`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erreur fetch capteurs');
  return response.json();
}

export default async function HumiditySensorsPage() {
  let sensors: any[] = [];
  let roomsByHub: Record<string, HumidityRoom[]> = {};
  let averageHumidity = 0;
  let activeAlerts = 0;

  try {
    // NOTE: Pour récupérer le token, tu devras utiliser getAuth() de Clerk côté serveur
    // C'est une simplification - en production, tu devras passer le token correctement
    sensors = await fetchHumiditySensors('YOUR_TOKEN_HERE');

    // Transformer en HumidityRoom
    const rooms: HumidityRoom[] = sensors.map((sensor) => ({
      id: sensor.sensorid,
      name: sensor.name,
      humidity: parseInt(sensor.displayValue) || 0,
      status: 
        parseInt(sensor.displayValue) >= 40 && parseInt(sensor.displayValue) <= 60 
          ? 'optimal' 
          : parseInt(sensor.displayValue) > 60 
          ? 'warning' 
          : 'danger',
      hubName: sensor.hub.name,
      lastUpdate: new Date().toISOString(),
    }));

    // Grouper par hub
    roomsByHub = rooms.reduce((acc, room) => {
      const hub = room.hubName || 'Sans boîtier';
      if (!acc[hub]) acc[hub] = [];
      acc[hub].push(room);
      return acc;
    }, {} as Record<string, HumidityRoom[]>);

    // Stats
    averageHumidity = Math.round(
      rooms.reduce((sum, r) => sum + r.humidity, 0) / rooms.length
    );
    activeAlerts = rooms.filter(r => r.status !== 'optimal').length;
  } catch (error) {
    console.error('Erreur chargement humidité:', error);
  }

  const mockStats = {
    averageHumidity,
    activeAlerts,
    lastUpdate: 'Maintenant',
  };

  // Graphique (peut rester mockée ou être appelée depuis API)
  const mockChartData: HumidityDataPoint[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    value: Math.round(averageHumidity + (Math.random() - 0.5) * 10),
  }));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Dashboard Humidité - Système OwL
        </h1>
        <p className="text-sm text-muted-foreground">
          Surveillance en temps réel de l'humidité intérieure
        </p>
      </div>

      <HumidityStatsCards stats={mockStats} />
      <HumidityRoomsView roomsByHub={roomsByHub} />
      <HumidityEvolutionChart data={mockChartData} />
    </div>
  );
}
