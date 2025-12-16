import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchFromApi } from '@/src/lib/apiClient';
import { Sensor, Hub } from '@/src/types';
import ApiStatusIndicator from '@/components/ApiStatusIndicator';
import DashboardRealtimeView from '@/components/DashboardRealtimeView';

export default async function DashboardPage() {
  let user;
  let getToken;

  try {
    user = await currentUser();
    const authData = await auth();
    getToken = authData.getToken;
  } catch {
    return null;
  }

  if (!user) redirect('/connexion');

  let sensors: Sensor[] = [];
  let hubs: Hub[] = [];
  let apiError: string | null = null;

  try {
    const token = await getToken();

    const [sensorsData, hubsData] = await Promise.all([
      fetchFromApi<Sensor[]>('/api/sensors', token),
      fetchFromApi<Hub[]>('/api/hubs', token),
    ]);

    sensors = sensorsData;
    hubs = hubsData;
  } catch (error) {
    apiError = (error as Error).message;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Vue d'ensemble
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Bonjour <span className="font-semibold text-blue-600">{user.firstName}</span>, voici le
            récapitulatif de vos capteurs.
          </p>
        </div>
        {process.env.NODE_ENV === 'development' && <ApiStatusIndicator />}
      </header>

      {/* GESTION D'ERREUR API */}
      {apiError && (
        <div className="rounded-xl border-l-4 border-red-500 bg-white p-4 shadow-sm mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur de communication</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{apiError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VUE TEMPS RÉEL */}
      {/* On passe les données initiales au composant client */}
      <DashboardRealtimeView initialSensors={sensors} hubs={hubs} />
    </div>
  );
}
