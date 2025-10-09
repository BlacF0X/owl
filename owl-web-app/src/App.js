import React from 'react'
import './styles/App.css'

// Importation des composants
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Feature from './components/Feature'
import Stats from './components/Stats'

// Importation des pages
import HomePage from './Pages/HomePage'

function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <HomePage />
      <Feature />
      <Stats />
    </div>
  )
}

export default App
