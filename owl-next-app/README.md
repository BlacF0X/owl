# **Project OwL - Web Application**

This is the README for the Project OwL web application, built with [Next.js](https://nextjs.org). This document contains instructions for setting up and running the project in a local development environment.

---

## **Getting Started (English)**

This section will guide you through the process of setting up the development environment. This project uses [Doppler](https://doppler.com) to manage environment variables securely.

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

* [Node.js](https://nodejs.org) (v20 or later recommended)
* [npm](https://www.npmjs.com) or [yarn](https://yarnpkg.com)
* The [Doppler CLI](https://docs.doppler.com/reference/install-cli)

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-repo/owl-next-app.git
    cd owl-next-app
    ```

2. **Install project dependencies:**

    ```bash
    npm install
    # or
    # yarn install
    ```

3. **Connect to Doppler to fetch environment variables:**
    You will need to be invited to the project on Doppler first.

    ```bash
    # This will open a browser window to authenticate you
    doppler login

    # This will link your local folder to the remote Doppler project
    doppler setup
    ```

    Follow the interactive prompts to select the `owl-next-app` project and the `dev` configuration.

4. **Run the development server:**
    To run the app, you must use the `doppler run` command, which injects the secrets into the application environment.

    ```bash
    npm run dev
    # or
    # yarn dev
    ```

5. **Open the application:**
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The page will auto-update as you edit the source files.

---

## **Démarrage (Français)**

Cette section vous guidera pour mettre en place l'environnement de développement. Ce projet utilise [Doppler](https://doppler.com) pour gérer les variables d'environnement de manière sécurisée.

### Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre machine :

* [Node.js](https://nodejs.org) (v20 ou supérieure recommandée)
* [npm](https://www.npmjs.com) ou [yarn](https://yarnpkg.com)
* L'interface de commande (CLI) de [Doppler](https://docs.doppler.com/reference/install-cli)

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
    Vous devez d'abord avoir été invité sur le projet Doppler.

    ```bash
    # Ceci ouvrira une fenêtre de navigateur pour vous authentifier
    doppler login

    # Ceci liera votre dossier local au projet distant sur Doppler
    doppler setup
    ```

    Suivez les instructions interactives pour sélectionner le projet `owl-next-app` et la configuration `dev`.

4. **Lancer le serveur de développement :**
    Pour lancer l'application, vous devez utiliser la commande `doppler run`, qui injecte les secrets dans l'environnement de l'application.

    ```bash
    npm run dev
    # ou
    # yarn dev
    ```

5. **Ouvrir l'application :**
    Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir le résultat. La page se mettra à jour automatiquement à chaque modification des fichiers source.

---

## **Learn More about Next.js**

To learn more about Next.js, take a look at the following resources:

* [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
* [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## **Deploy on Vercel**

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
