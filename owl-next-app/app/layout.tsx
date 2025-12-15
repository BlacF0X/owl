import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

import { Ubuntu } from 'next/font/google';

const ubuntu = Ubuntu({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-ubuntu',
  display: 'swap',
});

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
        <head>
          <link rel="preconnect" href="https://img.clerk.com" />
          <link
            rel="preconnect"
            href="https://stirring-hyena-89.accounts.dev"
            crossOrigin="anonymous"
          />
          <link rel="preconnect" href="https://ws-eu.pusher.com" />
          <link rel="preconnect" href="https://sockjs-eu.pusher.com" />
        </head>
        <body className={`${ubuntu.variable} font-sans antialiased`}>
          {children}
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
