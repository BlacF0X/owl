import React from 'react';

interface TemperatureCircleProps {
  sensorName: string;
  temperature: number;
  min?: number;
  max?: number;
  subtitle?: string;
}

const TemperatureCircle: React.FC<TemperatureCircleProps> = ({
  sensorName,
  temperature,
  min = 15, // min est défini mais pas utilisé pour le calcul visuel ici, on le garde pour extensibilité
  max = 30, // idem
  subtitle = 'Température en temps réel',
}) => {
  // Suppression de la variable inutile colorClass

  // Calcul simple pour l'anneau de progression
  // Note : on utilise min/max ici pour le pourcentage
  const percentage = Math.min(Math.max(((temperature - min) / (max - min)) * 100, 0), 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Définition des couleurs dynamiques
  const getStrokeColor = () => {
    if (temperature >= 23) return 'stroke-red-500'; // Trop chaud
    if (temperature <= 18) return 'stroke-blue-500'; // Trop froid
    return 'stroke-green-500'; // Confort 18–22
  };

  const getTextColor = () => {
    if (temperature >= 23) return 'text-red-500';
    if (temperature <= 18) return 'text-blue-500';
    return 'text-green-500';
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{sensorName}</h3>

      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Cercle de fond */}
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          {/* Cercle de progression */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className={`transition-all duration-1000 ease-out ${getStrokeColor()}`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <span className={`text-3xl font-bold ${getTextColor()}`}>{temperature.toFixed(1)}°</span>
      </div>

      <p className="text-sm text-slate-500 mt-4 font-medium">{subtitle}</p>
    </div>
  );
};

export default TemperatureCircle;
