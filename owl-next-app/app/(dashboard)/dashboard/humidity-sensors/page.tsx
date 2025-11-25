import type { Metadata } from 'next';
import HumidityStatsCards from '@/components/HumidityStatsCards';

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

      {/* Placeholder pour les prochains composants */}
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">
          La carte de l&apos;habitation et le graphique seront ajoutés dans les
          prochaines étapes.
        </p>
      </div>
    </div>
  );
}