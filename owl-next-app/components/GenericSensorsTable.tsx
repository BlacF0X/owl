'use client';

import { Sensor } from '@/src/types';
import { Thermometer, Wind, Droplets, Square, Activity } from 'lucide-react';
import { calculateDuration } from '@/src/utils/formatters';

interface GenericSensorsTableProps {
  sensors: Sensor[];
}

export default function GenericSensorsTable({ sensors }: GenericSensorsTableProps) {
  
  // 1. Groupement
  const groupedSensors = sensors.reduce((groups, sensor) => {
    const key = sensor.type.type_key; // 'window', 'temperature', etc.
    if (!groups[key]) groups[key] = [];
    groups[key].push(sensor);
    return groups;
  }, {} as Record<string, Sensor[]>);

  // Ordre et configuration des blocs
  const sections = [
    { key: 'window', title: 'Fenêtres', icon: Square, color: 'text-slate-500' },
    { key: 'temperature', title: 'Température', icon: Thermometer, color: 'text-orange-500' },
    { key: 'humidity', title: 'Humidité', icon: Droplets, color: 'text-blue-500' },
    { key: 'air_quality', title: 'Qualité de l\'air', icon: Wind, color: 'text-green-500' },
  ];

  // Helpers d'affichage
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
      <span className="text-sm font-mono font-medium text-slate-700">
        {sensor.displayValue} <span className="text-xs text-slate-400">{sensor.type.unit}</span>
      </span>
    );
  };

  const renderExtra = (sensor: Sensor) => {
    if (sensor.type.type_key === 'window' && sensor.displayValue === 'Ouvert') {
       if(sensor.state_changed_at) {
         return <span className="text-xs text-red-600 font-medium ml-2">({calculateDuration(sensor.state_changed_at)})</span>;
       }
    }
    return null;
  };

  if (sensors.length === 0) return <div className="text-center py-8 text-slate-500">Aucun capteur.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {sections.map((section) => {
        const categorySensors = groupedSensors[section.key] || [];
        const Icon = section.icon;

        if (categorySensors.length === 0) return null; // On cache les blocs vides

        return (
          <div key={section.key} className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full">
            {/* Header du bloc */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${section.color}`} />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  {section.title}
                </h3>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 shadow-sm border border-slate-100">
                {categorySensors.length}
              </span>
            </div>

            {/* Contenu liste déroulante */}
            <div className="flex-1 overflow-y-auto max-h-[300px] p-0">
              <table className="min-w-full divide-y divide-slate-100">
                <tbody className="divide-y divide-slate-50">
                  {categorySensors.map((sensor) => (
                    <tr key={sensor.sensor_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-slate-900">{sensor.name}</div>
                        <div className="text-[10px] text-slate-400">{sensor.hub.name}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {renderValue(sensor)}
                        {renderExtra(sensor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}