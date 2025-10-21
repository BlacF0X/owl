import React from 'react';
import styles from './Navbar.module.css';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>OwL.</div>
      <ul className={styles.navLinks}>
        <li>
          <a href="/home">Accueil</a>
        </li>
        <li>
          <a href="/dashboard">Mon espace</a>
        </li>
        <li>
          <a href="#tips">Astuces</a>
        </li>
        <SignedIn>
          <li>
            <UserButton />
          </li>
        </SignedIn>
        <SignedOut>
          <li>
            <Link href="/inscription">S'inscrire</Link>
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
