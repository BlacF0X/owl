'use client';

import React from 'react';
import TemperatureCircle from '@/components/TemperatureCircle';

const sensors = [
  { sensorName: 'Salle à manger', temperature: 22.5 },
  { sensorName: 'Salon', temperature: 18.0 },
  { sensorName: 'Chambre', temperature: 28.0 },
];

const TemperaturesDataPage = () => (
  <div className="p-6 space-y-8 bg-slate-100 min-h-screen">
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Tableau de bord des températures
      </h1>
      <p className="mt-1 text-slate-600">
        Voici le résumé de l'état de vos capteurs de température.
      </p>
    </header>
    <div className="flex flex-col gap-10 items-center">
      {sensors.map(({ sensorName, temperature }) => (
        <TemperatureCircle
          key={sensorName}
          sensorName={sensorName}
          temperature={temperature}
          min={15}
          max={30}
        />
      ))}
    </div>
  </div>
);

export default TemperaturesDataPage;
