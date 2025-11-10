import React from 'react';
import Image from 'next/image';

const teamMembers = [
  {
    name: 'Arno Stärkel',
    role: 'Développeur Backend',
    description:
      'Spécialisé dans le développement backend, Arno assure la robustesse et la performance de notre infrastructure.',
    image: 'AS', // Initiales en attendant la photo
  },
  {
    name: 'Clément Vier',
    role: 'Développeur Fullstack',
    description:
      "En tant que développeur fullstack, Clément apporte sa polyvalence et son expertise sur l'ensemble de notre stack technique.",
    image: 'CV',
  },
  {
    name: 'Corentin Mertens',
    role: 'Développeur Électronique',
    description: 'Expert en électronique, Corentin gère tous les aspects hardware de notre projet.',
    image: 'CM',
  },
  {
    name: 'Liam Gérard',
    role: 'Développeur Frontend',
    description:
      "Responsable de l'expérience utilisateur, Liam crée des interfaces intuitives et esthétiques.",
    image: '/Liam.jpg',
  },
  {
    name: 'Lucas Bretenstein',
    role: 'Développeur Backend',
    description:
      'Lucas assure la solidité de notre backend et optimise les performances de nos services.',
    image: 'LB',
  },
  {
    name: 'Martin Stocq',
    role: 'Développeur Frontend',
    description:
      "Martin travaille sur l'interface utilisateur pour offrir la meilleure expérience possible.",
    image: 'MS',
  },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Notre Équipe</h1>
      <p className="text-xl text-center mb-12">Une équipe de six développeurs motivés !</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="h-[300px] w-[300px] mx-auto perspective-[1000px] cursor-pointer group"
          >
            <div className="relative w-full h-full transition-transform duration-500 transform-style-preserve-3d group-hover:rotate-y-180">
              <div className="absolute w-full h-full backface-hidden rounded-xl bg-gray-800 flex flex-col items-center justify-center p-4 shadow-lg">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                  {member.image.endsWith('.jpg') || member.image.endsWith('.png') ? (
                    <Image
                      src={member.image}
                      alt={`Photo de ${member.name}`}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                      {member.image}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-gray-400">{member.role}</p>
              </div>

              <div className="absolute w-full h-full backface-hidden rounded-xl bg-gray-700 flex items-center justify-center p-6 text-white rotate-y-180 shadow-lg">
                <p className="text-center">{member.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
