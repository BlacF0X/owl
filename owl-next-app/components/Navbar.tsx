'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const pathname = usePathname();

  // Effet pour fermer le menu lorsque le chemin (pathname) change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>OwL.</div>

      <div className={styles.hamburger} onClick={toggleMenu}>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </div>

      <ul className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
        <li>
          <Link href="/">Accueil</Link>
        </li>
        <li>
          <Link href="/dashboard">Mon espace</Link>
        </li>
        <li>
          <Link href="#tips">Astuces</Link>
        </li>
        <SignedIn>
          <li>
            <UserButton />
          </li>
        </SignedIn>
        <SignedOut>
          <li>
            <Link href="/inscription">S&apos;inscrire</Link>
          </li>
          <li>
            <Link href="/connexion" className={styles.connection}>
              Se connecter
            </Link>
          </li>
        </SignedOut>
      </ul>
    </nav>
  );
};

export default Navbar;
