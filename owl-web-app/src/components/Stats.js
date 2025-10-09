import React from 'react'
import '../styles/Stats.css'


function Stats() {
  return (
    <section className="stats" id="stats">
      <h2>Quelques chiffres</h2>
      <div className="stats-grid">
        <div className="stat">
          <h3>Concentration en CO2</h3>
          <p>950PPM</p>
          <img id='imgCO' src='https://actugeologique.fr/wp-content/uploads/2023/04/Concentration-en-CO2-b-1024x612.jpg'></img>
        </div>
        <div className="stat">
          <h3>98%</h3>
          <p>Précision moyenne</p>
        </div>
        <div className="stat">
          <h3>24/7</h3>
          <p>Surveillance en continu</p>
        </div>
      </div>
    </section>
  )
}

export default Stats
