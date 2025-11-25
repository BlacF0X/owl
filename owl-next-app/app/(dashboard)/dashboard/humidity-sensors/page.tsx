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

  // Données mockées pour le graphique (24 heures)
  const mockChartData: HumidityDataPoint[] = Array.from(
    { length: 24 },
    (_, i) => ({
      hour: i,
      value: Math.floor(Math.random() * 30) + 45, // Valeurs entre 45% et 75%
    })
  );

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

      {/* Main Grid: Home Map + Chart */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Home Map - 2 columns on large screens */}
        <div className="lg:col-span-2">
          <HumidityHomeMap rooms={mockRooms} />
        </div>

        {/* Evolution Chart - 1 column on large screens */}
        <div className="lg:col-span-1">
          <HumidityEvolutionChart data={mockChartData} />
        </div>
      </div>
    </div>
  );
}