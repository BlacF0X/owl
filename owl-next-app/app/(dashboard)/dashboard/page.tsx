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
    return null;
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

  // Calculs
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
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Vue d'ensemble
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Bonjour <span className="font-semibold text-blue-600">{user.firstName}</span>, voici le
            récapitulatif de vos capteurs.
          </p>
        </div>
        {process.env.NODE_ENV === 'development' && <ApiStatusIndicator />}
      </header>

      {/* 1. TOP BAR : CARTES RÉCAPITULATIVES */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* CARTE 1: HUBS */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-blue-200">
          {/* Badge Position Absolue */}
          <div className="absolute top-6 right-6 flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
            En ligne
          </div>

          <div className="flex flex-col justify-between h-full gap-4">
            <div>
              <div className="inline-flex rounded-lg bg-blue-50 p-2.5 text-blue-600 transition-colors group-hover:bg-blue-100">
                <Router className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold tracking-tight text-slate-900">{uniqueHubs}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Hubs Connectés</p>
            </div>
          </div>
        </div>

        {/* CARTE 2: CAPTEURS */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-indigo-200">
          {/* Badge Position Absolue */}
          <div className="absolute top-6 right-6 flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
            Actifs
          </div>

          <div className="flex flex-col justify-between h-full gap-4">
            <div>
              <div className="inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                <Database className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold tracking-tight text-slate-900">{sensors.length}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Capteurs Totaux</p>
            </div>
          </div>
        </div>

        {/* CARTE 3: UPDATE */}
        <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-violet-200">
          {/* Badge Position Absolue */}
          <div className="absolute top-6 right-6 rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
            Temps réel
          </div>

          <div className="flex flex-col justify-between h-full gap-4">
            <div>
              <div className="inline-flex rounded-lg bg-violet-50 p-2.5 text-violet-600 transition-colors group-hover:bg-violet-100">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-bold tracking-tight text-slate-900">{lastUpdateStr}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Dernière mise à jour</p>
            </div>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="rounded-xl border-l-4 border-red-500 bg-white p-4 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur de communication</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{apiError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BLOC CENTRAL */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900">Métriques Environnementales</h2>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

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
