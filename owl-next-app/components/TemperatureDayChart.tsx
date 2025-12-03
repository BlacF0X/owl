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
  ScriptableContext, // Assure-toi que cet import est là
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

// Définition des couleurs
const COLORS = {
  blue: '#3b82f6',   // < 20°C
  green: '#22c55e',  // 20-25°C
  red: '#ef4444',    // > 25°C
};

// Fonction utilitaire pour déterminer la couleur d'un point
const getColor = (value: number) => {
  if (value > 25) return COLORS.red;
  if (value < 20) return COLORS.blue;
  return COLORS.green;
};

export default function TemperatureDayChart({ data, currentHour }: ChartProps) {
  const safeData = data && data.length > 0 ? data : [];

  const chartData = {
    labels: safeData.map((d) => d.label),
    datasets: [
      {
        label: 'Température',
        data: safeData.map((d) => d.value),
        
        // --- CORRECTION ICI : Typage explicite 'any' pour éviter l'erreur ---
        segment: {
          borderColor: (ctx: any) => {
            // Vérification de sécurité : ctx.p1 peut être undefined lors des transitions
            if (!ctx.p1 || !ctx.p1.parsed) return COLORS.green;
            
            const val = ctx.p1.parsed.y;
            if (val > 25) return COLORS.red;
            if (val < 20) return COLORS.blue;
            return COLORS.green;
          },
          backgroundColor: (ctx: any) => {
             if (!ctx.p1 || !ctx.p1.parsed) return `${COLORS.green}33`;

              const val = ctx.p1.parsed.y;
              if (val > 25) return `${COLORS.red}33`; // 33 = ~20% opacité
              if (val < 20) return `${COLORS.blue}33`;
              return `${COLORS.green}33`;
          }
        },
        // -------------------------------------------------------------------
        
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        // Couleur de bordure dynamique au survol
        pointBorderColor: (context: any) => {
            const val = context.raw;
            if (val === null) return COLORS.green; // Fallback
            return getColor(val);
        },
        pointBorderWidth: 2,
        borderWidth: 2,
        spanGaps: false,
      },
    ],
  };

  const options: any = {
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
          label: (context: any) => {
              if (context.parsed.y === null) return '';
              return `${context.parsed.y.toFixed(1)}°C`;
          },
          labelColor: (context: any) => {
              const val = context.raw;
              if (val === null) return { borderColor: COLORS.green, backgroundColor: COLORS.green };
              
              return {
                  borderColor: getColor(val),
                  backgroundColor: getColor(val)
              };
          }
        },
      },
      annotation: {
        annotations: currentHour !== null && currentHour !== undefined ? {
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
              font: {
                size: 10,
                weight: 'bold'
              },
              yAdjust: 0,
            },
          }
        } : {}
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: false,
          maxTicksLimit: 24,
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
