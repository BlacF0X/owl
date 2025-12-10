# Project OwL - Web Application

Bienvenue sur la documentation de l'interface utilisateur du Project OwL. Construite avec Next.js 15, cette application offre un tableau de bord en temps réel pour visualiser les données environnementales (CO2, Température, Humidité, Fenêtres).

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk)

---

## Stack Technique

- **Framework** : Next.js 15 (App Router, Server Components).
- **Langage** : TypeScript.
- **Style** : Tailwind CSS.
- **Authentification** : Clerk.
- **Temps Réel** : Pusher (WebSockets).
- **Visualisation** : Chart.js & Recharts.
- **Tests** : Jest & React Testing Library.
- **Gestion des Secrets** : Doppler (optionnel).

---

## Démarrage Rapide

### Prérequis

- Node.js (v20+ recommandé).
- npm ou yarn.

### Installation

1. Cloner le dépôt et accéder au dossier :

   ```bash
   cd owl-next-app
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

2. Sélectionnez le projet `owl-web` et la configuration `dev` :

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
   cp .env.example .env.local
   # Sur Windows : copy .env.example .env.local
   ```

2. Ouvrez le fichier `.env.local` et renseignez les valeurs pour l'API Backend, Clerk et Pusher.
3. Lancez le serveur de développement avec le script local :

   ```bash
   npm run dev:local
   ```

L'application sera accessible sur <http://localhost:3000>.

---

## Structure du Projet

L'architecture suit les conventions du App Router de Next.js avec des groupes de routes pour séparer les logiques d'authentification, de tableau de bord et les pages publiques.

```text
owl-next-app/
├── app/
│   ├── (auth)/             # Routes d'authentification (Connexion/Inscription)
│   ├── (dashboard)/        # Espace utilisateur protégé
│   │   └── dashboard/
│   │       ├── co2-sensors/
│   │       ├── humidity-sensors/
│   │       ├── temperatures-datas/
│   │       └── windows/
│   ├── (main)/             # Pages publiques (Landing page, Astuces, Équipe)
│   └── api/                # Routes API internes (ex: Proxy Auth Pusher)
├── components/
│   ├── __tests__/          # Tests unitaires des composants
│   ├── providers/          # Fournisseurs de contexte (Pusher)
│   └── ...                 # Composants UI et Métiers à plat (Charts, Cards, etc.)
└── src/
    ├── hooks/              # Hooks personnalisés (ex: useRealtimeSensor)
    ├── lib/                # Clients API et configurations
    ├── types/              # Définitions TypeScript globales
    └── utils/              # Fonctions utilitaires et formateurs
```

---

## Tests & Qualité

Le projet intègre des tests unitaires et d'intégration via Jest pour garantir la fiabilité des composants critiques.

### Lancer les tests

Exécuter la suite de tests complète :

```bash
npm test
```

Lancer les tests en mode surveillance (watch) :

```bash
npm run test:watch
```

### Linter & Formatter

Vérifier la qualité du code :

```bash
npm run lint
```

Formater le code :

```bash
npm run format
```

---

## Monitoring

L'application intègre un widget de statut dans la barre latérale qui surveille la disponibilité des services tiers (Vercel, Supabase, Clerk, Pusher) en temps réel.

Pour plus de détails, consultez notre Page de Statut Publique : <https://owl.betteruptime.com/>
