'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Type pour les données reçues de l'API
interface HourlyStat {
  hour: number;
  count: number;
}

interface HourlyActivityChartProps {
  data: HourlyStat[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

export default function HourlyActivityChart({ data }: HourlyActivityChartProps) {
  // Formatage des données pour Recharts
  const chartData = data.map((item) => ({
    // On formatte l'heure pour l'affichage (0 -> "00h", 9 -> "09h")
    name: `${item.hour.toString().padStart(2, '0')}h`,
    count: item.count,
    originalHour: item.hour,
  }));

  // On détermine la valeur max pour ajuster l'échelle si besoin (optionnel)
  const maxCount = Math.max(...chartData.map((d) => d.count));

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-lg text-xs">
          <p className="font-bold text-slate-800">{label}</p>
          <p className="text-slate-600">
            <span className="font-semibold text-blue-600">{payload[0].value}</span> ouvertures
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full min-h-[200px]">
      {/* ResponsiveContainer permet au graphique de s'adapter à la largeur du parent */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#64748b' }} // text-slate-500
            axisLine={false}
            tickLine={false}
            interval={3} // Affiche une étiquette toutes les 4 heures (0h, 4h, 8h...) pour ne pas surcharger
          />
          <YAxis
            hide // On cache l'axe Y pour un design plus épuré
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]} // Coins arrondis en haut
          >
            {/* Coloration dynamique : Les barres avec beaucoup d'activité sont plus foncées */}
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.count > maxCount * 0.7 ? '#2563eb' : '#93c5fd'} // blue-600 vs blue-300
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
