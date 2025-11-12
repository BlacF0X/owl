// Chemin : app/(dashboard)/layout.tsx

import DashboardSidebar from '@/components/DashboardSidebar';
import Navbar from '@/components/Navbar';
import React from 'react';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Structure verticale sur toute la hauteur de l'écran
    <div className="flex h-screen flex-col bg-slate-100">
      <Navbar />

      {/* Conteneur principal qui combine la sidebar et le contenu */}
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        {/* La zone de contenu principale est maintenant la seule partie qui peut défiler */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
