# Project OwL - API Backend

Bienvenue sur la documentation de l'API Backend du Project OwL. Construite avec Node.js, Express et TypeScript, cette application gère l'ingestion des données capteurs, la logique métier et la communication avec la base de données et les services tiers.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3-FE0803?style=for-the-badge&logo=typeorm)

---

## Stack Technique

- **Serveur** : Node.js & Express.
- **Langage** : TypeScript.
- **Base de données** : PostgreSQL (hébergé sur Supabase).
- **ORM** : TypeORM.
- **Temps Réel** : Pusher (WebSockets).
- **Authentification** : Clerk (Webhooks & Middleware).
- **Documentation** : Swagger (OpenAPI).
- **Qualité** : ESLint, Prettier.
- **Gestion des Secrets** : Doppler (optionnel).

---

## Démarrage Rapide

### Prérequis

- Node.js (v20+ recommandé).
- npm ou yarn.

### Installation

1. Cloner le dépôt et accéder au dossier :

   ```bash
   cd owl-api
   ```

2. Installer les dépendances :

   ```bash
   npm install
   ```

### Configuration des Variables d'Environnement

Vous avez deux options pour configurer les secrets du projet.

#### Option 1 : Via Doppler (Recommandé pour l'équipe)

Si vous avez accès au projet Doppler de l'équipe :

1. Authentifiez-vous :

   ```bash
   doppler login
   ```

2. Sélectionnez le projet `owl-api` et la configuration `dev` :

   ```bash
   doppler setup
   ```

3. Lancez le serveur (la commande injecte automatiquement les variables) :

   ```bash
   npm run dev
   ```

#### Option 2 : Via un fichier .env (Méthode manuelle)

Si vous n'utilisez pas Doppler, vous pouvez configurer les variables manuellement.

1. Dupliquez le fichier d'exemple présent à la racine :

   ```bash
   cp .env.example .env
   # Sur Windows : copy .env.example .env
   ```

2. Ouvrez le fichier `.env` et renseignez les valeurs pour la base de données, Clerk et Pusher.
3. Lancez le serveur de développement avec le script local :

   ```bash
   npm run dev:local
   ```

   > [!NOTE]
   > N'utilisez pas `npm run dev` dans ce cas, car cette commande est préconfigurée pour utiliser Doppler.*

Le serveur démarrera par défaut sur le port 8080.

- **API Root** : <http://localhost:8080/api>
- **Documentation** : <http://localhost:8080/api-docs>

---

## Structure du Projet

L'architecture suit une approche en couches (Controller-Service-Repository) adaptée à Express.

```text
owl-api/
├── scripts/            # Scripts utilitaires (Simulation, Sync)
├── src/
│   ├── api/
│   │   ├── controllers/    # Logique métier des endpoints
│   │   ├── middlewares/    # Auth, Validation, Rate Limiting
│   │   └── routes/         # Définition des routes Express
│   ├── config/         # Configuration des services (DB, Pusher, Swagger)
│   ├── entities/       # Modèles de base de données TypeORM
│   ├── types/          # Définitions TypeScript partagées
│   └── index.ts        # Point d'entrée de l'application
├── requests.http       # Fichier de test pour client REST VS Code
└── ...                 # Fichiers de configuration (TS, ESLint, Vercel)
```

---

## Scripts Utilitaires

Le projet inclut des scripts TypeScript exécutables directement pour faciliter le développement et les tests.

### Simulateur de Hub IoT

Génère des données réalistes (température, CO2, fenêtres) et les envoie à l'API pour tester l'ingestion et le temps réel.

```bash
# Avec Doppler
npm run simulate

# Sans Doppler
npx tsx scripts/simulate-hub.ts
```

### Synchronisation des Utilisateurs

Récupère les utilisateurs depuis Clerk et met à jour la base de données locale pour assurer la cohérence.

```bash
npx tsx scripts/sync-clerk-users.ts
```

---

## Documentation de l'API

### Swagger UI

Une interface interactive est disponible en environnement de développement pour explorer et tester les endpoints.
Accès : [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

### Fichier requests.http

Un fichier `requests.http` est disponible à la racine pour tester l'API directement depuis VS Code (nécessite l'extension "REST Client"). Il contient des exemples pour l'authentification et la récupération des données.

---

## Base de Données

Ce projet utilise TypeORM avec une base PostgreSQL. Les entités sont définies dans `src/entities`.

> **Note de sécurité** : La synchronisation automatique (`synchronize: true`) est désactivée par défaut pour éviter toute perte de données accidentelle en production. Les migrations de schéma doivent être gérées avec prudence.
