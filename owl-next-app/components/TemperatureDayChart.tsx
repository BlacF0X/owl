'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';

// Chart.js registration
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type TemperatureDayChartProps = {
  data: number[];
};

const TemperatureDayChart: React.FC<TemperatureDayChartProps> = ({ data }) => {
  // Labels horaires : 0h à 23h (si data.length === 24)
  const labels = Array.from({ length: data.length }, (_, i) => `${i}h`);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Température',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: data.map((v) => {
          if (v <= 18) return '#3b82f6';
          if (v >= 26) return '#dc2626';
          return '#22c55e';
        }),
        pointBorderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          // Typage précis dans la callback pour éviter l'erreur any et 'is possibly null'
          label: (ctx: TooltipItem<'line'>) => {
            const y =
              typeof ctx.parsed === 'number'
                ? ctx.parsed
                : ctx.parsed !== null && ctx.parsed !== undefined
                  ? ctx.parsed.y
                  : null;
            return y !== null && y !== undefined ? `${y.toFixed(1)}°C` : '';
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Heure', font: { size: 16 } },
        ticks: {
          autoSkip: false,
          font: { size: 14 },
        },
        grid: { display: false },
      },
      y: {
        min: 15,
        max: 30,
        title: { display: true, text: 'Température (°C)', font: { size: 16 } },
        ticks: {
          stepSize: 1,
          font: { size: 14 },
        },
        grid: { color: '#e5e7eb', borderDash: [4, 4] },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full md:w-[600px] h-[300px]">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default TemperatureDayChart;
