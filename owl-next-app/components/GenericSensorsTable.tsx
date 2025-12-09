'use client';

import { Sensor } from '@/src/types';
import { Thermometer, Wind, Droplets, Square, Activity } from 'lucide-react';
import { calculateDuration } from '@/src/utils/formatters';

interface GenericSensorsTableProps {
  sensors: Sensor[];
}

export default function GenericSensorsTable({ sensors }: GenericSensorsTableProps) {
  
  // 1. Logique de regroupement par type
  const groupedSensors = sensors.reduce((groups, sensor) => {
    const category = sensor.type.name; // ex: "Température", "Fenêtre"
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(sensor);
    return groups;
  }, {} as Record<string, Sensor[]>);

  // Ordre d'affichage souhaité des catégories
  const categoryOrder = ['Fenêtre', 'Température', 'Humidité', 'Qualité de l\'air'];

  // Récupérer les clés triées selon l'ordre défini + les autres à la fin
  const sortedCategories = Object.keys(groupedSensors).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    // Si les deux sont dans la liste, on respecte l'ordre
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    // Si un seul est dans la liste, il passe devant
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // Sinon ordre alphabétique
    return a.localeCompare(b);
  });

  // --- Helpers d'affichage (Identiques à avant) ---
  const getIcon = (typeKey: string) => {
    switch (typeKey) {
      case 'temperature': return <Thermometer className="h-4 w-4 text-orange-500" />;
      case 'humidity': return <Droplets className="h-4 w-4 text-blue-500" />;
      case 'air_quality': return <Wind className="h-4 w-4 text-green-500" />;
      case 'window': return <Square className="h-4 w-4 text-slate-500" />;
      default: return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  const renderValue = (sensor: Sensor) => {
    if (sensor.type.type_key === 'window') {
      const isOpen = sensor.displayValue === 'Ouvert';
      return (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${
            isOpen ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}
        >
          {sensor.displayValue}
        </span>
      );
    }
    return (
      <span className="text-sm font-medium text-slate-900">
        {sensor.displayValue}{' '}
        <span className="text-xs text-slate-500">{sensor.type.unit}</span>
      </span>
    );
  };

  const renderExtraInfo = (sensor: Sensor) => {
    if (sensor.type.type_key === 'window' && sensor.displayValue === 'Ouvert') {
      if (sensor.state_changed_at) {
        return (
          <span className="text-sm text-red-600 font-medium">
             {calculateDuration(sensor.state_changed_at)}
          </span>
        );
      }
    }
    return <span className="text-sm text-slate-400">-</span>;
  };

  if (sensors.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <p className="text-slate-500">Aucun capteur trouvé.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <div className="-mx-6 -my-2 overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-0">
                  Identifiant
                </th>
                {/* On enlève la colonne Type puisqu'elle sera en titre de section */}
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  État / Valeur
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Info
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sortedCategories.map((category) => (
                <>
                  {/* Ligne de séparation / Titre de catégorie */}
                  <tr key={`header-${category}`} className="bg-slate-50/80">
                    <td colSpan={3} className="py-2 pl-4 pr-3 text-xs font-bold uppercase tracking-wider text-slate-500 sm:pl-0 border-t border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        {getIcon(groupedSensors[category][0].type.type_key)}
                        {category} ({groupedSensors[category].length})
                      </div>
                    </td>
                  </tr>

                  {/* Liste des capteurs de cette catégorie */}
                  {groupedSensors[category].map((sensor) => (
                    <tr key={sensor.sensor_id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                        <div className="font-medium text-slate-900">{sensor.name}</div>
                        <div className="text-xs text-slate-500">{sensor.hub.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {renderValue(sensor)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {renderExtraInfo(sensor)}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}