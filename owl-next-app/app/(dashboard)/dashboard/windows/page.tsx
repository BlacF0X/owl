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
    state_changed_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
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
    state_changed_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
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
];

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

export default async function WindowSensorsPage() {
  const user = await currentUser();
  if (!user) {
    redirect('/connexion');
  }

  // Pour l'instant, nous utilisons les données fictives
  const windowSensors: Sensor[] = mockWindowSensors;
  const apiError: string | null = null;

  const totalSensors = windowSensors.length;
  const openSensors = windowSensors.filter((sensor) => sensor.displayValue === 'Ouvert');
  const openSensorsCount = openSensors.length;

  // Trouver le capteur ouvert depuis le plus longtemps
  const longestOpenSensor = openSensors.reduce((longest, current) => {
    if (!longest.state_changed_at) return current;
    if (!current.state_changed_at) return longest;

    const longestDate = new Date(longest.state_changed_at).getTime();
    const currentDate = new Date(current.state_changed_at).getTime();

    // Si la date actuelle est plus ancienne (timestamp plus petit), c'est la plus longue
    return currentDate < longestDate ? current : longest;
  }, openSensors[0] || null); // Initialise avec le premier capteur ouvert ou null si aucun

  // --- NOUVELLE LOGIQUE : GROUPER LES CAPTEURS PAR HUB ---
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

      {/* --- NOUVEAU COMPOSANT : LE PANNEAU DE RÉSUMÉ --- */}
      <div className="mb-10 rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          {longestOpenSensor && (
            <div className="flex items-start gap-3 rounded-md border border-orange-200 bg-orange-50 p-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-orange-500 mt-0.5" />
              <div className="text-sm text-orange-800">
                <span className="font-bold">{longestOpenSensor.name}</span> est ouverte depuis le
                plus longtemps :{' '}
                <span className="font-semibold">
                  {calculateDuration(longestOpenSensor.state_changed_at)}.
                </span>
              </div>
            </div>
          )}
        </div>
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
