import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '@/styles/App.css';
import '@/styles/Navbar.css';
import '@/styles/Footer.css';
import '@/styles/Home.css';

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
    <html lang="fr">
      <body>
        <Navbar />
        <main>{children}</main> {/* Le contenu de la page sera inséré ici */}
        <Footer />
      </body>
    </html>
  );
}
