'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { LayoutDashboard, DoorOpen, Wind, CloudSun, Thermometer, Router } from 'lucide-react';

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
  // Température géré manuellement
  { name: "Capteurs d'humidité", href: '/dashboard/humidity-sensors', icon: Wind },
  { name: 'Capteurs de CO2', href: '/dashboard/co2-sensors', icon: CloudSun },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentHubId = searchParams.get('hubId');

  const { getToken } = useAuth();
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // ✅ Ferme automatiquement le menu si on quitte la page température
  useEffect(() => {
    if (pathname !== '/dashboard/temperatures-datas') {
      setIsMenuOpen(false);
    }
  }, [pathname]);

  const isTempActive = pathname === '/dashboard/temperatures-datas';

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col bg-white shadow-lg md:flex z-20">
      <nav className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        <div>
          <h3 className="mb-2 px-2 text-xs font-bold uppercase text-slate-400">Général</h3>
          <ul className="space-y-1">
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

            {/* ✅ Onglet Température */}
            <li className="group relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors w-full text-left ${
                  isTempActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Thermometer className="h-5 w-5 flex-shrink-0" />
                <span className="truncate flex-1">Température</span>
              </button>

              {/* Menu Déroulant */}
              {hubs.length > 0 && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isMenuOpen ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
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
                            href={`/dashboard/temperatures-datas?hubId=${hub.id}`}
                            className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                              currentHubId === hub.id
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
                        className={`block px-3 py-2 text-xs text-center border-t border-slate-200 transition-colors ${
                          !currentHubId
                            ? 'font-bold text-slate-800 bg-slate-100'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Voir tous les Hubs confondus
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </li>

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
