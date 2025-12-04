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
  TooltipItem,
  ChartOptions,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

interface ChartProps {
  data: { label: string; value: number | null }[];
  currentHour?: number | null;
}

const COLORS = {
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
};

const getColor = (value: number) => {
  if (value > 25) return COLORS.red;
  if (value < 20) return COLORS.blue;
  return COLORS.green;
};

interface SegmentContext {
  p0: { parsed: { y: number } };
  p1: { parsed: { y: number } };
}

export default function TemperatureDayChart({ data, currentHour }: ChartProps) {
  const safeData = data && data.length > 0 ? data : [];
  
  // On détecte si on est en mode "Temps réel" (vue 24h) grâce à la présence de currentHour
  const isRealTime = currentHour !== null && currentHour !== undefined;

  const chartData = {
    labels: safeData.map((d) => d.label),
    datasets: [
      {
        label: 'Température',
        data: safeData.map((d) => d.value),
        segment: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          borderColor: (ctx: any) => {
            const context = ctx as SegmentContext;
            if (!context.p1 || !context.p1.parsed) return COLORS.green;
            const val = context.p1.parsed.y;
            if (val > 25) return COLORS.red;
            if (val < 20) return COLORS.blue;
            return COLORS.green;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          backgroundColor: (ctx: any) => {
            const context = ctx as SegmentContext;
            if (!context.p1 || !context.p1.parsed) return `${COLORS.green}33`;
            const val = context.p1.parsed.y;
            if (val > 25) return `${COLORS.red}33`;
            if (val < 20) return `${COLORS.blue}33`;
            return `${COLORS.green}33`;
          },
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pointBorderColor: (context: any) => {
          const val = context.raw as number | null;
          if (val === null) return COLORS.green;
          return getColor(val);
        },
        pointBorderWidth: 2,
        borderWidth: 2,
        spanGaps: false,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
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
          label: (context: TooltipItem<'line'>) => {
            if (context.parsed.y === null) return '';
            return `${context.parsed.y.toFixed(1)}°C`;
          },
          labelColor: (context: TooltipItem<'line'>) => {
            const val = context.raw as number | null;
            if (val === null) return { borderColor: COLORS.green, backgroundColor: COLORS.green };
            return {
              borderColor: getColor(val),
              backgroundColor: getColor(val),
            };
          },
        },
      },
      annotation: {
        annotations:
          isRealTime
            ? {
                line1: {
                  type: 'line',
                  xMin: currentHour,
                  xMax: currentHour,
                  borderColor: '#94a3b8',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  label: {
                    display: true,
                    content: 'Maintenant',
                    position: 'start',
                    backgroundColor: 'rgba(148, 163, 184, 0.9)',
                    color: 'white',
                    font: { size: 10, weight: 'bold' },
                    yAdjust: 0,
                  },
                },
              }
            : {},
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          maxRotation: 0,
          // Modification ici : on désactive le saut automatique en mode 24h
          autoSkip: !isRealTime,
          maxTicksLimit: isRealTime ? 24 : 8,
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: (value: any) => `${value}°`,
        },
        border: { display: false },
      },
    },
    interaction: {
      mode: 'index',
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
