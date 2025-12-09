'use client';

import { Sensor } from '@/src/types';
import { Thermometer, Wind, Droplets, Square, Activity } from 'lucide-react';
import { calculateDuration } from '@/src/utils/formatters';

interface GenericSensorsTableProps {
  sensors: Sensor[];
}

export default function GenericSensorsTable({ sensors }: GenericSensorsTableProps) {
  
  // 1. Choisir la bonne icône selon le type
  const getIcon = (typeKey: string) => {
    switch (typeKey) {
      case 'temperature': return <Thermometer className="h-4 w-4 text-orange-500" />;
      case 'humidity': return <Droplets className="h-4 w-4 text-blue-500" />;
      case 'air_quality': return <Wind className="h-4 w-4 text-green-500" />;
      case 'window': return <Square className="h-4 w-4 text-slate-500" />;
      default: return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  // 2. Afficher la valeur (Badge ou Texte + Unité)
  const renderValue = (sensor: Sensor) => {
    // Cas Fenêtres : Badge coloré
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
    
    // Cas Numérique : Valeur + Unité
    return (
      <span className="text-sm font-medium text-slate-900">
        {sensor.displayValue}{' '}
        <span className="text-xs text-slate-500">{sensor.type.unit}</span>
      </span>
    );
  };

  // 3. Info supplémentaire (Durée pour fenêtres)
  const renderExtraInfo = (sensor: Sensor) => {
    if (sensor.type.type_key === 'window' && sensor.displayValue === 'Ouvert') {
      // On s'assure qu'il y a une date valide
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
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Type
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  État / Valeur
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Info
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {sensors.length > 0 ? (
                sensors.map((sensor) => (
                  <tr key={sensor.sensor_id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                      <div className="font-medium text-slate-900">{sensor.name}</div>
                      <div className="text-xs text-slate-500">{sensor.hub.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                       <div className="flex items-center gap-2">
                        {getIcon(sensor.type.type_key)}
                        <span className="capitalize">{sensor.type.name}</span>
                       </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {renderValue(sensor)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {renderExtraInfo(sensor)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-slate-500">
                    Aucun capteur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}