# **Project OwL - Web Application**

This is the README for the Project OwL web application, built with [Next.js](https://nextjs.org). This document contains instructions for setting up and running the project in a local development environment.

---

## **Démarrage**

Cette section vous guidera pour mettre en place l'environnement de développement. Ce projet utilise [Doppler](https://doppler.com) pour gérer les variables d'environnement de manière sécurisée.

### Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre machine :

- [Node.js](https://nodejs.org) (v20 ou supérieure recommandée)
- [npm](https://www.npmjs.com) ou [yarn](https://yarnpkg.com)
- L'interface de commande (CLI) de [Doppler](https://docs.doppler.com/reference/install-cli)

### Installation

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/your-repo/owl-next-app.git
   cd owl-next-app
   ```

2. **Installer les dépendances du projet :**

   ```bash
   npm install
   # ou
   # yarn install
   ```

3. **Se connecter à Doppler pour récupérer les variables d'environnement :**

   > Demander les informations de login à Clément [c.vier@students.ephec.be](mailto:c.vier@students.ephec.be)

   ```bash
   # Ceci ouvrira une fenêtre de navigateur pour vous authentifier
   doppler login

   # Ceci liera votre dossier local au projet distant sur Doppler
   doppler setup
   ```

   Suivez les instructions interactives pour sélectionner le fichier de configuration (`doppler.yaml`).

4. **Lancer le serveur de développement :**
   Pour lancer l'application, vous devez utiliser la commande `npm run dev`, cela va exécuter `doppler run -- next dev --turbopack` qui injecte les secrets dans l'environnement de l'application.

   ```bash
   npm run dev
   # ou
   # yarn dev
   ```

5. **Ouvrir l'application :**
   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir le résultat. La page se mettra à jour automatiquement à chaque modification des fichiers source.
