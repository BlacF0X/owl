import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// Données fictives (comme précédemment)
const mockSensors = [
  { id: 'salon-window', name: 'Fenêtre du salon', type: 'window', state: 'Ouvert', openSince: new Date(Date.now() - 1000 * 60 * 85) },
  { id: 'chambre-window', name: 'Fenêtre de la chambre', type: 'window', state: 'Fermé', openSince: null },
  { id: 'cuisine-window', name: 'Fenêtre de la cuisine', type: 'window', state: 'Ouvert', openSince: new Date(Date.now() - 1000 * 60 * 20) },
  { id: 'bureau-co2', name: "Qualité de l'air (Bureau)", type: 'co2', state: 'Bonne', value: '450 ppm' },
];

// Fonction utilitaire (comme précédemment)
const calculateDuration = (since: Date | null): string => {
  if (!since) return '';
  const now = new Date();
  const diffMs = now.getTime() - since.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  let duration = '';
  if (diffHours > 0) duration += `${diffHours}h `;
  if (diffMins > 0 || diffHours === 0) duration += `${diffMins}min`;
  return duration.trim();
};


export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect('/connexion');
  }

  const windowSensors = mockSensors.filter((s) => s.type === 'window');
  const openWindowsCount = windowSensors.filter(s => s.state === 'Ouvert').length;
  const co2Sensor = mockSensors.find(s => s.type === 'co2');

  return (
    <div>
      {/* En-tête de la page */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Bonjour, {user.firstName || 'Utilisateur'} !
        </h1>
        <p className="mt-1 text-slate-600">Voici le résumé de l'état de vos capteurs.</p>
      </header>

      {/* Cartes de statistiques (style maquette) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-sm font-medium text-slate-500">Fenêtres Ouvertes</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{openWindowsCount}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-sm font-medium text-slate-500">Qualité de l'air</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{co2Sensor?.state || 'N/A'}</p>
          <span className="text-xs text-slate-500">{co2Sensor?.value}</span>
        </div>
        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-sm font-medium text-slate-500">Capteurs Actifs</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{mockSensors.length}</p>
        </div>
      </div>

      {/* Widget principal pour la liste des capteurs de fenêtre */}
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
                  {windowSensors.map((sensor) => (
                    <tr key={sensor.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900">{sensor.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          sensor.state === 'Ouvert' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {sensor.state}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {sensor.state === 'Ouvert' ? calculateDuration(sensor.openSince) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
