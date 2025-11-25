import type { Metadata } from 'next';
import HumidityStatsCards from '@/components/HumidityStatsCards';
import HumidityRoomCard, {
  type HumidityRoom,
} from '@/components/HumidityRoomCard';

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

      {/* Room Cards - Test Grid */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold">Test des cartes de pièces</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mockRooms.map((room) => (
            <HumidityRoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>

      {/* Placeholder pour le graphique */}
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">
          Le graphique d&apos;évolution sera ajouté dans la prochaine étape.
        </p>
      </div>
    </div>
  );
}