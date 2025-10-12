import React from 'react';
import '../styles/Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-text">
        <h2>Surveillez l'environnement en temps réel</h2>
        <p>Project OwL vous aide à mieux comprendre votre environnement grâce à des données précises.</p>
      </div>
    </section>
  );
};

export default Hero;