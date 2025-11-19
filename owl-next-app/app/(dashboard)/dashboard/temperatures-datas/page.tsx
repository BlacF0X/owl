'use client';

import React from 'react';
import TemperatureCircle from '@/components/TemperatureCircle';
import TemperatureDayChart from '@/components/TemperatureDayChart';

const sensors = [
  {
    sensorName: 'Salle à manger / Sensor 1',
    temperature: 22.5,
    tempHistory: [
      21, 21.1, 21, 20.7, 20.6, 20.6, 21, 21.2, 22, 22.5, 22.7, 22.9, 22.7, 22.4, 22.5, 22.6, 22.4,
      22.2, 22, 27.9, 21.7, 21.3, 21.2, 21.1,
    ],
  },
  {
    sensorName: 'Salon',
    temperature: 18.0,
    tempHistory: [
      16.5, 16.6, 16.6, 16.7, 16.8, 17.0, 17.2, 17.6, 18.0, 18.9, 19.0, 19.2, 19.1, 19.0, 18.8,
      18.5, 18.4, 18.1, 18.0, 17.9, 17.8, 17.7, 17.7, 17.6,
    ],
  },
  {
    sensorName: 'Chambre',
    temperature: 28.0,
    tempHistory: [
      25, 25.2, 25.5, 25.7, 26.0, 26.5, 27.1, 28.0, 28.3, 28.4, 28.1, 28.1, 28.2, 28.4, 28.7, 28.9,
      29.0, 28.8, 28.7, 28.3, 27.9, 27.5, 27.0, 26.5,
    ],
  },
];

const TemperaturesDataPage = () => (
  <div className="p-6 space-y-8 bg-slate-100 min-h-screen">
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">Tableau de bord des températures</h1>
      <p className="mt-1 text-slate-600">
        Voici le résumé de l'état de vos capteurs de température.
      </p>
    </header>
    <div className="flex flex-col gap-8 items-center">
      {sensors.map(({ sensorName, temperature, tempHistory }) => (
        <div
          key={sensorName}
          className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center w-full md:w-3/4"
        >
          <div className="w-full md:w-1/3 flex justify-center">
            <TemperatureCircle
              sensorName={sensorName}
              temperature={temperature}
              min={15}
              max={30}
            />
          </div>
          <div className="w-full md:w-2/3 flex justify-center mt-6 md:mt-0">
            <TemperatureDayChart data={tempHistory} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TemperaturesDataPage;
