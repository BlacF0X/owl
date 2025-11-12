import React from 'react';
import Image from 'next/image';
import owl from '@/public/owl.png';
import heroBackground from '@/public/hero-background.jpg';

const Home: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-cover bg-center text-white">
        {/* Background Image */}
        <Image
          src={heroBackground}
          alt="Intérieur d'une maison moderne avec des fenêtres bien éclairées."
          fill
          priority
          quality={75}
          className="object-cover -z-10"
          placeholder="blur"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40"></div>
        {/* Content */}
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold sm:text-5xl">
            Surveillez l'environnement en temps réel
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-200">
            Project OwL vous aide à mieux comprendre votre environnement grâce à des données
            précises.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-16 text-center sm:py-20" id="features">
        <div className="mx-auto mb-12 max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Que proposons-nous?</h1>
          <p className="mt-2 text-slate-600">
            Notre solution connectée surveille en continu l’état des fenêtres et la qualité de l’air
            de vos espaces grâce à des capteurs discrets et précis. Le système prévient les oublis
            de fenêtres ouvertes, mesure le CO₂, la température et l’humidité, pour préserver votre
            confort, votre santé et réduire le gaspillage énergétique. Profitez d’un environnement
            intérieur sain et optimisé, tout en réalisant des économies d’énergie chaque jour.
          </p>
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900">Composants clés</h2>

          {/* Features Grid */}
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group overflow-hidden rounded-lg bg-white p-8 text-center shadow-md">
              <Image
                src={owl}
                alt="Boitier central du projet OwL"
                className="mx-auto mb-6 h-24 w-auto transition-transform duration-300 group-hover:scale-110"
              />
              <h3 className="text-xl font-semibold">Boitier central</h3>
              <p className="mt-2 text-slate-600">Aperçu du retour des différents capteurs.</p>
            </div>
            <div className="group overflow-hidden rounded-lg bg-white p-8 text-center shadow-md">
              <Image
                src={owl}
                alt="Capteurs pour fenêtres"
                className="mx-auto mb-6 h-24 w-auto transition-transform duration-300 group-hover:scale-110"
              />
              <h3 className="text-xl font-semibold">Capteurs pour fenêtres</h3>
              <p className="mt-2 text-slate-600">Détectent l'état des fenêtres.</p>
            </div>
            <div className="group overflow-hidden rounded-lg bg-white p-8 text-center shadow-md">
              <Image
                src={owl}
                alt="Capteur de CO2"
                className="mx-auto mb-6 h-24 w-auto transition-transform duration-300 group-hover:scale-110"
              />
              <h3 className="text-xl font-semibold">Capteur de CO2</h3>
              <p className="mt-2 text-slate-600">Analyse la qualité de l'air.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
