import React from 'react';
import TemperatureCircle from '@/components/TemperatureCircle';

const sensors = [
  { id: 'salon', temperature: 22.5 },
  { id: 'exterieur', temperature: 18.0 },
  { id: 'cuisine', temperature: 25.0 },
];

const TemperaturesDataPage = () => (
  <div className="p-6 bg-slate-100 min-h-screen space-y-6">
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Tableau de bord des températures
      </h1>
      <p className="mt-1 text-slate-600">
        Voici le résumé de l'état de vos capteurs de température.
      </p>
    </header>

    {/* Affiche les capteurs en liste avec le composant réutilisable */}
    <div className="space-y-8">
      {sensors.map(({ id, temperature }) => (
        <TemperatureCircle key={id} temperature={temperature} min={15} max={30} />
      ))}
    </div>
  </div>
);

export default TemperaturesDataPage;
