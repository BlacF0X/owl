import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Chemin vers votre app Next.js pour charger next.config.js et les fichiers .env
  dir: './',
});

// Configuration personnalisée de Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Configuration pour gérer les alias de chemin (@/...)
  moduleNameMapper: {
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
  },
  // Configuration optionnelle : fichier de setup à exécuter avant chaque test
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts', // Ignorer les fichiers de déclaration
    '!**/node_modules/**',
  ],
};

// createJestConfig est exporté de cette façon pour s'assurer que next/jest peut charger la config Next.js async
export default createJestConfig(config);
