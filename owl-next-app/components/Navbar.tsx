import React from 'react';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>OwL.</div>
      {/* Remarque : les classes avec des tirets comme "nav-links"
          deviennent camelCase : styles.navLinks */}
      <ul className={styles['nav-links']}> 
        <li>
          <a href="#home">Accueil</a>
        </li>
        <li>
          <a href="#features">Astuces</a>
        </li>
        <li>
          <a href="#stats">Statistiques</a>
        </li>
        <li>
          <a href="#contact" className={styles.connection}>
            Se connecter
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;