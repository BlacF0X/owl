import React from 'react'
import '../styles/Features.css'

function Feature() {
  return (
    <section className="features" id="features">
      <div className="team-section">
        <p>Une équipe de six développeurs motivés !</p>
        <div className="team-lists">
          <ul>
            <li><strong>Arno Stärkel</strong> - développeur backend</li>
            <li><strong>Clément Vier</strong> - développeur fullstack</li>
            <li><strong>Corentin Mertens</strong> - développeur électronique</li>
          </ul>
          <ul>
            <li><strong>Liam Gérard</strong> - développeur frontend</li>
            <li><strong>Lucas Bretenstein</strong> - développeur backend</li>
            <li><strong>Martin Stocq</strong> - développeur frontend</li>
          </ul>
        </div>
      </div>

      <h2>Fonctionnalités clés</h2>
      <div className="features-grid">
        <div className="feature-card">
          <img src="https://placehold.co/100" alt="feature 1" />
          <h3>Capteurs intelligents</h3>
          <p>Des données précises en temps réel.</p>
        </div>
        <div className="feature-card">
          <img src="https://placehold.co/100" alt="feature 2" />
          <h3>Alertes personnalisées</h3>
          <p>Recevez des notifications en cas de changement.</p>
        </div>
        <div className="feature-card">
          <img src="https://placehold.co/100" alt="feature 3" />
          <h3>Interface simple</h3>
          <p>Des graphiques clairs et intuitifs.</p>
        </div>
      </div>
    </section>
  )
}

export default Feature
