# Contribuer au Project OwL

Merci de l'intérêt que vous portez au **Project OwL** !

Ce document décrit les règles et les bonnes pratiques pour contribuer au développement de l'interface web. Notre objectif est de maintenir un code propre, performant (surtout sur mobile) et bien testé.

## Stack Technique

Avant de commencer, assurez-vous de connaître les outils principaux :

*   **Framework :** Next.js 15 (App Router)
*   **Langage :** TypeScript (Strict mode)
*   **Style :** Tailwind CSS
*   **Auth :** Clerk
*   **Realtime :** Pusher & Upstash Redis
*   **Tests :** Jest & React Testing Library

---

## Installation de l'environnement

1.  **Prérequis :**
    *   Node.js v20+
    *   npm

2.  **Cloner et installer :**
    ```bash
    git clone https://github.com/votre-orga/owl-next-app.git
    cd owl-next-app
    npm install
    ```

3.  **Variables d'environnement :**
    *   **Via Doppler (Recommandé) :** `doppler setup` puis `npm run dev`.
    *   **Manuellement :** Copiez `.env.example` vers `.env.local` et remplissez les clés (Clerk, Pusher, API URL).

---

##  workflow de Développement

Nous utilisons le **Feature Branch Workflow**.

1.  **Créer une branche :**
    Ne travaillez jamais directement sur `main`. Créez une branche descriptive :
    *   `feat/nom-de-la-feature` (ex: `feat/graphique-humidite`)
    *   `fix/nom-du-bug` (ex: `fix/mobile-menu-scroll`)
    *   `chore/maintenance` (ex: `chore/update-deps`)

2.  **Commits :**
    Nous encourageons l'utilisation de [Conventional Commits](https://www.conventionalcommits.org/) :
    *   `feat: ajout du composant jauge température`
    *   `fix: correction du z-index sur la navbar`
    *   `perf: lazy loading des graphiques Recharts`

3.  **Qualité du code :**
    Avant de pousser votre code, assurez-vous que tout est vert :
    ```bash
    npm run lint      # Vérifie le style (ESLint)
    npm run format    # Formate le code (Prettier)
    npm test          # Lance les tests unitaires
    ```

---

## Performance & Bonnes Pratiques

Ce projet accorde une importance critique aux **performances mobiles**. Tout ajout de code doit respecter ces règles :

### 1. Lazy Loading des Composants Lourds
Ne chargez pas les librairies graphiques (`Chart.js`, `Recharts`) ou les composants lourds de manière synchrone.
**Utilisez toujours `next/dynamic` :**

```tsx
// ❌ À éviter dans les Pages Serveur ou Client
import HeavyChart from '@/components/HeavyChart';

// ✅ Correct
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false // Si le composant n'a pas besoin de SEO
});
