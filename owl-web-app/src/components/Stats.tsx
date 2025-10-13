import React from 'react';
import '../styles/Stats.css';

const Stats: React.FC = () => {
  return (
    <section className="stats" id="stats">
      <h2>À propos de nous</h2>
      <div className="stats-grid">
        <div className="stat">
          <h3>120 000</h3>
          <p>Utilisateurs dans le monde</p>
        </div>
        <div className="stat">
          <h3>⭐⭐⭐⭐/5</h3>
          <p>Selon nos clients</p>
        </div>
        <div className="stat">
          <h3>24/7</h3>
          <p>Surveillance en continu</p>
        </div>
      </div>
    </section>
  );
};

export default Stats;
