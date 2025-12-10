import React from 'react';
import Image from 'next/image';
import heroBackgroundImg from '@/public/hero-background.jpg';
import co2SensorImg from '@/public/co2_sensor.jpg';
import windowSensorImg from '@/public/window_sensor.jpg';
import hubImg from '@/public/hub.jpg';

const Home: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-cover bg-center text-white h-[60vh] min-h-[500px]">
        {/* Background Image */}
        <Image
          src={heroBackgroundImg}
          alt="Intérieur d'une maison moderne avec des fenêtres bien éclairées."
          fill
          priority
          quality={85}
          className="object-cover -z-10"
          placeholder="blur"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
        {/* Content */}
        <div className="relative flex h-full items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Surveillez l'environnement en temps réel
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-200 md:text-xl">
              Project OwL vous aide à mieux comprendre votre environnement grâce à des données
              précises.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-16 text-center sm:py-24" id="features">
        <div className="mx-auto mb-16 max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6 sm:text-4xl">
            Que proposons-nous?
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            Notre solution connectée surveille en continu l’état des fenêtres et la qualité de l’air
            de vos espaces grâce à des capteurs discrets et précis. Le système prévient les oublis
            de fenêtres ouvertes, mesure le CO₂, la température et l’humidité, pour préserver votre
            confort, votre santé et réduire le gaspillage énergétique. Profitez d’un environnement
            intérieur sain et optimisé, tout en réalisant des économies d’énergie chaque jour.
          </p>
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Composants clés</h2>

          {/* Features Grid */}
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
            {/* Card 1: Boitier Central */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mx-auto mb-6 flex h-32 w-auto items-center justify-center overflow-hidden rounded-lg">
                <Image
                  src={hubImg}
                  alt="Boitier central du projet OwL"
                  className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Boitier central</h3>
              <p className="mt-4 text-slate-600">Aperçu du retour des différents capteurs.</p>
            </div>

            {/* Card 2: Capteurs Fenêtres */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mx-auto mb-6 flex h-32 w-auto items-center justify-center overflow-hidden rounded-lg">
                <Image
                  src={windowSensorImg}
                  alt="Capteurs pour fenêtres"
                  className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Capteurs pour fenêtres</h3>
              <p className="mt-4 text-slate-600">Détectent l'état d'ouverture des fenêtres.</p>
            </div>

            {/* Card 3: Capteur CO2 */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="mx-auto mb-6 flex h-32 w-auto items-center justify-center overflow-hidden rounded-lg">
                <Image
                  src={co2SensorImg}
                  alt="Capteur de CO2 et qualité d'air"
                  className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Capteur de qualité d'air</h3>
              <p className="mt-4 text-slate-600">Analyse le CO₂, la température et l'humidité.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
