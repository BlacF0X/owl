import React from 'react';

const TemperaturesDataPage = () => {
  // Exemple de données de capteurs de température
  const temperatureSensors = [
    { id: 1, name: 'Capteur Salle 1', value: 22.5, unit: '°C' },
    { id: 2, name: 'Capteur Extérieur', value: 18.0, unit: '°C' },
    { id: 3, name: 'Capteur Cuisine', value: 25.0, unit: '°C' },
  ];

  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-4">Capteurs de température</h1>
      <p className="text-gray-600 mb-6">Page pour les capteurs de température.</p>

      <div className="space-y-4">
        {temperatureSensors.map((sensor) => (
          <div key={sensor.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold">{sensor.name}</h2>
            <p className="text-2xl mt-2">
              {sensor.value} {sensor.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemperaturesDataPage;
