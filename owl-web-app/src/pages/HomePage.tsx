import React from 'react';
import '../styles/App.css';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <header className="header">
        <div className="header-content">
          <h1>Bienvenue sur Project OwL</h1>
          <p>Une solution intelligente pour surveiller et améliorer votre environnement.</p>
        </div>
      </header>
    </div>
  );
};

export default HomePage;
