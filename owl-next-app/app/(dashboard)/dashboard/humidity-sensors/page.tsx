'use client';

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

export default function HumiditySensorsPage() {
  const mockRooms: HumidityRoom[] = [
    { id: '1', name: 'Salon', humidity: 52, status: 'optimal', hubName: 'Maison Principale', lastUpdate: new Date().toISOString() },
    { id: '2', name: 'Cuisine', humidity: 64, status: 'warning', hubName: 'Maison Principale', lastUpdate: new Date().toISOString() },
    { id: '3', name: 'Chambre', humidity: 72, status: 'danger', hubName: 'Maison Principale', lastUpdate: new Date().toISOString() },
    { id: '4', name: 'Salle de bain', humidity: 78, status: 'danger', hubName: 'Maison Principale', lastUpdate: new Date().toISOString() },
    { id: '5', name: 'Corridor', humidity: 55, status: 'optimal', hubName: 'Maison Principale', lastUpdate: new Date().toISOString() },
    { id: '6', name: 'Bureau 1', humidity: 48, status: 'optimal', hubName: 'Bureau', lastUpdate: new Date().toISOString() },
    { id: '7', name: 'Bureau 2', humidity: 61, status: 'warning', hubName: 'Bureau', lastUpdate: new Date().toISOString() },
    { id: '8', name: 'Salle de réunion', humidity: 55, status: 'optimal', hubName: 'Bureau', lastUpdate: new Date().toISOString() },
    { id: '9', name: 'Couloir', humidity: 50, status: 'optimal', hubName: 'Bureau', lastUpdate: new Date().toISOString() },
    { id: '10', name: 'Coin pause', humidity: 69, status: 'warning', hubName: 'Bureau', lastUpdate: new Date().toISOString() },
  ];

  const mockStats = {
    averageHumidity: 60,
    activeAlerts: 3,
    lastUpdate: 'Maintenant',
  };

  const mockChartData: HumidityDataPoint[] = [
    { hour: 0, value: 52 },
    { hour: 1, value: 48 },
    { hour: 2, value: 51 },
    { hour: 3, value: 49 },
    { hour: 4, value: 55 },
    { hour: 5, value: 58 },
    { hour: 6, value: 62 },
    { hour: 7, value: 67 },
    { hour: 8, value: 65 },
    { hour: 9, value: 63 },
    { hour: 10, value: 61 },
    { hour: 11, value: 68 },
    { hour: 12, value: 72 },
    { hour: 13, value: 70 },
    { hour: 14, value: 68 },
    { hour: 15, value: 65 },
    { hour: 16, value: 62 },
    { hour: 17, value: 58 },
    { hour: 18, value: 55 },
    { hour: 19, value: 52 },
    { hour: 20, value: 50 },
    { hour: 21, value: 48 },
    { hour: 22, value: 46 },
    { hour: 23, value: 50 },
  ];

  const roomsByHub = useMemo(() => {
    return mockRooms.reduce(
      (acc, room) => {
        const hub = room.hubName || 'Sans boîtier';
        if (!acc[hub]) {
          acc[hub] = [];
        }
        acc[hub].push(room);
        return acc;
      },
      {} as Record<string, HumidityRoom[]>
    );
  }, []);

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
