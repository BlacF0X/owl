import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchFromApi } from '@/src/lib/apiClient';
import TemperatureDashboard from '@/components/TemperatureDashboard';
import type { TemperatureSensor } from '@/components/TemperatureSensorCard';

export const dynamic = 'force-dynamic';

interface SensorWithHub extends TemperatureSensor {
  hub: {
    hub_id: string;
    name: string;
  };
}

export default async function TemperaturesDataPage({
  searchParams,
}: {
  searchParams: Promise<{ hubId?: string }>;
}) {
  // Attente des paramètres (Next.js 15)
  const resolvedSearchParams = await searchParams;
  const hubId = resolvedSearchParams.hubId;

  // 1. Authentification
  let user;
  let getToken;

  try {
    user = await currentUser();
    const authData = await auth();
    getToken = authData.getToken;
  } catch (error) {
    console.error('Auth error:', error);
    redirect('/connexion');
  }

  if (!user) redirect('/connexion');

  // 2. Récupération et Filtrage
  let sensors: SensorWithHub[] = [];
  let token: string | null = null;

  // Textes par défaut (Vue Globale)
  let title = 'Température';
  let subtitle = "Vue d'ensemble de tous vos capteurs de température (tous hubs confondus).";

  try {
    token = await getToken();
    const allSensors = await fetchFromApi<SensorWithHub[]>('/api/temperature', token);

    if (hubId) {
      // MODE FILTRÉ (Vue par Hub)
      sensors = allSensors.filter((s) => s.hub && s.hub.hub_id === hubId);

      if (sensors.length > 0) {
        const hubName = sensors[0].hub.name;
        title = `Température, ${hubName}`;
        subtitle = `Affichage exclusif des capteurs connectés au ${hubName}.`;
      } else {
        title = 'Hub introuvable';
        subtitle = 'Aucun capteur trouvé pour ce hub.';
      }
    } else {
      // MODE GLOBAL (Voir tout)
      sensors = allSensors;
    }
  } catch (error) {
    console.error('Erreur chargement capteurs:', error);
  }

  // 3. Rendu
  return (
    <div className="mb-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-slate-600">{subtitle}</p>
      </header>

      <TemperatureDashboard initialSensors={sensors} token={token} />
    </div>
  );
}
