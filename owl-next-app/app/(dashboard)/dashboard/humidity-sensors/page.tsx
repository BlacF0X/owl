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
  // Noms identiques au format CO2 : Qualité Air [Localisation] [Numéro]
  const mockRooms: HumidityRoom[] = [
    // Maison Principale
    { id: 'humidity_maison_1', name: 'Qualité Air Maison 1', humidity: 52, status: 'optimal', hubName: 'Maison Principale', lastUpdate: new Date().toISOString() },
    { id: 'humidity_maison_2', name: 'Qualité Air Maison 2', humidity: 68, status: 'warning', hubName: 'Maison Principale', lastUpdate: new Date().toISOString() },
    { id: 'humidity_maison_3', name: 'Qualité Air Maison 3', humidity: 45, status: 'optimal', hubName: 'Maison Principale', lastUpdate: new Date().toISOString() },
    { id: 'humidity_maison_4', name: 'Qualité Air Maison 4', humidity: 78, status: 'danger', hubName: 'Maison Principale', lastUpdate: new Date().toISOString() },
    { id: 'humidity_maison_5', name: 'Qualité Air Maison 5', humidity: 55, status: 'optimal', hubName: 'Maison Principale', lastUpdate: new Date().toISOString() },
    
    // Bureau
    { id: 'humidity_bureau_1', name: 'Qualité Air Bureau 1', humidity: 48, status: 'optimal', hubName: 'Bureau', lastUpdate: new Date().toISOString() },
    { id: 'humidity_bureau_2', name: 'Qualité Air Bureau 2', humidity: 61, status: 'warning', hubName: 'Bureau', lastUpdate: new Date().toISOString() },
    { id: 'humidity_bureau_3', name: 'Qualité Air Bureau 3', humidity: 50, status: 'optimal', hubName: 'Bureau', lastUpdate: new Date().toISOString() },
    { id: 'humidity_bureau_4', name: 'Qualité Air Bureau 4', humidity: 69, status: 'warning', hubName: 'Bureau', lastUpdate: new Date().toISOString() },
    { id: 'humidity_bureau_5', name: 'Qualité Air Bureau 5', humidity: 42, status: 'optimal', hubName: 'Bureau', lastUpdate: new Date().toISOString() },
  ];

  // Calculer les stats dynamiquement
  const averageHumidity = Math.round(
    mockRooms.reduce((sum, room) => sum + room.humidity, 0) / mockRooms.length
  );
  
  const activeAlerts = mockRooms.filter(
    room => room.status === 'warning' || room.status === 'danger'
  ).length;

  const mockStats = {
    averageHumidity,
    activeAlerts,
    lastUpdate: 'Maintenant',
  };

  // Graphique : évolution de l'humidité sur 24h
  const generateChartData = (): HumidityDataPoint[] => {
    const base = averageHumidity;
    return Array.from({ length: 24 }, (_, hour) => {
      let variation = 0;
      if (hour >= 6 && hour <= 10) variation = 8;
      else if (hour >= 11 && hour <= 15) variation = 12;
      else if (hour >= 16 && hour <= 20) variation = 10;
      else variation = -5;
      
      const noise = (Math.random() - 0.5) * 4;
      const value = Math.max(30, Math.min(85, base + variation + noise));
      
      return {
        hour,
        value: Math.round(value),
      };
    });
  };

  const mockChartData = generateChartData();

  // Grouper les pièces par boîtier
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
