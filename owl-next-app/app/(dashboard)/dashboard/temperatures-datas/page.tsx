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

  // 2. Récupération des données complètes (TOUS les hubs)
  let sensors: TemperatureSensor[] = [];
  let token: string | null = null;

  try {
    token = await getToken();
    // On appelle l'API qui renvoie la liste complète pour cet utilisateur
    sensors = await fetchFromApi<TemperatureSensor[]>('/api/temperature', token);
  } catch (error) {
    console.error('Erreur lors du chargement des capteurs de température:', error);
    // En cas d'erreur, sensors reste un tableau vide []
  }

  // 3. Rendu de la vue globale
  return (
    <div className="mb-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord des températures</h1>
        <p className="mt-1 text-slate-600">
          Vue d'ensemble de tous vos capteurs de température (tous hubs confondus).
        </p>
      </header>

      {/* On passe le token au client pour qu'il puisse charger les graphiques (historique) */}
      <TemperatureDashboard initialSensors={sensors} token={token} />
    </div>
  );
}
