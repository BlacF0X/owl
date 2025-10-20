import React from 'react';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>OwL.</div>
      {/* Remarque : les classes avec des tirets comme "nav-links"
          deviennent camelCase : styles.navLinks */}
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
          <a href="#logIn" className={styles.connection}>
            Se connecter
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
