'use client';

import { useState } from 'react';
import { Sensor } from '@/src/types';
import WindowSensorCard from '@/components/WindowSensorCard';
import SensorDetailsModal from '@/components/SensorDetailsModal';

interface WindowSensorsViewProps {
  sensorsByHub: Record<string, Sensor[]>;
  referenceDate?: Date;
}

export default function WindowSensorsView({ sensorsByHub, referenceDate }: WindowSensorsViewProps) {
  // État pour savoir quel capteur est sélectionné (et donc afficher la modale)
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);

  return (
    <>
      <div className="space-y-12">
        {Object.entries(sensorsByHub).map(([hubName, sensors]) => (
          <section key={hubName}>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-3">{hubName}</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {sensors.map((sensor) => (
                // On enveloppe la carte dans une div clickable
                <div
                  key={sensor.sensor_id}
                  onClick={() => setSelectedSensor(sensor)}
                  className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <WindowSensorCard sensor={sensor} referenceDate={referenceDate} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Affichage conditionnel de la modale */}
      {selectedSensor && (
        <SensorDetailsModal
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
          referenceDate={referenceDate}
        />
      )}
    </>
  );
}
