import React from 'react';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>OwL.</div>
      <ul className={styles.navLinks}>
        <li>
          <a href="#home">Accueil</a>
        </li>
        <li>
          <a href="#mySpace">Mon espace</a>
        </li>
        <li>
          <a href="#tips">Astuces</a>
        </li>
        <li>
          <a href="/connexion" className={styles.connection}>
            Se connecter
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
