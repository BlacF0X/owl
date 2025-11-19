import React from 'react';

// Jauge circulaire stylée
const TemperatureGauge = ({ value, min, max }: { value: number; min: number; max: number }) => {
  const radius = 32;
  const stroke = 7;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.max(min, Math.min(value, max));
  const progress = ((safe - min) / (max - min)) * 100;
  const offset = circumference - (progress / 100) * circumference;
  let circleColor = 'stroke-green-500 text-green-600';
  if (value <= 18) circleColor = 'stroke-blue-500 text-blue-500';
  if (value >= 25) circleColor = 'stroke-red-500 text-red-500';

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={80} height={80} className="mb-2">
        <circle cx={40} cy={40} r={radius} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <circle
          cx={40}
          cy={40}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          className={circleColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.4,1)' }}
        />
        <text
          x={40}
          y={46}
          textAnchor="middle"
          fontSize={24}
          fontWeight={700}
          className={circleColor}
        >
          {value.toFixed(1)}°
        </text>
      </svg>
    </div>
  );
};

const sensors = [
  { name: 'Capteur Salle 1', value: 22.5 },
  { name: 'Capteur Extérieur', value: 18.0 },
  { name: 'Capteur Cuisine', value: 25.0 },
];

const TemperaturesDataPage = () => (
  <div className="flex-1 p-6 bg-slate-100 min-h-screen">
    {/* Titre principal, cohérent avec le dashboard général */}
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900 text-center">
        Tableau de bord des températures
      </h1>
      <p className="mt-2 text-slate-600 text-center">
        Voici les données en temps réel de vos capteurs de température.
      </p>
    </header>

    {/* Cartes capteurs : harmonisation avec l'onglet général */}
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sensors.map((sensor) => (
        <div
          key={sensor.name}
          className="rounded-lg bg-white p-6 shadow flex flex-col items-center"
        >
          <h2 className="text-lg font-semibold text-slate-700 mb-2">{sensor.name}</h2>
          {/* Jauge circulaire stylée + valeur */}
          <TemperatureGauge value={sensor.value} min={15} max={30} />
          <div className="mt-2 text-2xl font-bold text-slate-900">{sensor.value.toFixed(1)}°C</div>
          <div className="mt-2 text-xs text-slate-500">
            Dernière mise à jour : il y a quelques secondes
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TemperaturesDataPage;
