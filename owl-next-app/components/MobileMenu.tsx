'use client';

import { useState, useEffect } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  DoorOpen,
  Wind,
  Thermometer,
  Router,
  ChevronDown,
  ChevronUp,
  Droplets,
  Home,
  User,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

interface TempSensor {
  sensor_id: string;
  hub: { hub_id: string; name: string };
}
interface Hub {
  id: string;
  name: string;
}

const sidebarLinks = [
  { name: 'Général', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Fenêtres', href: '/dashboard/windows', icon: DoorOpen },
  { name: 'Humidité', href: '/dashboard/humidity-sensors', icon: Droplets },
  { name: 'CO2', href: '/dashboard/co2-sensors', icon: Wind },
];

// Liens de ta Navbar du haut (Accueil, Mon espace, Astuces)
const topNavbarLinks = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Mon espace', href: '/dashboard', icon: User },
  { name: 'Astuces', href: '/astuces', icon: HelpCircle },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTempOpen, setIsTempOpen] = useState(false);
  const [hubs, setHubs] = useState<Hub[]>([]);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentHubId = searchParams.get('hubId');
  const { getToken } = useAuth();

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
          sensors.forEach((s) => {
            if (s.hub && !uniqueHubsMap.has(s.hub.hub_id)) {
              uniqueHubsMap.set(s.hub.hub_id, s.hub.name);
            }
          });
          setHubs(Array.from(uniqueHubsMap.entries()).map(([id, name]) => ({ id, name })));
        }
      } catch (error) {
        console.error('Erreur hubs mobile:', error);
      }
    };
    if (isOpen && hubs.length === 0) fetchHubs();
  }, [isOpen, getToken, hubs.length]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-700 hover:bg-slate-100 rounded-md"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* EN-TÊTE DU MENU */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 bg-slate-50">
          <span className="text-xl font-bold text-slate-900">OwL.</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-500 hover:bg-slate-200 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {/* 1. LIENS "NAVBAR" (Accueil, Mon espace, Astuces) - EN HAUT */}
          <div className="mb-6 border-b border-slate-100 pb-4">
            <p className="px-4 text-xs font-bold uppercase text-slate-400 mb-2">Navigation</p>
            {topNavbarLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <link.icon className="h-4 w-4" /> <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* 2. LIENS "SIDEBAR" (Tableau de bord) */}
          <p className="px-4 text-xs font-bold uppercase text-slate-400 mb-2">Tableau de bord</p>
          <div className="space-y-1">
            {sidebarLinks.slice(0, 2).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${pathname === link.href ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <link.icon className="h-5 w-5" /> <span>{link.name}</span>
              </Link>
            ))}

            {/* TEMPÉRATURE */}
            <div>
              <button
                onClick={() => setIsTempOpen(!isTempOpen)}
                className={`w-full flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${pathname.includes('temperature') ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <Thermometer className="h-5 w-5" />
                  <span>Température</span>
                </div>
                {isTempOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isTempOpen && (
                <div className="ml-4 mt-1 border-l-2 border-slate-100 pl-4 space-y-1">
                  <Link
                    href="/dashboard/temperatures-datas"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 text-sm text-slate-500 hover:text-blue-600"
                  >
                    Tous les Hubs
                  </Link>
                  {hubs.map((hub) => (
                    <Link
                      key={hub.id}
                      href={`/dashboard/temperatures-datas?hubId=${hub.id}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2 py-2 text-sm ${currentHubId === hub.id ? 'font-bold text-blue-600' : 'text-slate-500'}`}
                    >
                      <Router className="h-3 w-3" /> {hub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {sidebarLinks.slice(2).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${pathname === link.href ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <link.icon className="h-5 w-5" /> <span>{link.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
