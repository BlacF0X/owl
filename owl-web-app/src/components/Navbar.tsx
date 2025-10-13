import React from 'react';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="logo">OwL.</div>
      <ul className="nav-links">
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
          <a href="#contact" className="connection">
            Se connecter
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
