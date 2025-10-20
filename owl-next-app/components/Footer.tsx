import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <section className={styles.stats} id="stats">
      <h2>À propos de nous</h2>
      <div className="stats-grid">
        <div className={styles.stat}>
          <h3>📧</h3>
          <p>OwlProject@gmail.com</p>
        </div>
        <div className={styles.stat}>
          <h3>📞</h3>
          <p>+32 400/12.34.56</p>
        </div>
        <div className={styles.stat}>
          <h3>📍</h3>
          <p>Louvain-la-Neuve, Belgique</p>
        </div>
      </div>
    </section>
  );
};

export default Footer;
