import React from 'react';

// Jauge circulaire SVG autonome
const TemperatureGauge = ({
  value,
  min,
  max,
}: {
  value: number;
  min: number;
  max: number;
}) => {
  const radius = 32;
  const stroke = 7;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.max(min, Math.min(value, max));
  const progress = ((safe - min) / (max - min)) * 100;
  const offset = circumference - (progress / 100) * circumference;
  let color = 'stroke-green-500 text-green-500';
  if (value <= 18) color = 'stroke-blue-500 text-blue-500';
  if (value >= 25) color = 'stroke-red-500 text-red-500';

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={80} height={80}>
        <circle
          cx={40}
          cy={40}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={40}
          cy={40}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          className={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.4,1)',
          }}
        />
        <text
          x={40}
          y={46}
          textAnchor="middle"
          fontSize={22}
          className={color}
          fontWeight={700}
        >
          {value.toFixed(1)}°
        </text>
      </svg>
    </div>
  );
};

const sensors = [
  { name: 'Capteur Salle 1', value: 32 },
  { name: 'Capteur Extérieur', value: 18.0 },
  { name: 'Capteur Cuisine', value: 25.0 },
];

const TemperaturesDataPage = () => (
  <div className="flex-1 p-6 bg-gray-50 min-h-screen">
    <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
      Tableau de bord des températures
    </h1>
    <p className="text-gray-600 mb-6 text-center">
      Voici les données en temps réel de vos capteurs de température.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {sensors.map((sensor) => (
        <div
          key={sensor.name}
          className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105 flex flex-col items-center"
        >
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            {sensor.name}
          </h2>
          <TemperatureGauge value={sensor.value} min={15} max={30} />
          <div className="mt-2 text-sm text-gray-500">
            Dernière mise à jour : il y a quelques secondes
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TemperaturesDataPage;
