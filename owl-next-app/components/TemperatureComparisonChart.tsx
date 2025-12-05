'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
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
  data: { label: string; value: number | null }[];
}

interface ComparisonChartProps {
  sensorsData: SensorData[];
  loading?: boolean;
}

// Palette de couleurs LIGHT pour les capteurs individuels
const LIGHT_COLORS = [
  '#93c5fd', // Bleu clair
  '#fca5a5', // Rouge clair
  '#6ee7b7', // Vert clair
  '#fcd34d', // Jaune clair
  '#c4b5fd', // Violet clair
  '#f9a8d4', // Rose clair
  '#5eead4', // Turquoise clair
  '#fdba74', // Orange clair
];

export default function TemperatureComparisonChart({ sensorsData, loading }: ComparisonChartProps) {
  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
        <p>Chargement de la comparaison...</p>
      </div>
    );
  }

  if (!sensorsData || sensorsData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-lg">
        Aucune donnée disponible pour la comparaison
      </div>
    );
  }

  // Labels (jours communs)
  const labels = sensorsData[0]?.data.map((d) => d.label) || [];

  // ✅ CALCUL DE LA MOYENNE GLOBALE pour chaque jour
  const averageData = labels.map((_, dayIndex) => {
    const valuesAtThisDay = sensorsData
      .map((sensor) => sensor.data[dayIndex]?.value)
      .filter((v): v is number => v !== null && !isNaN(v));

    if (valuesAtThisDay.length === 0) return null;

    const sum = valuesAtThisDay.reduce((a, b) => a + b, 0);
    return sum / valuesAtThisDay.length;
  });

  // ✅ Datasets : Capteurs individuels (LIGHT + transparence + ordre 2)
  const sensorDatasets = sensorsData.map((sensor, index) => ({
    label: sensor.sensorName,
    data: sensor.data.map((d) => d.value),
    borderColor: LIGHT_COLORS[index % LIGHT_COLORS.length],
    backgroundColor: `${LIGHT_COLORS[index % LIGHT_COLORS.length]}20`,
    borderWidth: 1.5,
    pointRadius: 3,
    pointHoverRadius: 5,
    pointBackgroundColor: '#fff',
    pointBorderColor: LIGHT_COLORS[index % LIGHT_COLORS.length],
    pointBorderWidth: 2,
    tension: 0.4,
    spanGaps: true,
    order: 2, // ✅ En arrière-plan
  }));

  // ✅ Dataset de la MOYENNE GLOBALE (épaisse + ordre 1 = AVANT-PLAN)
  const averageDataset = {
    label: '📊 Moyenne Globale',
    data: averageData,
    borderColor: '#1e293b',
    backgroundColor: '#1e293b15',
    borderWidth: 5,
    pointRadius: 6,
    pointHoverRadius: 8,
    pointBackgroundColor: '#1e293b',
    pointBorderColor: '#fff',
    pointBorderWidth: 3,
    tension: 0.4,
    spanGaps: true,
    order: 1, // ✅ EN AVANT-PLAN
  };

  const chartData = {
    labels,
    datasets: [...sensorDatasets, averageDataset],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: 'bold' },
          color: '#64748b',
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (value === null) return '';
            return `${context.dataset.label}: ${value.toFixed(1)}°C`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 11, weight: 'bold' },
          maxRotation: 0,
          autoSkip: false,
        },
        border: { display: false },
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
          font: { size: 11 },
          callback: (value) => `${value}°`,
        },
        border: { display: false },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div className="h-full w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
