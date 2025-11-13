import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchFromApi } from '@/src/lib/apiClient';
import { Sensor } from '@/src/types';
import ApiStatusIndicator from '@/components/ApiStatusIndicator';
import Link from 'next/link';

// La fonction utilitaire ne change pas, elle est prête à recevoir les données de l'API.
const calculateDuration = (since: string | null): string => {
  if (!since) return '';
  const sinceDate = new Date(since);
  const now = new Date();
  const diffMs = now.getTime() - sinceDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  let duration = '';
  if (diffHours > 0) duration += `${diffHours}h `;
  if (diffMins > 0 || diffHours === 0) duration += `${diffMins}min`;
  return duration.trim();
};

export default async function DashboardPage() {
  let user;
  let getToken;

  try {
    // Enveloppez les appels à Clerk dans un bloc try...catch
    user = await currentUser();
    const authData = await auth();
    getToken = authData.getToken;

  } catch (error) {
    console.error("Clerk authentication error:", error);
    // Si l'erreur est une erreur d'API Clerk (session expirée),
    // on peut afficher un message personnalisé.
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <h2 className="text-xl font-bold text-slate-800">Votre session a expiré</h2>
          <p className="mt-2 text-slate-600">Pour des raisons de sécurité, veuillez vous reconnecter.</p>
          <Link href="/connexion" className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-700">
            Se reconnecter
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect('/connexion');
  }

  // Initialisation des variables pour les données réelles et les erreurs
  let sensors: Sensor[] = [];
  let apiError: string | null = null;

  try {
    const token = await getToken();
    // Appel à l'API pour récupérer les données réelles
    sensors = await fetchFromApi<Sensor[]>('/api/sensors', token);
  } catch (error) {
    console.error('Failed to fetch sensor data:', error);
    apiError = (error as Error).message;
  }

  // Toutes les constantes suivantes sont maintenant calculées à partir des données de l'API
  const windowSensors = sensors.filter((s) => s.type.type_key === 'window');
  const openWindowsCount = windowSensors.filter((s) => s.displayValue === 'Ouvert').length;
  const co2Sensor = sensors.find((s) => s.type.type_key === 'air_quality');

  return (
    <div>
      {/* En-tête de la page */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Bonjour, {user.firstName || 'Utilisateur'} !
            </h1>
            <p className="mt-1 text-slate-600">Voici le résumé de l'état de vos capteurs.</p>
          </div>
          
          {/* 2. Affichez le composant UNIQUEMENT en développement */}
          {process.env.NODE_ENV === 'development' && <ApiStatusIndicator />}

        </div>
      </header>

      {/* Cartes de statistiques basées sur les données de l'API */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-sm font-medium text-slate-500">Fenêtres Ouvertes</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{openWindowsCount}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-sm font-medium text-slate-500">Qualité de l'air</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{co2Sensor?.displayValue || 'N/A'}</p>
          <span className="text-xs text-slate-500">{co2Sensor ? co2Sensor.type.unit : ''}</span>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-sm font-medium text-slate-500">Capteurs Actifs</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{sensors.length}</p>
        </div>
      </div>

      {/* Widget pour la liste des capteurs de fenêtre, basé sur les données de l'API */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-slate-800">État des capteurs de fenêtre</h2>
        <div className="mt-4 flow-root">
          <div className="-mx-6 -my-2 overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900">Identifiant</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">État</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Durée d'ouverture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {windowSensors.length > 0 ? (
                    windowSensors.map((sensor) => (
                      <tr key={sensor.sensor_id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900">
                          {sensor.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              sensor.displayValue === 'Ouvert'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {sensor.displayValue}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {sensor.displayValue === 'Ouvert' ? calculateDuration(sensor.state_changed_at) : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-6 text-slate-500">
                        Aucun capteur de fenêtre trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
