// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Fichiers à ignorer globalement
  {
    ignores: [
      'dist/', 
      'node_modules/',
    ],
  },

  // Configuration de base d'ESLint
  eslint.configs.recommended,

  // Configuration pour les fichiers TypeScript
  ...tseslint.configs.recommended,

  // Configuration pour désactiver les règles conflictuelles avec Prettier
  prettierConfig
];
