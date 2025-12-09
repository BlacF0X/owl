import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchFromApi } from '@/src/lib/apiClient';
import { Sensor } from '@/src/types';
import ApiStatusIndicator from '@/components/ApiStatusIndicator';
import Link from 'next/link';
import CategorySummaryCards from '@/components/CategorySummaryCards';
import { Router, Activity, Clock, Zap } from 'lucide-react';

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
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white p-10 text-center shadow-xl border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">Session expirée</h2>
          <p className="mt-2 text-slate-500">Veuillez vous reconnecter pour accéder au dashboard.</p>
          <Link href="/connexion" className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (!user) redirect('/connexion');

  let sensors: Sensor[] = [];
  let apiError: string | null = null;
  let lastUpdateStr = "N/A";

  try {
    const token = await getToken();
    sensors = await fetchFromApi<Sensor[]>('/api/sensors', token);
    
    if (sensors.length > 0) {
      const dates = sensors
        .map(s => s.state_changed_at ? new Date(s.state_changed_at).getTime() : 0)
        .filter(t => t > 0);
      
      if (dates.length > 0) {
        lastUpdateStr = new Date(Math.max(...dates)).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      }
    }
  } catch (error) {
    apiError = (error as Error).message;
  }

  const uniqueHubs = new Set(sensors.map(s => s.hub.hub_id)).size;
  const windowSensors = sensors.filter((s) => s.type.type_key === 'window');
  const openWindowsCount = windowSensors.filter((s) => s.displayValue === 'Ouvert').length;
  const tempSensors = sensors.filter((s) => s.type.type_key === 'temperature');
  const avgTemp = tempSensors.length > 0 ? Math.round(tempSensors.reduce((acc, s) => acc + Number(s.displayValue || 0), 0) / tempSensors.length) : null;
  const humiditySensors = sensors.filter((s) => s.type.type_key === 'humidity');
  const avgHumidity = humiditySensors.length > 0 ? Math.round(humiditySensors.reduce((acc, s) => acc + Number(s.displayValue || 0), 0) / humiditySensors.length) : null;
  const co2Sensors = sensors.filter((s) => s.type.type_key === 'air_quality');
  const avgCo2 = co2Sensors.length > 0 ? Math.round(co2Sensors.reduce((acc, s) => acc + Number(s.displayValue || 0), 0) / co2Sensors.length) : null;
  const co2Unit = co2Sensors.length > 0 ? co2Sensors[0].type.unit : 'ppm';

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER AVEC MESSAGE D'ACCUEIL */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Vue d'ensemble
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Ravi de vous revoir, <span className="font-semibold text-slate-900">{user.firstName}</span>.
          </p>
        </div>
        {process.env.NODE_ENV === 'development' && <ApiStatusIndicator />}
      </header>

      {/* --- 1. BLOC TOP (3 Cases "Système") --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        
        {/* Case HUBS (Style "Command Center" sombre) */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 shadow-xl shadow-slate-200 text-white">
            <div className="absolute right-0 top-0 h-32 w-32 -mr-8 -mt-8 rounded-full bg-blue-500 blur-3xl opacity-20"></div>
            <div className="relative z-10 flex items-center gap-4">
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                    <Router className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Hubs Connectés</p>
                    <p className="text-3xl font-black">{uniqueHubs}</p>
                </div>
            </div>
        </div>

        {/* Case CAPTEURS (Style Blanc Clean + Icone Vibrante) */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-slate-100 border border-slate-100">
            <div className="flex items-center gap-4">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                    <Activity className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Parc Capteurs</p>
                    <div className="flex items-baseline gap-2">
                         <p className="text-3xl font-black text-slate-900">{sensors.length}</p>
                         <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            <Zap className="mr-1 h-3 w-3 fill-current" /> Actifs
                         </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Case UPDATE (Style Blanc Clean) */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-slate-100 border border-slate-100">
            <div className="flex items-center gap-4">
                <div className="rounded-xl bg-slate-50 p-3 text-slate-600">
                    <Clock className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Dernière Synchro</p>
                    <p className="text-3xl font-black text-slate-900">{lastUpdateStr}</p>
                </div>
            </div>
        </div>

      </div>

      {apiError && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 shadow-sm">
          <p className="font-bold flex items-center gap-2">
            <Activity className="h-5 w-5" /> Erreur système détectée
          </p>
          <p className="mt-1 text-sm ml-7 opacity-90">{apiError}</p>
        </div>
      )}

      {/* --- 2. BLOC CENTRAL (4 Grandes Cartes) --- */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-slate-800 flex items-center gap-2">
           Données en temps réel
        </h2>
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
