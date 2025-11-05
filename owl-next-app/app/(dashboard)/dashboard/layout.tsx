import DashboardSidebar from '@/components/DashboardSidebar';
import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // Utilise h-full pour remplir la hauteur du parent (qui est h-screen)
    <div className="flex h-full">
      <DashboardSidebar />
      {/* La zone de contenu principale est maintenant la seule partie qui peut défiler */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
