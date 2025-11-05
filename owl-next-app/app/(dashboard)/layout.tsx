import React from 'react';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  // Ce layout s'applique à toutes les routes du groupe (dashboard).
  // Il définit la base pour une expérience plein écran.
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100">
      {children}
    </div>
  );
}
