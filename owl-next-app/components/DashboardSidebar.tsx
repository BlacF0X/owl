'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  LayoutDashboard,
  DoorOpen,
  Wind,
  CloudSun,
  Thermometer,
  Router,
} from 'lucide-react';

interface TempSensor {
  sensor_id: string;
  hub: {
    hub_id: string;
    name: string;
  };
}

interface Hub {
  id: string;
  name: string;
}

const navLinks = [
  { name: 'Général', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Capteurs de fenêtre', href: '/dashboard/windows', icon: DoorOpen },
  // Température est géré manuellement
  { name: "Qualité de l'air", href: '/dashboard/humidity-sensors', icon: Wind },
  { name: 'Capteurs de CO2', href: '/dashboard/co2-sensors', icon: CloudSun },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const { getToken } = useAuth();
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchHubs = async () => {
      try {
        const token = await getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const res = await fetch(`${apiUrl}/api/temperature`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const sensors: TempSensor[] = await res.json();
          const uniqueHubsMap = new Map<string, string>();

          sensors.forEach((sensor) => {
            if (sensor.hub && !uniqueHubsMap.has(sensor.hub.hub_id)) {
              uniqueHubsMap.set(sensor.hub.hub_id, sensor.hub.name);
            }
          });

          setHubs(
            Array.from(uniqueHubsMap.entries()).map(([id, name]) => ({
              id,
              name,
            }))
          );
        }
      } catch (error) {
        console.error('Erreur chargement hubs sidebar:', error);
      }
    };

    fetchHubs();
  }, [getToken]);

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col bg-white shadow-lg md:flex">
      <nav className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        <div>
          <h3 className="mb-2 px-2 text-xs font-bold uppercase text-slate-400">Général</h3>
          <ul className="space-y-1">
            {/* Liens avant Température */}
            {navLinks.slice(0, 2).map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    pathname === link.href
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}

            {/* Onglet Température */}
            <li
              className="group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* 
                  MODIFICATION ICI :
                  J'ai retiré la condition `isTempActive ? ...`
                  L'onglet utilise maintenant TOUJOURS le style standard (gris)
              */}
              <Link
                href="/dashboard/temperatures-datas"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Thermometer className="h-5 w-5" />
                <span>Température</span>
              </Link>

              {/* Menu déroulant */}
              {hubs.length > 0 && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isHovered ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
                  }`}
                >
                  <div className="ml-4">
                    <div className="bg-slate-50 rounded-md border border-slate-200 shadow-sm overflow-hidden">
                      <p className="px-3 py-2 text-[10px] font-bold uppercase text-slate-400 tracking-wider border-b border-slate-100">
                        Sélectionner un hub
                      </p>
                      <div className="max-h-40 overflow-y-auto">
                        {hubs.map((hub) => (
                          <Link
                            key={hub.id}
                            href={`/dashboard/temperatures-datas/${hub.id}`}
                            className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                              pathname.includes(hub.id)
                                ? 'font-bold text-blue-600 bg-blue-50'
                                : 'text-slate-600'
                            }`}
                          >
                            <Router className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{hub.name}</span>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/dashboard/temperatures-datas"
                        className="block px-3 py-2 text-xs text-center text-slate-400 hover:text-slate-600 border-t border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        Voir tous les hubs
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </li>

            {/* Liens après Température */}
            {navLinks.slice(2).map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    pathname === link.href
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="flex-shrink-0 border-t p-4">
        <p className="text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Project OwL Inc.
        </p>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
