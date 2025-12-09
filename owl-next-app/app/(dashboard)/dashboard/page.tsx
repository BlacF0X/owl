import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchFromApi } from '@/src/lib/apiClient';
import { Sensor } from '@/src/types';
import ApiStatusIndicator from '@/components/ApiStatusIndicator';
import Link from 'next/link';
import CategorySummaryCards from '@/components/CategorySummaryCards';
import { Router, Activity, Clock } from 'lucide-react';

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
          <p className="mt-2 text-slate-600">Veuillez vous reconnecter.</p>
          <Link href="/connexion" className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-700">Se reconnecter</Link>
        </div>
      </div>
    );
  }

  if (!user) redirect('/connexion');

  // Initialisation
  let sensors: Sensor[] = [];
  let apiError: string | null = null;
  let lastUpdateStr = "N/A";

  try {
    const token = await getToken();
    sensors = await fetchFromApi<Sensor[]>('/api/sensors', token);
    
    // Calcul date dernière mise à jour (la plus récente parmi tous les capteurs)
    if (sensors.length > 0) {
      const dates = sensors
        .map(s => s.state_changed_at ? new Date(s.state_changed_at).getTime() : 0)
        .filter(t => t > 0);
      
      if (dates.length > 0) {
        const lastUpdate = new Date(Math.max(...dates));
        lastUpdateStr = lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      }
    }
  } catch (error) {
    apiError = (error as Error).message;
  }

  // --- CALCUL DES COMPTES (HUBS) ---
  // On compte les hubs uniques basés sur leur ID
  const uniqueHubs = new Set(sensors.map(s => s.hub.hub_id)).size;

  // --- CALCULS MOYENNES ---
  const windowSensors = sensors.filter((s) => s.type.type_key === 'window');
  const openWindowsCount = windowSensors.filter((s) => s.displayValue === 'Ouvert').length;

  const tempSensors = sensors.filter((s) => s.type.type_key === 'temperature');
  const avgTemp = tempSensors.length > 0
      ? Math.round(tempSensors.reduce((acc, s) => acc + Number(s.displayValue || 0), 0) / tempSensors.length)
      : null;

  const humiditySensors = sensors.filter((s) => s.type.type_key === 'humidity');
  const avgHumidity = humiditySensors.length > 0
      ? Math.round(humiditySensors.reduce((acc, s) => acc + Number(s.displayValue || 0), 0) / humiditySensors.length)
      : null;

  const co2Sensors = sensors.filter((s) => s.type.type_key === 'air_quality');
  const avgCo2 = co2Sensors.length > 0
      ? Math.round(co2Sensors.reduce((acc, s) => acc + Number(s.displayValue || 0), 0) / co2Sensors.length)
      : null;
  const co2Unit = co2Sensors.length > 0 ? co2Sensors[0].type.unit : 'ppm';


  return (
    <div>
      {/* HEADER */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Vue d'ensemble
          </h1>
          <p className="mt-1 text-slate-600">Bienvenue {user.firstName}, voici la santé de votre système.</p>
        </div>
        {process.env.NODE_ENV === 'development' && <ApiStatusIndicator />}
      </header>

      {/* 1. TOP BAR : INFOS SYSTÈME (Hubs, Capteurs, Update) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        {/* Hubs Connectés */}
        <div className="flex items-center gap-4 rounded-xl bg-slate-900 p-5 text-white shadow-md">
          <div className="rounded-full bg-slate-800 p-3">
            <Router className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Hubs Connectés</p>
            <p className="text-2xl font-bold">{uniqueHubs}</p>
          </div>
        </div>

        {/* Total Capteurs */}
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="rounded-full bg-blue-50 p-3">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Capteurs</p>
            <p className="text-2xl font-bold text-slate-900">{sensors.length}</p>
          </div>
        </div>

        {/* Dernière mise à jour */}
        <div className="flex items-center gap-4 rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="rounded-full bg-slate-50 p-3">
            <Clock className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dernière MàJ</p>
            <p className="text-2xl font-bold text-slate-900">{lastUpdateStr}</p>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 border border-red-200">
          <p className="font-bold">Erreur système :</p>
          <p className="text-sm">{apiError}</p>
        </div>
      )}

      {/* 2. GRILLE PRINCIPALE (4 Cartes Métier) */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Indicateurs clés</h2>
        <CategorySummaryCards 
            sensors={sensors}
            openWindowsCount={openWindowsCount}
            avgTemp={avgTemp}
            avgHumidity={avgHumidity}
            avgCo2={avgCo2}
            co2Unit={co2Unit}
        />
      </div>
    </div>
  );
}
