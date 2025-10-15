import React from 'react';
import './styles/App.css';

// Importation des pages
import HomePage from './pages/HomePage';

// Importation des composants
import Navbar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';


const App: React.FC = () => {
  return (
    <div className="App">
      <Navbar />
      <Home />
      <HomePage />
      <Footer />
    </div>
  );
};

export default App;
