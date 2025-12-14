import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchFromApi } from '@/src/lib/apiClient';
import { Sensor } from '@/src/types';
import WindowSensorsView from '@/components/WindowSensorsView';
import WindowActivityLog from '@/components/WindowActivityLog';
import { AlertTriangle, BarChart3 } from 'lucide-react';
import WindowLazyChart from '@/components/WindowLazyChart';

interface HourlyStat {
  hour: number;
  count: number;
}

export default async function WindowSensorsPage() {
  let user;
  let getToken;

  // Gestion robuste de l'authentification Clerk
  try {
    user = await currentUser();
    const authData = await auth();
    getToken = authData.getToken;
  } catch (error) {
    console.error('Clerk authentication error:', error);
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100">
        <p>Session expirée. Veuillez vous reconnecter.</p>
      </div>
    );
  }

  if (!user) {
    redirect('/connexion');
  }

  let windowSensors: Sensor[] = [];
  let hourlyStats: HourlyStat[] = [];
  let apiError: string | null = null;

  try {
    const token = await getToken();
    // On appelle l'endpoint '/api/sensors/windows'
    windowSensors = await fetchFromApi<Sensor[]>('/api/sensors/windows', token);
  } catch (error) {
    console.error('Failed to fetch window sensor data:', error);
    apiError = (error as Error).message;
  }

  // --- TEMPS RÉEL ---
  const referenceDate = new Date();

  // --- RÉCUPÉRATION DES STATS ---
  if (!apiError) {
    try {
      const token = await getToken();
      let statsUrl = '/api/sensors/windows/stats';
      if (process.env.NODE_ENV === 'development') {
        statsUrl += `?refDate=${referenceDate.toISOString()}`;
      }
      hourlyStats = await fetchFromApi<HourlyStat[]>(statsUrl, token);
    } catch (error) {
      console.error('Erreur stats:', error);
      // On ne bloque pas la page si les stats échouent, on aura juste un tableau vide
    }
  }

  // --- LOGIQUE DE RÉSUMÉ ---
  const totalSensors = windowSensors.length;
  const openSensors = windowSensors.filter((sensor) => sensor.displayValue === 'Ouvert');
  const openSensorsCount = openSensors.length;

  const LONG_PERIOD_THRESHOLD_MINUTES = 60;
  const thresholdInMs = LONG_PERIOD_THRESHOLD_MINUTES * 60 * 1000;

  const longOpenSensors = openSensors.filter((sensor) => {
    if (!sensor.state_changed_at) return false;
    const openDate = new Date(sensor.state_changed_at).getTime();
    const now = referenceDate.getTime();
    return now - openDate > thresholdInMs;
  });
  const longOpenSensorsCount = longOpenSensors.length;

  // --- GROUPEMENT PAR HUB ---
  const sensorsByHub = windowSensors.reduce(
    (acc, sensor) => {
      const hubName = sensor.hub.name;
      if (!acc[hubName]) acc[hubName] = [];
      acc[hubName].push(sensor);
      return acc;
    },
    {} as Record<string, Sensor[]>
  );

  return (
    <div>
      <header className="mb-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">État des Capteurs de Fenêtre</h1>
            <p className="mt-1 text-slate-600">
              Vue détaillée de tous vos capteurs de fenêtre, groupés par boîtier central.
            </p>
          </div>
        </div>
      </header>

      {/* --- NOUVELLE SECTION DU HAUT (GRILLE 2 COLONNES) --- */}
      <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLONNE GAUCHE : RÉSUMÉ (Prend 1/3 ou 2/3 selon préférence, ici 1/3) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Carte Résumé Simple */}
          <div className="rounded-lg bg-white p-6 shadow-sm flex flex-col justify-center h-full">
            <h2 className="text-lg font-bold text-slate-800 mb-2">État Actuel</h2>
            <p className="text-slate-600 text-lg">
              <span
                className={`text-4xl font-extrabold ${openSensorsCount > 0 ? 'text-orange-600' : 'text-green-600'}`}
              >
                {openSensorsCount}
              </span>
              <span className="text-sm ml-2 font-medium text-slate-400 uppercase">ouverts</span>
            </p>
            <p className="text-sm text-slate-500 mt-1">sur {totalSensors} capteurs totaux</p>
          </div>

          {/* Carte Alerte (Conditionnelle) */}
          {longOpenSensorsCount > 0 && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold">Attention requise</h3>
              </div>
              <p className="text-orange-800 text-sm mb-2">
                {longOpenSensorsCount}{' '}
                {longOpenSensorsCount > 1 ? 'fenêtres ouvertes' : 'fenêtre ouverte'} depuis plus
                d'1h.
              </p>
              <ul className="list-disc list-inside text-xs text-orange-700 font-medium">
                {longOpenSensors.map((s) => (
                  <li key={s.sensor_id}>{s.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : GRAPHIQUE (Prend 2/3) */}
        <div className="lg:col-span-2 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-bold text-slate-800">Habitudes d'Ouverture</h2>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
              7 derniers jours
            </span>
          </div>

          {/* Insertion du graphique */}
          <div className="h-48 w-full">
            <WindowLazyChart data={hourlyStats} />
          </div>
        </div>
      </div>

      {/* Gestion des erreurs (ne changera pas) */}
      {apiError && (
        <div className="rounded-lg bg-red-100 p-6 text-center text-red-800">
          <h2 className="text-xl font-bold">Erreur de chargement des données</h2>
          <p className="mt-4 text-sm font-mono">{apiError}</p>
        </div>
      )}

      {/* Remplacement de l'affichage manuel par le composant Vue interactif */}
      {!apiError && Object.keys(sensorsByHub).length > 0 && (
        <WindowSensorsView sensorsByHub={sensorsByHub} referenceDate={referenceDate} />
      )}

      {/* Gestion du cas "aucun capteur" */}
      {!apiError && Object.keys(sensorsByHub).length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-lg text-slate-500">
            Aucun capteur de fenêtre n'a été trouvé pour votre compte.
          </p>
        </div>
      )}

      {!apiError && <WindowActivityLog initialDate={referenceDate} />}
    </div>
  );
}
