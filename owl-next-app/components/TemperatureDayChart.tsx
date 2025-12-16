'use client';

import { Line } from 'react-chartjs-2';
import { useMemo } from 'react';
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
  ChartOptions
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

interface ChartDataPoint {
  label: string;
  value: number | null;
}

interface ChartProps {
  data: ChartDataPoint[];
  currentHour?: number | null;
}

const COLORS = {
  green: '#10b981',
  blue: '#3b82f6',
  red: '#ef4444',
  green33: '#10b98133',
  blue33: '#3b82f633',
  red33: '#ef444433'
};

const getColor = (val: number) => {
  if (val > 23) return COLORS.red;
  if (val < 18) return COLORS.blue;
  return COLORS.green;
};

export default function TemperatureDayChart({ data, currentHour }: ChartProps) {
  const safeData = data && data.length > 0 ? data : [];

  const isRealTime = currentHour !== null && currentHour !== undefined;

  // ✅ OPTIMISATION : Mémoïsation des données du graphique
  const chartData = useMemo(() => ({
    labels: safeData.map((d) => d.label),
    datasets: [
      {
        label: 'Température',
        data: safeData.map((d) => d.value),
        segment: {
          borderColor: (ctx: any) => {
            if (!ctx.p1 || !ctx.p1.parsed) return COLORS.green;
            const val = ctx.p1.parsed.y;
            if (val > 23) return COLORS.red;
            if (val < 18) return COLORS.blue;
            return COLORS.green;
          },
          backgroundColor: (ctx: any) => {
            if (!ctx.p1 || !ctx.p1.parsed) return COLORS.green33;
            const val = ctx.p1.parsed.y;
            if (val > 23) return COLORS.red33;
            if (val < 18) return COLORS.blue33;
            return COLORS.green33;
          }
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: (context: any) => {
          const val = context.raw as number | null;
          if (val === null) return COLORS.green;
          return getColor(val);
        },
        pointBorderWidth: 2,
        borderWidth: 2,
        spanGaps: false
      }
    ]
  }), [safeData]);

  // ✅ OPTIMISATION : Mémoïsation des options
  const options = useMemo<ChartOptions<'line'>>(() => {
    const baseOptions: ChartOptions<'line'> = {
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
          displayColors: true,
          callbacks: {
            label: (context) => {
              if (context.parsed.y === null) return '';
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}°C`;
            }
          }
        },
        annotation: isRealTime && currentHour !== null
          ? {
              annotations: {
                currentHourLine: {
                  type: 'line',
                  xMin: currentHour,
                  xMax: currentHour,
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  label: {
                    display: true,
                    content: 'Maintenant',
                    position: 'start',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    font: { size: 10, weight: 'bold' }
                  }
                }
              }
            }
          : undefined
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#94a3b8',
            font: { size: 10 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8
          },
          border: { display: false }
        },
        y: {
          min: 15,
          max: 30,
          grid: {
            color: '#f1f5f9',
            tickBorderDash: [5, 5]
          },
          ticks: {
            stepSize: 5,
            color: '#94a3b8',
            font: { size: 11 },
            callback: (value: any) => `${value}°`
          },
          border: { display: false }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    };
    return baseOptions;
  }, [isRealTime, currentHour]);

  if (safeData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-lg">
        Pas de données disponibles
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
}
