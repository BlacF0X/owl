import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchFromApi } from '@/src/lib/apiClient';
import { Sensor } from '@/src/types';
import WindowSensorCard from '@/components/WindowSensorCard';
import { AlertTriangle, Info } from 'lucide-react';

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
        {/* ... votre UI d'erreur de session ... */}
        <p>Session expirée. Veuillez vous reconnecter.</p>
      </div>
    );
  }

  if (!user) {
    redirect('/connexion');
  }

  let windowSensors: Sensor[] = [];
  let apiError: string | null = null;

  try {
    const token = await getToken();
    // On appelle l'endpoint '/api/sensors/windows'
    windowSensors = await fetchFromApi<Sensor[]>('/api/sensors/windows', token);
  } catch (error) {
    console.error('Failed to fetch window sensor data:', error);
    apiError = (error as Error).message;
  }

  let referenceDate = new Date(); // Par défaut : maintenant (Prod)
  let isDevTime = false;

  if (process.env.NODE_ENV === 'development' && windowSensors.length > 0) {
    // Trouver la date la plus récente parmi tous les capteurs
    const timestamps = windowSensors
      .map((s) => s.state_changed_at)
      .filter((t): t is string => !!t) // Filtre les null/undefined
      .map((t) => new Date(t).getTime());

    if (timestamps.length > 0) {
      const maxTimestamp = Math.max(...timestamps);
      // Si la dernière donnée est plus récente que "maintenant" (possible si horloge décalée)
      // ou simplement pour se caler sur la dernière donnée générée.
      referenceDate = new Date(maxTimestamp);
      isDevTime = true;
    }
  }

  // =================================================================
  // LOGIQUE DE RÉSUMÉ (Utilisant referenceDate)
  // =================================================================
  const totalSensors = windowSensors.length;
  const openSensors = windowSensors.filter((sensor) => sensor.displayValue === 'Ouvert');
  const openSensorsCount = openSensors.length;

  const LONG_PERIOD_THRESHOLD_MINUTES = 60;
  const thresholdInMs = LONG_PERIOD_THRESHOLD_MINUTES * 60 * 1000;

  const longOpenSensors = openSensors.filter((sensor) => {
    if (!sensor.state_changed_at) return false;
    const openDate = new Date(sensor.state_changed_at).getTime();
    // Utilisation de referenceDate ici aussi pour la cohérence
    const now = referenceDate.getTime();
    return now - openDate > thresholdInMs;
  });
  const longOpenSensorsCount = longOpenSensors.length;

  // --- GROUPER LES CAPTEURS PAR HUB ---
  const sensorsByHub = windowSensors.reduce(
    (acc, sensor) => {
      const hubName = sensor.hub.name;
      // Si le hub n'est pas encore une clé dans notre objet, on l'initialise avec un tableau vide
      if (!acc[hubName]) {
        acc[hubName] = [];
      }
      // On ajoute le capteur au tableau correspondant à son hub
      acc[hubName].push(sensor);
      return acc;
    },
    {} as Record<string, Sensor[]>
  ); // L'accumulateur est un objet où les clés sont des strings et les valeurs des tableaux de Sensor

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
          {/* Petit indicateur visuel en mode DEV */}
          {isDevTime && (
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Info className="h-3 w-3" />
              <span>Temps simulé : {referenceDate.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </header>

      {/* --- PANNEAU DE RÉSUMÉ MIS À JOUR --- */}
      <div className="mb-10 rounded-lg bg-white p-6 shadow-sm space-y-4">
        {/* Résumé général (toujours affiché) */}
        <div>
          <h2 className="text-xl font-bold text-slate-800">Résumé Actuel</h2>
          <p className="text-slate-600">
            <span
              className={`font-bold ${openSensorsCount > 0 ? 'text-orange-600' : 'text-green-600'}`}
            >
              {openSensorsCount}
            </span>{' '}
            sur <span className="font-bold">{totalSensors}</span> capteurs de fenêtre sont
            actuellement ouverts.
          </p>
        </div>

        {/* Alerte conditionnelle (uniquement si des fenêtres sont ouvertes depuis longtemps) */}
        {longOpenSensorsCount > 0 && (
          <div className="flex items-start gap-3 rounded-md border border-orange-200 bg-orange-50 p-4">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-orange-500 mt-0.5" />
            <div className="text-orange-800">
              <p className="font-bold">
                {longOpenSensorsCount}{' '}
                {longOpenSensorsCount > 1 ? 'fenêtres sont ouvertes' : 'fenêtre est ouverte'} depuis
                plus d'une heure.
              </p>
              <p className="text-sm mt-1">
                Pensez à fermer : {longOpenSensors.map((s) => s.name).join(', ')}.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Gestion des erreurs (ne changera pas) */}
      {apiError && (
        <div className="rounded-lg bg-red-100 p-6 text-center text-red-800">
          <h2 className="text-xl font-bold">Erreur de chargement des données</h2>
          <p className="mt-4 text-sm font-mono">{apiError}</p>
        </div>
      )}

      {/* --- NOUVEL AFFICHAGE GROUPÉ --- */}
      {!apiError && Object.keys(sensorsByHub).length > 0 && (
        <div className="space-y-12">
          {Object.entries(sensorsByHub).map(([hubName, sensors]) => (
            <section key={hubName}>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-3">{hubName}</h2>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {sensors.map((sensor) => (
                  <WindowSensorCard
                    key={sensor.sensor_id}
                    sensor={sensor}
                    referenceDate={referenceDate}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Gestion du cas "aucun capteur" */}
      {!apiError && Object.keys(sensorsByHub).length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-lg text-slate-500">
            Aucun capteur de fenêtre n'a été trouvé pour votre compte.
          </p>
        </div>
      )}
    </div>
  );
}
