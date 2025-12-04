import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchFromApi } from '@/src/lib/apiClient';
import TemperatureDashboard, { TemperatureSensor } from '@/components/TemperatureDashboard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

// CORRECTION : On définit une interface locale qui force la présence du Hub
// Cela permet de contourner l'erreur si le type importé est incomplet
interface SensorWithHub extends TemperatureSensor {
  hub: {
    hub_id: string;
    name: string;
  };
}

export default async function HubTemperaturePage({ 
  params 
}: { 
  params: Promise<{ hubId: string }> 
}) {
  const resolvedParams = await params;
  const { hubId } = resolvedParams;

  // 1. Authentification
  let user;
  let getToken;

  try {
    user = await currentUser();
    const authData = await auth();
    getToken = authData.getToken;
  } catch (error) {
    console.error('Auth error:', error);
    redirect('/connexion');
  }

  if (!user) redirect('/connexion');

  // 2. Récupération des données
  let sensors: SensorWithHub[] = []; // On utilise notre type étendu ici
  let token: string | null = null;
  let hubName = 'Inconnu';

  try {
    token = await getToken();
    
    // On type le retour de l'API avec notre interface locale qui contient 'hub'
    const allSensors = await fetchFromApi<SensorWithHub[]>('/api/temperature', token);
    
    // 3. FILTRAGE
    // Maintenant TypeScript sait que 'hub' existe et n'est pas undefined
    sensors = allSensors.filter(s => s.hub && s.hub.hub_id === hubId);

    // Récupération du nom
    if (sensors.length > 0) {
      hubName = sensors[0].hub.name;
    }

  } catch (error) {
    console.error('Erreur chargement capteurs hub:', error);
  }

  return (
    <div className="mb-10">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link 
            href="/dashboard/temperatures-datas" 
            className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-500 transition-colors"
            title="Retour à la vue globale"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            Hub : {hubName}
          </h1>
        </div>
        <p className="mt-1 ml-12 text-slate-600">
          Visualisation des capteurs connectés à ce hub spécifique.
        </p>
      </header>

      {/* Le composant accepte notre type car SensorWithHub contient tout ce que TemperatureSensor demande */}
      <TemperatureDashboard initialSensors={sensors} token={token} />
    </div>
  );
}
