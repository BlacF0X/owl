'use client';

import React, { useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Eye, EyeOff } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SensorData {
  sensorName: string;
  data: (number | null)[];
}

interface ComparisonChartProps {
  labels: string[];
  sensorsData: SensorData[];
  averageData: (number | null)[];
}

const SENSOR_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export default function TemperatureComparisonChart({
  labels,
  sensorsData,
  averageData,
}: ComparisonChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [hiddenDatasets, setHiddenDatasets] = useState<Set<number>>(new Set());

  const toggleDataset = (index: number) => {
    const newHidden = new Set(hiddenDatasets);
    if (newHidden.has(index)) {
      newHidden.delete(index);
    } else {
      newHidden.add(index);
    }
    setHiddenDatasets(newHidden);

    // Mettre à jour le graphique
    if (chartRef.current) {
      const chart = chartRef.current;
      if (newHidden.has(index)) {
        chart.hide(index);
      } else {
        chart.show(index);
      }
    }
  };

  const allDatasets = [
    ...sensorsData.map((sensor, index) => ({
      label: sensor.sensorName,
      color: SENSOR_COLORS[index % SENSOR_COLORS.length],
      isAverage: false,
    })),
    {
      label: 'Moyenne de tous les capteurs',
      color: '#000000',
      isAverage: true,
    },
  ];

  const chartData = {
    labels,
    datasets: [
      ...sensorsData.map((sensor, index) => ({
        label: sensor.sensorName,
        data: sensor.data,
        borderColor: SENSOR_COLORS[index % SENSOR_COLORS.length],
        backgroundColor: `${SENSOR_COLORS[index % SENSOR_COLORS.length]}20`,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 2,
        spanGaps: false,
        order: 2,
      })),
      {
        label: 'Moyenne de tous les capteurs',
        data: averageData,
        borderColor: '#000000',
        backgroundColor: '#00000020',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 8,
        borderWidth: 4,
        borderDash: [5, 5],
        spanGaps: false,
        order: 1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: (context) => {
            if (context.parsed.y === null) return '';
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}°C`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 10,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        min: 15,
        max: 30,
        grid: {
          color: '#f1f5f9',
          tickBorderDash: [5, 5],
        },
        ticks: {
          stepSize: 5,
          color: '#94a3b8',
          font: {
            size: 11,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: (value: any) => `${value}°`,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  if (sensorsData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-lg">
        Pas de données disponibles
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Légende personnalisée */}
      <div className="flex flex-wrap gap-2 justify-center pb-4 border-b border-slate-100 mb-4">
        {allDatasets.map((dataset, index) => {
          const isHidden = hiddenDatasets.has(index);
          return (
            <button
              key={index}
              onClick={() => toggleDataset(index)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                transition-all duration-200 ease-in-out
                ${
                  isHidden
                    ? 'bg-slate-100 text-slate-400 opacity-50'
                    : 'bg-white border-2 shadow-sm hover:shadow-md'
                }
                ${dataset.isAverage ? 'border-slate-300' : ''}
              `}
              style={{
                borderColor: !isHidden ? dataset.color : '#e2e8f0',
              }}
            >
              <div
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  dataset.isAverage ? 'border-2 border-dashed' : ''
                }`}
                style={{
                  backgroundColor: !isHidden ? dataset.color : '#cbd5e1',
                  borderColor: dataset.isAverage && !isHidden ? dataset.color : 'transparent',
                }}
              />
              <span className={isHidden ? 'line-through' : ''}>{dataset.label}</span>
              {isHidden ? (
                <EyeOff className="h-3.5 w-3.5 opacity-50" />
              ) : (
                <Eye className="h-3.5 w-3.5 opacity-70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Graphique - Prend tout l'espace restant */}
      <div className="flex-1 min-h-0">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
