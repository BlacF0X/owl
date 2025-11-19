import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchFromApi } from '@/src/lib/apiClient';
import { Sensor } from '@/src/types';
import WindowSensorCard from '@/components/WindowSensorCard';

// =================================================================
// DONNÉES FICTIVES (MOCK DATA)
// Remplace temporairement l'appel à l'API.
// Ces données respectent à 100% la structure de votre type `Sensor`.
// =================================================================
const mockWindowSensors: Sensor[] = [
  {
    sensor_id: 'win_sensor_001',
    name: 'Fenêtre du Salon',
    displayValue: 'Ouvert',
    state_changed_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // Ouvert depuis 45 min
    hub: {
      hub_id: 'hub_01',
      name: 'Maison Principale',
    },
    type: {
      type_key: 'window',
      name: 'Fenêtre',
      unit: '-',
    },
  },
  {
    sensor_id: 'win_sensor_002',
    name: 'Fenêtre de la Chambre',
    displayValue: 'Fermé',
    state_changed_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // Fermé depuis 3h
    hub: {
      hub_id: 'hub_01',
      name: 'Maison Principale',
    },
    type: {
      type_key: 'window',
      name: 'Fenêtre',
      unit: '-',
    },
  },
  {
    sensor_id: 'win_sensor_003',
    name: 'Fenêtre du Bureau',
    displayValue: 'Ouvert',
    state_changed_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // Ouvert depuis 5 min
    hub: {
      hub_id: 'hub_02',
      name: 'Bureau',
    },
    type: {
      type_key: 'window',
      name: 'Fenêtre',
      unit: '-',
    },
  },
];

export default async function WindowSensorsPage() {
  const user = await currentUser();
  // const { getToken } = await auth(); // Pas besoin du token pour les données fictives

  if (!user) {
    redirect('/connexion');
  }

  let windowSensors: Sensor[] = [];
  let apiError: string | null = null;

  // --- LOGIQUE DE RÉCUPÉRATION DES DONNÉES ---
  const useMockData = true; // Mettez ceci à `false` pour tester l'API réelle

  if (useMockData) {
    // On utilise les données fictives
    windowSensors = mockWindowSensors;
  } else {
    // On essaie de contacter l'API
    try {
      const { getToken } = await auth();
      const token = await getToken();
      windowSensors = await fetchFromApi<Sensor[]>('/api/sensors/windows', token);
    } catch (error) {
      console.error('Failed to fetch window sensor data:', error);
      apiError = (error as Error).message;
    }
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          État des Capteurs de Fenêtre
        </h1>
        <p className="mt-1 text-slate-600">
          Vue détaillée de tous vos capteurs de fenêtre.
        </p>
      </header>
      
      {apiError && (
        <div className="rounded-lg bg-red-100 p-6 text-center text-red-800">
          <h2 className="text-xl font-bold">Erreur de chargement des données</h2>
          <p className="mt-4 text-sm font-mono">{apiError}</p>
        </div>
      )}

      {!apiError && windowSensors.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {windowSensors.map((sensor) => (
            <WindowSensorCard key={sensor.sensor_id} sensor={sensor} />
          ))}
        </div>
      )}

      {!apiError && windowSensors.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-lg text-slate-500">Aucun capteur de fenêtre n'a été trouvé pour votre compte.</p>
        </div>
      )}
    </div>
  );
}
