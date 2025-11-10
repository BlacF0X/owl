'use client';
import { Wind, Thermometer, Droplets, DoorOpen, AlarmCheck, CloudSun } from 'lucide-react';
import React from 'react';

const astuces = [
  {
    id: 1,
    icon: <AlarmCheck className="h-7 w-7 text-slate-500 mb-2" />,
    title: 'Maintenez le CO₂ sous 900 ppm',
    description:
      "Une bonne qualité de l'air contribue à votre bien-être et votre concentration. Lorsque le CO₂ dépasse 900 ppm, pensez à aérer la pièce.",
  },
  {
    id: 2,
    icon: <Wind className="h-7 w-7 text-slate-500 mb-2" />,
    title: 'Aérez efficacement',
    description:
      "Ouvrez grand vos fenêtres 5 à 10 minutes pour renouveler l'air, de préférence matin et soir. Cela limite les pertes thermiques tout en améliorant l'air intérieur.",
  },
  {
    id: 3,
    icon: <Thermometer className="h-7 w-7 text-slate-500 mb-2" />,
    title: 'Température idéale',
    description:
      'Gardez la température à 19-21°C dans les pièces de vie, 16°C dans les chambres, pour un confort sain et économique.',
  },
  {
    id: 4,
    icon: <Droplets className="h-7 w-7 text-slate-500 mb-2" />,
    title: "Surveillez l'humidité",
    description:
      'Le taux d’humidité idéal se situe entre 40 % et 60 %. Une aération ponctuelle empêche la formation de moisissures et améliore le confort.',
  },
  {
    id: 5,
    icon: <CloudSun className="h-7 w-7 text-slate-500 mb-2" />,
    title: "Profitez de l'air sec",
    description:
      'Un air moins humide se chauffe plus vite : aérez après les douches ou la cuisine pour évacuer l’excès d’humidité.',
  },
  {
    id: 6,
    icon: <DoorOpen className="h-7 w-7 text-slate-500 mb-2" />,
    title: 'Fenêtre entrouverte = déperdition',
    description:
      'Évitez de laisser une fenêtre ouverte en oscillo-battant longtemps : ouvrez plutôt en grand sur un temps court.',
  },
];

export default function Astuces() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-2">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-12 text-center">
          Astuces pour un air sain et éco-responsable
        </h1>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {astuces.map((astuce) => (
            <li
              key={astuce.id}
              className="rounded-2xl shadow-sm border bg-white p-7 flex flex-col items-start hover:shadow-lg transition-shadow duration-200"
            >
              {astuce.icon}
              <h2 className="mt-1 mb-2 font-semibold text-lg text-slate-800">{astuce.title}</h2>
              <p className="text-slate-600 text-base">{astuce.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
