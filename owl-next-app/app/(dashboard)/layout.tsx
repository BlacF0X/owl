import Navbar from '@/components/Navbar';
import React from 'react';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Structure verticale qui remplit la hauteur de l'écran
    <div className="flex h-screen flex-col bg-slate-100">
      {/* La Navbar est maintenant incluse en haut */}
      <Navbar />

      {/* Le conteneur pour le reste du dashboard prend tout l'espace vertical restant */}
      <main className="flex-1 overflow-hidden">
        {/* Le 'children' sera le layout avec la sidebar et le contenu principal */}
        {children}
      </main>
    </div>
  );
}
