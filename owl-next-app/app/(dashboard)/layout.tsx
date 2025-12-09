import DashboardSidebar from '@/components/DashboardSidebar';
import Navbar from '@/components/Navbar';
import MobileMenu from '@/components/MobileMenu'; // Import du nouveau composant
import { UserButton } from '@clerk/nextjs'; // Nécessaire pour le header mobile
import React from 'react';

export const dynamic = 'force-dynamic';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-slate-100">
      
      {/* 1. HEADER MOBILE (Visible uniquement sur mobile) */}
      <div className="md:hidden flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
         <div className="flex items-center gap-3">
             <MobileMenu /> {/* Le bouton Hamburger */}
             <span className="text-lg font-bold text-slate-900">OwL.</span>
         </div>
         <UserButton afterSignOutUrl="/connexion" />
      </div>

      {/* 2. NAVBAR DESKTOP (Visible uniquement sur Desktop) */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Conteneur principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Desktop only par défaut grâce à ses classes CSS) */}
        <DashboardSidebar />
        
        {/* Zone de contenu */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
