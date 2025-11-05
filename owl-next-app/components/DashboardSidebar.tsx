'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

// ... (vos icônes SVG restent les mêmes)
const DashboardIcon = () => <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v4a1 1 0 11-2 0V4a1 1 0 011-1zM4 9a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 011-1zm12 0a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 011-1zm-6 2a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z" /></svg>;
const WindowIcon = () => <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm2 2v4h4V5H5zm6 0v4h4V5h-4zm-6 6v4h4v-4H5zm6 0v4h4v-4h-4z" clipRule="evenodd" /></svg>;
const AirQualityIcon = () => <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.5 5.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm4 2a.5.5 0 000 1h4a.5.5 0 000-1h-4zm-4 2a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5zm4 2a.5.5 0 000 1h2a.5.5 0 000-1h-2zM4 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;

const navLinks = [
  { name: 'Général', href: '/dashboard', icon: DashboardIcon },
  { name: 'Fenêtres', href: '#', icon: WindowIcon },
  { name: 'Qualité de l\'air', href: '#', icon: AirQualityIcon },
];

const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    // La hauteur est gérée par le conteneur flex parent (h-full)
    <aside className="hidden w-64 flex-shrink-0 flex-col bg-white shadow-lg md:flex"> 
      {/* La section nav prend l'espace restant et défile si besoin */}
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
                  <link.icon />
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
      {/* Le pied de page de la sidebar reste en bas */}
      <div className="flex-shrink-0 border-t p-4">
        <p className="text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Project OwL Inc.
        </p>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
