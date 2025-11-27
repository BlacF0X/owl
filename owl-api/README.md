# **Project OwL - API Backend**

Ceci est le README pour l'API Backend du Project OwL, construite avec [Node.js](https://nodejs.org), [Express](https://expressjs.com) et [TypeScript](https://www.typescriptlang.org). Ce document contient les instructions pour configurer et lancer le serveur dans un environnement de développement local.

---

## **Démarrage**

Cette section vous guidera pour mettre en place l'environnement de développement. Ce projet utilise [Doppler](https://doppler.com) pour gérer les variables d'environnement de manière sécurisée (Base de données, Clés API, etc.).

### Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre machine :

- [Node.js](https://nodejs.org) (v20 ou supérieure recommandée)
- [npm](https://www.npmjs.com) ou [yarn](https://yarnpkg.com)
- L'interface de commande (CLI) de [Doppler](https://docs.doppler.com/reference/install-cli)

### Installation

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/your-repo/owl-api-ts.git
   cd owl-api-ts
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

   Suivez les instructions interactives pour sélectionner le projet `owl-api` et la configuration `dev`.

4. **Lancer le serveur de développement :**
   Pour lancer l'API, vous devez utiliser la commande `npm run dev`. Cela va exécuter `doppler run -- tsx watch src/index.ts` qui injecte les secrets et lance le serveur avec rechargement automatique (hot-reload).

   ```bash
   npm run dev
   # ou
   # yarn dev
   ```

5. **Accéder à l'API et à la Documentation :**
   Le serveur démarrera par défaut sur le port **8080**.
   - **URL de base :** [http://localhost:8080](http://localhost:8080)
   - **Documentation Swagger :** [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

   Vous pouvez utiliser l'interface Swagger pour visualiser les routes disponibles et tester les endpoints directement depuis votre navigateur.

---

## **Tester les Endpoints**

Pour tester l'API, vous avez deux options recommandées :

1. **Swagger UI :** Accessible via `/api-docs`, c'est l'interface visuelle idéale pour découvrir l'API.
2. **Fichier `requests.http` :** Si vous utilisez VS Code, vous pouvez installer l'extension "REST Client" et utiliser le fichier `requests.http` présent à la racine du projet pour lancer des requêtes directement depuis votre éditeur.

## **Base de Données**

Ce projet utilise **TypeORM** connecté à une base de données **PostgreSQL** (Supabase).
Le schéma de la base de données est géré via des entités TypeScript situées dans `src/entities`.

> **Note :** La synchronisation automatique (`synchronize`) est désactivée par sécurité.
