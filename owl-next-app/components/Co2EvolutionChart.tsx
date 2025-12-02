import React from 'react';
import { BarChart2 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { EvolutionData } from './Co2Types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface EvolutionChartProps {
  data: EvolutionData[];
  loading: boolean;
  titleSuffix?: string;
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ data, loading, titleSuffix }) => {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 13, family: 'Inter, sans-serif' },
        bodyFont: { size: 13, weight: 'bold', family: 'Inter, sans-serif' },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.raw} ppm`,
          title: (items) => `Heure : ${items[0].label}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 2000,
        border: { display: false },
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 }, color: '#64748b', padding: 10 },
      },
      x: {
        type: 'category',
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: '#64748b',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
    },
    animation: { duration: 600, easing: 'easeOutQuart' },
  };

  const chartData = {
    labels: data.map((d) => d.hour),
    datasets: [
      {
        label: 'CO2 (ppm)',
        data: data.map((d) => d.ppm),
        backgroundColor: data.map((d) => {
          if (d.ppm > 1200) return '#f43f5e';
          if (d.ppm > 800) return '#f59e0b';
          return '#10b981';
        }),
        borderRadius: 4,
        barThickness: 'flex' as const,
        maxBarThickness: 32,
      },
    ],
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 text-blue-600">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Évolution 24h</h2>
            {titleSuffix && (
              <p className="text-xs font-medium text-slate-500 mt-0.5">{titleSuffix}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-3 text-xs text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> &lt; 800
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> 800-1200
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> &gt; 1200
          </div>
        </div>
      </div>

      <div className="relative flex-1 w-full min-h-[320px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px] z-10 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-sm font-medium text-slate-500">Chargement des données...</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200">
            <BarChart2 className="h-10 w-10 mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-400">Aucune donnée récente</p>
          </div>
        ) : (
          <Bar options={options} data={chartData} />
        )}
      </div>
    </div>
  );
};
