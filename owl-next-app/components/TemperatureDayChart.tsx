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

interface ChartProps {
  data: { label: string; value: number }[];
  color?: string;
}

export default function TemperatureDayChart({ data, color = '#f59e0b' }: ChartProps) {
  const safeData = data && data.length > 0 ? data : [];

  const chartData = {
    labels: safeData.map((d) => d.label),
    datasets: [
      {
        label: 'Température',
        data: safeData.map((d) => d.value),
        borderColor: color,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(245, 158, 11, 0.2)');
          gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: color,
        pointBorderWidth: 2,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.parsed.y.toFixed(1)}°C`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 }, // Police un peu plus petite pour que tout rentre
          maxRotation: 0,
          // --- MODIFICATIONS CLÉS ICI ---
          autoSkip: false,    // Désactive la suppression automatique des labels
          maxTicksLimit: 24,  // Autorise jusqu'à 24 labels (un par heure)
          // -----------------------------
        },
        border: { display: false },
      },
      y: {
        min: 15,
        max: 30,
        grid: {
          color: '#f1f5f9',
          borderDash: [5, 5],
        },
        ticks: {
          stepSize: 5,
          color: '#94a3b8',
          font: { size: 11 },
          callback: (value: any) => `${value}°`,
        },
        border: { display: false },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  if (safeData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-lg">
        Pas de données disponibles
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
}
