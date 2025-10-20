import React from 'react';
import styles from './Home.module.css';

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
            <img
              src="https://assistance.poolstar.fr/Upload/Catalog/4587/2378_large.jpg"
              alt="Boitier central"
            />
            <h3>Boitier central</h3>
            <p>Aperçu du retour des différents capteurs.</p>
          </div>

          <div className={styles.featureCard}>
            <img
              src="data:image/jpeg;base64,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"
              alt="Capteurs fenêtres"
            />
            <h3>Capteurs pour fenêtres</h3>
            <p>Détectent l'état des fenêtres.</p>
          </div>

          <div className={styles.featureCard}>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpsfgV9hnJB1zxjVFDjzS0hdDvWX_194IotA&s"
              alt="Capteur de CO2"
            />
            <h3>Capteur de CO2</h3>
            <p>Analyse la qualité de l'air.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
