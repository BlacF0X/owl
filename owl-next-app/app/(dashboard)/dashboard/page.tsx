import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchFromApi } from '@/src/lib/apiClient';
import { Sensor } from '@/src/types';
import ApiStatusIndicator from '@/components/ApiStatusIndicator';
import Link from 'next/link';
import GenericSensorsTable from '@/components/GenericSensorsTable';

export default async function DashboardPage() {
  let user;
  let getToken;

  try {
    user = await currentUser();
    const authData = await auth();
    getToken = authData.getToken;
  } catch (error) {
    console.error('Clerk authentication error:', error);
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <h2 className="text-xl font-bold text-slate-800">Votre session a expiré</h2>
          <p className="mt-2 text-slate-600">Pour des raisons de sécurité, veuillez vous reconnecter.</p>
          <Link
            href="/connexion"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-700"
          >
            Se reconnecter
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect('/connexion');
  }

  // Initialisation des variables
  let sensors: Sensor[] = [];
  let apiError: string | null = null;

  try {
    const token = await getToken();
    sensors = await fetchFromApi<Sensor[]>('/api/sensors', token);
  } catch (error) {
    console.error('Failed to fetch sensor data:', error);
    apiError = (error as Error).message;
  }

  // --- CALCULS ET FILTRES (KPIs) ---
  
  // 1. Fenêtres
  const windowSensors = sensors.filter((s) => s.type.type_key === 'window');
  const openWindowsCount = windowSensors.filter((s) => s.displayValue === 'Ouvert').length;

  // 2. Température
  const tempSensors = sensors.filter((s) => s.type.type_key === 'temperature');
  const avgTemp =
    tempSensors.length > 0
      ? Math.round(
          tempSensors.reduce((acc, s) => acc + Number(s.displayValue || 0), 0) / tempSensors.length
        )
      : null;

  // 3. Humidité
  const humiditySensors = sensors.filter((s) => s.type.type_key === 'humidity');
  const avgHumidity =
    humiditySensors.length > 0
      ? Math.round(
          humiditySensors.reduce((acc, s) => acc + Number(s.displayValue || 0), 0) /
            humiditySensors.length
        )
      : null;

  // 4. Qualité de l'Air (CO2) - Option 2 : Moyenne
  // On filtre proprement avec le type 'air_quality' uniquement
  const co2Sensors = sensors.filter((s) => s.type.type_key === 'air_quality');
  
  const avgCo2 =
    co2Sensors.length > 0
      ? Math.round(
          co2Sensors.reduce((acc, s) => acc + Number(s.displayValue || 0), 0) / co2Sensors.length
        )
      : null;

  const co2Unit = co2Sensors.length > 0 ? co2Sensors[0].type.unit : 'ppm';

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
          {process.env.NODE_ENV === 'development' && <ApiStatusIndicator />}
        </div>
      </header>

      {/* GRILLE DE STATS (KPIs) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {/* Carte 1 : Fenêtres */}
        <div className="rounded-lg bg-white p-5 shadow border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Fenêtres Ouvertes</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{openWindowsCount}</p>
        </div>

        {/* Carte 2 : Température */}
        <div className="rounded-lg bg-white p-5 shadow border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Température Moy.</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {avgTemp !== null ? avgTemp : '-'} <span className="text-sm font-normal text-slate-500">°C</span>
          </p>
        </div>

        {/* Carte 3 : Humidité */}
        <div className="rounded-lg bg-white p-5 shadow border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Humidité Moy.</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {avgHumidity !== null ? avgHumidity : '-'} <span className="text-sm font-normal text-slate-500">%</span>
          </p>
        </div>

        {/* Carte 4 : Qualité de l'air (Moyenne) */}
        <div className="rounded-lg bg-white p-5 shadow border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Qualité de l'air (Moy.)</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {avgCo2 !== null ? avgCo2 : '-'}
          </p>
          <span className="text-xs text-slate-500">{co2Unit}</span>
        </div>

        {/* Carte 5 : Total Capteurs */}
        <div className="rounded-lg bg-white p-5 shadow border border-slate-100">
          <p className="text-sm font-medium text-slate-500">Capteurs Actifs</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{sensors.length}</p>
        </div>
      </div>

      {/* Gestion des erreurs API */}
      {apiError && (
        <div className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">
          <p className="font-bold">Erreur de chargement :</p>
          <p className="text-sm">{apiError}</p>
        </div>
      )}

      {/* Widget : Liste de TOUS les capteurs (Tableau Générique) */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow border border-slate-100">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">État de tous les capteurs</h2>
          <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
            {sensors.length} capteurs
          </span>
        </div>
        
        <GenericSensorsTable sensors={sensors} />
      </div>
    </div>
  );
}
