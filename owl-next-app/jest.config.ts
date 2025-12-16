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

  // ✅ AJOUTÉ : Fichier de setup pour les tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Configuration pour gérer les alias de chemin (@/...)
  moduleNameMapper: {
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/(.*)$': '<rootDir>/$1', // ✅ AJOUTÉ : Support @/ global
  },

  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!components/**/*.d.ts', // ✅ AJOUTÉ
    '!components/**/*.stories.{js,jsx,ts,tsx}', // ✅ AJOUTÉ
    '!**/node_modules/**',
  ],

  // ✅ AJOUTÉ : Seuils de couverture
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

// createJestConfig est exporté de cette façon pour s'assurer que next/jest peut charger la config Next.js async
export default createJestConfig(config);
