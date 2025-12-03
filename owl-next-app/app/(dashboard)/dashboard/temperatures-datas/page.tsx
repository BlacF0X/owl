import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchFromApi } from '@/src/lib/apiClient';
import TemperatureDashboard, { TemperatureSensor } from '@/components/TemperatureDashboard';

// Force le rendu dynamique pour avoir des données à jour à chaque visite
export const dynamic = 'force-dynamic';

export default async function TemperaturesDataPage() {
  // 1. Authentification
  let user;
  let getToken;

  try {
    user = await currentUser();
    const authData = await auth();
    getToken = authData.getToken;
  } catch (error) {
    console.error('Clerk authentication error:', error);
    redirect('/connexion');
  }

  if (!user) {
    redirect('/connexion');
  }

  // 2. Récupération des données dynamiques (plus de hardcode ici)
  let sensors: TemperatureSensor[] = [];
  let token: string | null = null;

  try {
    token = await getToken();
    // Récupération de la liste des capteurs de température
    // Assure-toi que ta route API est bien /api/temperature (comme pour /api/humidity)
    sensors = await fetchFromApi<TemperatureSensor[]>('/api/temperature', token);
  } catch (error) {
    console.error('Erreur lors du chargement des capteurs de température:', error);
    // On laisse le tableau vide, le composant Dashboard affichera un message "Aucun capteur"
  }

  // 3. Rendu
  return (
    <div className="p-6 space-y-8 bg-slate-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord des températures</h1>
        <p className="mt-1 text-slate-600">
          Voici le résumé de l'état de vos capteurs de température en temps réel.
        </p>
      </header>

      {/* On passe le token au client pour qu'il puisse charger les graphiques (historique) */}
      <TemperatureDashboard initialSensors={sensors} token={token} />
    </div>
  );
}
