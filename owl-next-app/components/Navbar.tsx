'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-white px-4 py-3 shadow-md sm:px-6">
      <div className="text-3xl font-extrabold text-slate-900">
        <Link href="/">OwL.</Link>
      </div>

      <div className="md:hidden">
        <button onClick={toggleMenu} className="flex flex-col gap-1.5">
          <span className="block h-0.5 w-6 bg-slate-900"></span>
          <span className="block h-0.5 w-6 bg-slate-900"></span>
          <span className="block h-0.5 w-6 bg-slate-900"></span>
        </button>
      </div>

      <div
        className={`
          absolute left-0 top-full w-full bg-white transition-transform duration-300 ease-in-out md:static md:w-auto md:transform-none
          ${isMenuOpen ? 'translate-y-0' : '-translate-y-[150%] md:translate-y-0'}
        `}
      >
        <ul className="flex flex-col items-center gap-6 p-8 md:flex-row md:p-0">
          <li>
            <Link href="/" className="font-semibold text-slate-700 hover:text-slate-900">
              Accueil
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="font-semibold text-slate-700 hover:text-slate-900">
              Mon espace
            </Link>
          </li>
          <li>
            <Link href="/astuces" className="font-semibold text-slate-700 hover:text-slate-900">
              Astuces
            </Link>
          </li>
          <SignedIn>
            <li>
              <UserButton />
            </li>
          </SignedIn>
          <SignedOut>
            <li>
              <Link
                href="/inscription"
                className="font-semibold text-slate-700 hover:text-slate-900"
              >
                S'inscrire
              </Link>
            </li>
            <li>
              <Link
                href="/connexion"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-700"
              >
                Se connecter
              </Link>
            </li>
          </SignedOut>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
