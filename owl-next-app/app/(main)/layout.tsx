import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}
