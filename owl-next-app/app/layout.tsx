import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { PusherProvider } from '@/components/providers/PusherProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project OwL',
  description: "Surveillez l'environnement en temps réel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr">
        <body>
          <PusherProvider>
            {children}
            <SpeedInsights />
          </PusherProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
