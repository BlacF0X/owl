import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from "@clerk/localizations";
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
