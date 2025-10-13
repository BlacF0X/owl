import React from 'react';
import './styles/App.css';

// Importation des pages
import HomePage from './pages/HomePage';

// Importation des composants
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Feature from './components/Feature';
import Stats from './components/Stats';

const App: React.FC = () => {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <HomePage />
      <Feature />
      <Stats />
    </div>
  );
};

export default App;
