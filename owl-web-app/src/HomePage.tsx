// HomePage.tsx
import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      {}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Project OwL</h1>
          <p>Une solution intelligente pour surveiller et améliorer votre environnement intérieur.</p>
          <a href="#about" className="cta-button">En savoir plus</a>
        </div>
      </header>

      {/* Section À Propos */}
      <section id="about" className="about-section">
        <div className="container">
          <h2>Description du Projet</h2>
          <div className="content-grid">
            <div className="text-content">
              <p>
                Notre projet consiste en plusieurs petits boîtiers qui servent à détecter si une fenêtre est ouverte ou fermée, ainsi qu’un boîtier principal chargé de recevoir et de traiter ces informations. L'ensemble des boîtiers et capteurs est appelé système OwL.
              </p>
              <p>
                L’objectif est de mieux gérer l’aération de nos intérieurs et d’optimiser la consommation d’énergie liée au chauffage. Pour cela, les boîtiers physiques seront reliés à un site web, permettant d’obtenir une vision centralisée de toutes les statistiques de l’infrastructure. Par exemple : la durée totale d’aération d’une pièce sur une journée.
              </p>
              <p>
                À partir de cette base, plusieurs évolutions sont envisageables : Ajout d’un capteur de température pour envoyer des alertes à l’utilisateur afin d’optimiser le système de chauffage. Ajout d’un capteur de qualité de l’air pour conseiller l’utilisateur sur les périodes d’aération optimales. Ajout d’un indicateur sur la porte du logement pour notifier l’utilisateur si une fenêtre est restée ouverte lors de son départ.
              </p>
            </div>
            <div className="mockup-placeholder">
              <h3>Maquettes et Schémas</h3>
             
              <img src="path/to/owl-drawio.png" alt="Schéma OwL" className="mockup-image" />
            </div>
          </div>
        </div>
      </section>

      {/* Section Objectifs et Valeur Ajoutée */}
      <section className="objectives-section">
        <div className="container">
          <h2>Objectif et Valeur Ajoutée</h2>
          <div className="content-wrapper">
            <p>
              L’objectif principal du projet est d’améliorer le confort des consommateurs tout en réduisant la consommation énergétique liée au chauffage. La valeur ajoutée réside dans :
            </p>
            <ul className="feature-list">
              <li>Une prise de décision plus intelligente concernant l’aération (ouvrir ou fermer les fenêtres aux bons moments).</li>
              <li>Une optimisation des coûts énergétiques, grâce à une meilleure gestion du chauffage et de la ventilation.</li>
              <li>Une possibilité d’intégrer facilement de nouveaux capteurs (température, qualité de l’air, humidité, etc.).</li>
              <li>Une dimension écologique, en réduisant le gaspillage d’énergie.</li>
            </ul>
           
            <p>
              Au-delà de l’aspect technologique, Project OwL s’inscrit dans une démarche durable. Il contribue à plusieurs Objectifs de Développement Durable (ODD) fixés par l’ONU :
            </p>
            <ul className="odds-list">
              <li><strong>ODD 3</strong> – Bonne santé et bien-être, en favorisant un air intérieur de meilleure qualité.</li>
              <li><strong>ODD 11</strong> – Villes et communautés durables, en participant à une gestion plus responsable des bâtiments.</li>
              <li><strong>ODD 12</strong> – Consommation et production responsables, en réduisant le gaspillage énergétique lié à une mauvaise aération.</li>
            </ul>
            <p>
              En combinant innovation technologique et engagement sociétal, Project OwL se positionne comme une solution moderne, pratique et durable pour améliorer la qualité de vie dans les environnements intérieurs.
            </p>
          </div>
        </div>
      </section>

      

      {/* Section Équipe */}
      <section className="team-section">
        <div className="container">
          <h2>Membres de l'Équipe</h2>
          <ul className="team-list">
            <li>Corentin Mertens</li>
            <li>Clément Vier</li>
            <li>Martin Stocq</li>
            <li>Liam Gérard</li>
            <li>Arno Stärkel</li>
            <li>Lucas Breitenstein</li>
          </ul>
        </div>
      </section>

      {/* Section Liens */}
      <section className="links-section">
        <div className="container">
          <h2>Liens Utiles</h2>
          <ul className="links-list">
            <li><a href="lien-vers-resume-activites" target="_blank" rel="noopener noreferrer">Résumé des Activités</a></li>
            <li><a href="lien-vers-application" target="_blank" rel="noopener noreferrer">L'Application</a></li>
            <li><a href="lien-vers-gestionnaire-sources" target="_blank" rel="noopener noreferrer">Gestionnaire de Sources</a></li>
            <li><a href="https://github.com/project-owl/tasks" target="_blank" rel="noopener noreferrer">Gestionnaire de Tâches (GitHub Project)</a></li>
            <li><a href="lien-vers-gestionnaire-temps" target="_blank" rel="noopener noreferrer">Gestionnaire de Temps</a></li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2023 Project OwL. Tous droits réservés.</p>
          <p>Dernière mise à jour : Il y a une semaine · 8 révisions</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
