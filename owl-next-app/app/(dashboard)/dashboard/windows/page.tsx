import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
// Note: Pas besoin de 'auth' ou 'fetchFromApi' tant qu'on utilise les mocks
import { Sensor } from '@/src/types';
import WindowSensorCard from '@/components/WindowSensorCard';
import { AlertTriangle } from 'lucide-react';

// ... (les données fictives mockWindowSensors restent les mêmes)
const mockWindowSensors: Sensor[] = [
  {
    sensor_id: 'win_sensor_001',
    name: 'Fenêtre du Salon',
    displayValue: 'Ouvert',
    state_changed_at: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
    hub: { hub_id: 'hub_01', name: 'Maison Principale' },
    type: { type_key: 'window', name: 'Fenêtre', unit: '-' },
  },
  {
    sensor_id: 'win_sensor_002',
    name: 'Fenêtre de la Chambre',
    displayValue: 'Fermé',
    state_changed_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    hub: { hub_id: 'hub_01', name: 'Maison Principale' },
    type: { type_key: 'window', name: 'Fenêtre', unit: '-' },
  },
  {
    sensor_id: 'win_sensor_003',
    name: 'Fenêtre du Bureau',
    displayValue: 'Ouvert',
    state_changed_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    hub: { hub_id: 'hub_02', name: 'Bureau' },
    type: { type_key: 'window', name: 'Fenêtre', unit: '-' },
  },
  {
    sensor_id: 'win_sensor_004',
    name: 'Baie Vitrée Jardin',
    displayValue: 'Fermé',
    state_changed_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    hub: { hub_id: 'hub_01', name: 'Maison Principale' },
    type: { type_key: 'window', name: 'Fenêtre', unit: '-' },
  },
  {
    sensor_id: 'win_sensor_005',
    name: 'Fenêtre de la Toilette',
    displayValue: 'Ouvert',
    state_changed_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    hub: { hub_id: 'hub_01', name: 'Maison Principale' },
    type: { type_key: 'window', name: 'Fenêtre', unit: '-' },
  },
  {
    sensor_id: 'win_sensor_006',
    name: 'Fenêtre de la Cuisine',
    displayValue: 'Ouvert',
    state_changed_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    hub: { hub_id: 'hub_01', name: 'Maison Principale' },
    type: { type_key: 'window', name: 'Fenêtre', unit: '-' },
  },
  {
    sensor_id: 'win_sensor_005',
    name: 'Fenêtre de la Toilette',
    displayValue: 'Ouvert',
    state_changed_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    hub: { hub_id: 'hub_02', name: 'Bureau' },
    type: { type_key: 'window', name: 'Fenêtre', unit: '-' },
  },
];

export default async function WindowSensorsPage() {
  const user = await currentUser();
  if (!user) {
    redirect('/connexion');
  }

  // Pour l'instant, nous utilisons les données fictives
  const windowSensors: Sensor[] = mockWindowSensors;
  const apiError: string | null = null;

  // --- LOGIQUE DE RÉSUMÉ AMÉLIORÉE ---
  const totalSensors = windowSensors.length;
  const openSensors = windowSensors.filter((sensor) => sensor.displayValue === 'Ouvert');
  const openSensorsCount = openSensors.length;

  // 1. Définir le seuil en minutes
  const LONG_PERIOD_THRESHOLD_MINUTES = 60;
  const thresholdInMs = LONG_PERIOD_THRESHOLD_MINUTES * 60 * 1000;

  // 2. Filtrer les fenêtres ouvertes depuis longtemps
  const longOpenSensors = openSensors.filter((sensor) => {
    if (!sensor.state_changed_at) return false;
    const openDate = new Date(sensor.state_changed_at).getTime();
    const now = new Date().getTime();
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
        <h1 className="text-3xl font-bold text-slate-900">État des Capteurs de Fenêtre</h1>
        <p className="mt-1 text-slate-600">
          Vue détaillée de tous vos capteurs de fenêtre, groupés par boîtier central.
        </p>
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
                  <WindowSensorCard key={sensor.sensor_id} sensor={sensor} />
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
