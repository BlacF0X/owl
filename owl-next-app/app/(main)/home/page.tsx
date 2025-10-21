import React from 'react';
import Image from 'next/image';
import styles from './Home.module.css';

import owl from '@/public/owl.png';

const Home: React.FC = () => {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h2>Surveillez l'environnement en temps réel</h2>
          <p>
            Project OwL vous aide à mieux comprendre votre environnement grâce à des données
            précises.
          </p>
        </div>
      </section>

      <section className={styles.features} id="features">
        <div className={styles.teamSection}>
          <p>Une équipe de six développeurs motivés !</p>
          <div className={styles.teamLists}>
            <ul>
              <li>
                <strong>Arno Stärkel</strong> - développeur backend
              </li>

              <li>
                <strong>Clément Vier</strong> - développeur fullstack
              </li>

              <li>
                <strong>Corentin Mertens</strong> - développeur électronique
              </li>
            </ul>

            <ul>
              <li>
                <strong>Liam Gérard</strong> - développeur frontend
              </li>

              <li>
                <strong>Lucas Bretenstein</strong> - développeur backend
              </li>

              <li>
                <strong>Martin Stocq</strong> - développeur frontend
              </li>
            </ul>
          </div>
        </div>

        <h2>
          <strong>Composants clés</strong>
        </h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <Image src={owl} alt="Boitier central du projet OwL" />
            <h3>Boitier central</h3>
            <p>Aperçu du retour des différents capteurs.</p>
          </div>

          <div className={styles.featureCard}>
            <Image src={owl} alt="Capteurs pour fenêtres" />
            <h3>Capteurs pour fenêtres</h3>
            <p>Détectent l'état des fenêtres.</p>
          </div>

          <div className={styles.featureCard}>
            <Image src={owl} alt="Capteur de CO2 pour la qualité de l'air" />
            <h3>Capteur de CO2</h3>
            <p>Analyse la qualité de l'air.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
