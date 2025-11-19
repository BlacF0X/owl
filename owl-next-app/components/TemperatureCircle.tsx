import React from 'react';

type TemperatureCircleProps = {
  temperature: number;
  min: number;
  max: number;
};

const TemperatureCircle: React.FC<TemperatureCircleProps> = ({ temperature, min, max }) => {
  const radius = 32;
  const stroke = 7;
  const circumference = 2 * Math.PI * radius;

  const safeTemp = Math.min(Math.max(temperature, min), max);
  const progress = ((safeTemp - min) / (max - min)) * 100;
  const offset = circumference - (progress / 100) * circumference;

  let colorClass = 'stroke-green-500 text-green-600';
  if (temperature <= 18) colorClass = 'stroke-blue-500 text-blue-500';
  if (temperature >= 25) colorClass = 'stroke-red-500 text-red-500';

  return (
    <div className="flex items-center justify-center">
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
          className={colorClass}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
        <text
          x={40}
          y={46}
          fontSize={22}
          fontWeight="700"
          fill="currentColor"
          textAnchor="middle"
          className={colorClass}
        >
          {temperature.toFixed(1)}°
        </text>
      </svg>
    </div>
  );
};

export default TemperatureCircle;
