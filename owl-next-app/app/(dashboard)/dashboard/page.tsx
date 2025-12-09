import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { fetchFromApi } from '@/src/lib/apiClient';
import { Sensor } from '@/src/types';
import ApiStatusIndicator from '@/components/ApiStatusIndicator';
import CategorySummaryCards from '@/components/CategorySummaryCards';
import { Router, Database, Clock } from 'lucide-react';

export default async function DashboardPage() {
  let user;
  let getToken;

  try {
    user = await currentUser();
    const authData = await auth();
    getToken = authData.getToken;
  } catch {
    return /* Code erreur identique */ null;
  }

  if (!user) redirect('/connexion');

  let sensors: Sensor[] = [];
  let apiError: string | null = null;
  let lastUpdateStr = 'N/A';

  try {
    const token = await getToken();
    sensors = await fetchFromApi<Sensor[]>('/api/sensors', token);

    if (sensors.length > 0) {
      const dates = sensors
        .map((s) => (s.state_changed_at ? new Date(s.state_changed_at).getTime() : 0))
        .filter((t) => t > 0);
      if (dates.length > 0) {
        lastUpdateStr = new Date(Math.max(...dates)).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }
  } catch (error) {
    apiError = (error as Error).message;
  }

  // Calculs (inchangés)
  const uniqueHubs = new Set(sensors.map((s) => s.hub.hub_id)).size;
  const windowSensors = sensors.filter((s) => s.type.type_key === 'window');
  const openWindowsCount = windowSensors.filter((s) => s.displayValue === 'Ouvert').length;
  const tempSensors = sensors.filter((s) => s.type.type_key === 'temperature');
  const avgTemp =
    tempSensors.length > 0
      ? Math.round(
          tempSensors.reduce((acc, s) => acc + Number(s.displayValue || 0), 0) / tempSensors.length
        )
      : null;
  const humiditySensors = sensors.filter((s) => s.type.type_key === 'humidity');
  const avgHumidity =
    humiditySensors.length > 0
      ? Math.round(
          humiditySensors.reduce((acc, s) => acc + Number(s.displayValue || 0), 0) /
            humiditySensors.length
        )
      : null;
  const co2Sensors = sensors.filter((s) => s.type.type_key === 'air_quality');
  const avgCo2 =
    co2Sensors.length > 0
      ? Math.round(
          co2Sensors.reduce((acc, s) => acc + Number(s.displayValue || 0), 0) / co2Sensors.length
        )
      : null;
  const co2Unit = co2Sensors.length > 0 ? co2Sensors[0].type.unit : 'ppm';

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-700">
      {/* HEADER AVEC NOUVELLE PHRASE */}
      <header className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Vue d'ensemble
          </h1>
          {/* ✅ PHRASE DEMANDÉE */}
          <p className="mt-2 text-lg font-medium text-slate-500">
            Bonjour <span className="text-blue-600">{user.firstName}</span>, voici le récapitulatif
            de vos capteurs.
          </p>
        </div>
        {process.env.NODE_ENV === 'development' && <ApiStatusIndicator />}
      </header>

      {/* 1. TOP BAR : TOUTES LES CASES EN BLANC (Style Uniforme) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* CARTE 1: HUBS */}
        <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/50 border border-slate-100 transition-transform hover:scale-[1.02]">
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <Router className="h-5 w-5" />
              </div>
              {/* Petit point vert pour dire "Online" */}
              <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <div>
              <p className="text-5xl font-black tracking-tighter text-slate-900">{uniqueHubs}</p>
              <p className="text-sm font-medium text-slate-400 mt-1">Hubs Connectés</p>
            </div>
          </div>
        </div>

        {/* CARTE 2: CAPTEURS (Déjà bonne, on la garde) */}
        <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/50 border border-slate-100 transition-transform hover:scale-[1.02]">
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <Database className="h-5 w-5" />
              </div>
              <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <div>
              <p className="text-5xl font-black tracking-tighter text-slate-900">
                {sensors.length}
              </p>
              <p className="text-sm font-medium text-slate-400 mt-1">Capteurs Actifs</p>
            </div>
          </div>
        </div>

        {/* CARTE 3: UPDATE (Version Blanche aussi) */}
        <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/50 border border-slate-100 transition-transform hover:scale-[1.02]">
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                <Clock className="h-5 w-5" />
              </div>
              <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <div>
              <p className="text-4xl font-black tracking-tight text-slate-900">{lastUpdateStr}</p>
              <p className="text-sm font-medium text-slate-400 mt-1">Dernière Mise à Jour</p>
            </div>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="rounded-2xl border-l-4 border-red-500 bg-white p-6 shadow-lg">
          <p className="font-bold text-red-600 flex items-center gap-2">
            ⚠️ Erreur de communication
          </p>
          <p className="mt-1 text-slate-600">{apiError}</p>
        </div>
      )}

      {/* 2. BLOC CENTRAL */}
      <div>
        <h2 className="mb-6 text-xl font-black uppercase tracking-widest text-slate-400 flex items-center gap-4 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200">
          Métriques Environnementales
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
