import type { Metadata } from 'next';
import HumidityStatsCards from '@/components/HumidityStatsCards';
import HumidityHomeMap from '@/components/HumidityHomeMap';
import HumidityEvolutionChart, {
  type HumidityDataPoint,
} from '@/components/HumidityEvolutionChart';
import { type HumidityRoom } from '@/components/HumidityRoomCard';

export const metadata: Metadata = {
  title: "Capteurs d'humidité | Dashboard OwL",
  description: "Surveillance en temps réel de l'humidité intérieure",
};

export default function HumiditySensorsPage() {
  // Données mockées pour tester l'affichage
  const mockStats = {
    averageHumidity: 58,
    activeAlerts: 1,
    lastUpdate: 'Maintenant',
  };

  // Données mockées pour les pièces
  const mockRooms: HumidityRoom[] = [
    { id: '1', name: 'Salon', humidity: 52, status: 'optimal' },
    { id: '2', name: 'Cuisine', humidity: 64, status: 'warning' },
    { id: '3', name: 'Chambre', humidity: 72, status: 'danger' },
    { id: '4', name: 'Salle de bain', humidity: 55, status: 'optimal' },
  ];

  // Données mockées pour le graphique avec variation visible
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

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Dashboard Qualité de l&apos;air - Système OwL
        </h1>
        <p className="text-sm text-muted-foreground">
          Surveillance en temps réel de l&apos;humidité intérieure
        </p>
      </div>

      {/* Stats Cards */}
      <HumidityStatsCards stats={mockStats} />

      {/* Home Map - Full width */}
      <HumidityHomeMap rooms={mockRooms} />

      {/* Evolution Chart - Full width at bottom */}
      <HumidityEvolutionChart data={mockChartData} />
    </div>
  );
}