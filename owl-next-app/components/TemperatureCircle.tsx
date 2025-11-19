'use client';

import React from 'react';

type TemperatureCircleProps = {
  sensorName: string;
  temperature: number;
  min: number;
  max: number;
};

const TemperatureCircle: React.FC<TemperatureCircleProps> = ({ sensorName, temperature, min, max }) => {
  const radius = 32;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  const safeTemp = Math.min(Math.max(temperature, min), max);
  const progress = ((safeTemp - min) / (max - min)) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  let color = '#22c55e';
  if (temperature <= 18) color = '#3b82f6';
  else if (temperature >= 26) color = '#dc2626';

  return (
    <div className="flex flex-col items-center w-full">
      <svg width={100} height={100} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r={radius} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.7s ease' }}
        />
        <text
          x="50"
          y="54"
          fill={color}
          fontSize={22}
          fontWeight="700"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          {temperature.toFixed(1)}°
        </text>
      </svg>
      <p className="text-sm text-slate-500 mt-2">Température en temps réel</p>
    </div>
  );
};

export default TemperatureCircle;
