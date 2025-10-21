import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
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
          <Navbar />
          <main>{children}</main> {/* Le contenu de la page sera inséré ici */}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
