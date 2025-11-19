'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
// Assurez-vous que toutes les icônes utilisées sont importées ici
import { LayoutDashboard, DoorOpen, Wind, CloudSun, Thermometer } from 'lucide-react';

// C'est la seule liste de liens que nous allons utiliser
const navLinks = [
  { name: 'Général', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Capteurs de fenêtre', href: '/dashboard/window-sensors', icon: DoorOpen },
  { name: 'Température', href: '/dashboard/temperatures-datas', icon: Thermometer },
  { name: "Qualité de l'air", href: '#', icon: Wind }, // Le lien est '#' car la page n'existe pas encore
  { name: 'Capteurs de CO2', href: '/dashboard/co2-sensors', icon: CloudSun },
];

const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col bg-white shadow-lg md:flex">
      <nav className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        <div>
          <h3 className="mb-2 px-2 text-xs font-bold uppercase text-slate-400">Général</h3>
          <ul className="space-y-1">
            {navLinks.map((link) => (
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
        <div>
          <h3 className="mb-2 px-2 text-xs font-bold uppercase text-slate-400">Support</h3>
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
