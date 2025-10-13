module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'jsx-a11y',
    'prettier'
  ],
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended' // Doit être la dernière extension
  ],
  rules: {
    // Vous pouvez ajouter ou surcharger des règles ici.
    // Par exemple, pour forcer les types explicites pour les retours de fonction :
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    // Règle de Prettier
    'prettier/prettier': 'warn'
  }
};