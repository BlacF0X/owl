import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
  // Section spécifique pour les fichiers de configuration en .cjs
  {
    files: ['**/*.cjs'], // Applique les règles suivantes uniquement aux fichiers .cjs
    rules: {
      '@typescript-eslint/no-require-imports': 'off', // Désactive la règle pour ces fichiers
      '@typescript-eslint/no-var-requires': 'off', // Désactive une règle similaire

      // Configure no-unused-vars pour ignorer les variables commençant par _
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];

export default eslintConfig;
