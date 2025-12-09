# **Project OwL.**

Bienvenue sur le dépôt central du **Project OwL**. Ce projet vise à fournir une solution complète pour la surveillance de l'environnement domestique en temps réel, en combinant du matériel personnalisé, un backend robuste et une application web intuitive.

[![CI - Global Quality Check](https://github.com/BlacF0X/owl/actions/workflows/ci.yml/badge.svg)](https://github.com/BlacF0X/owl/actions/workflows/ci.yml)

---

## **État des Services**

Transparence totale sur l'infrastructure du projet.

| Service | Statut (Disponibilité) | Page Officielle |
| :--- | :--- | :--- |
| **Vercel** | ![Vercel Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.vercel-status.com&label=Status&style=flat-square&color=success) | [Voir détails](https://www.vercel-status.com/) |
| **Supabase** | ![Supabase Status](https://img.shields.io/website?url=https%3A%2F%2Fstatus.supabase.com&label=Status&style=flat-square&color=3ECF8E) | [Voir détails](https://status.supabase.com/) |
| **Clerk** | ![Clerk Status](https://img.shields.io/website?url=https%3A%2F%2Fstatus.clerk.com&label=Status&style=flat-square&color=6C47FF) | [Voir détails](https://status.clerk.com/) |
| **Pusher** | ![Pusher Status](https://img.shields.io/website?url=https%3A%2F%2Fstatus.pusher.com&label=Status&style=flat-square&color=EA2C6D) | [Voir détails](https://status.pusher.com/) |

> *Consultez notre [Page de statut publique](https://owl.betteruptime.com/) pour l'historique complet.*

---

## **Table des matières**

- [**Core Features**](#-core-features)
- [**Project Architecture**](#-project-architecture)
- [**Technology Stack**](#-technology-stack)
- [**Repository Structure**](#-repository-structure)
- [**Getting Started**](#-getting-started)
- [**The Team**](#-the-team)
- [**Contact**](#-contact)

---

## **Core Features**

- **Surveillance en temps réel** : Visualisez les données de vos capteurs instantanément depuis un tableau de bord personnel via WebSocket.
- **Capteurs de Fenêtres** : Soyez notifié si vos fenêtres sont ouvertes ou fermées et accédez à l'historique d'activité.
- **Analyse de la qualité de l'air** : Suivez le niveau de CO2 et recevez des alertes pour garantir un environnement sain.
- **Accès Sécurisé** : Gestion des comptes utilisateurs et accès protégé aux données personnelles.

---

## **Project Architecture**

Le projet est divisé en trois composants principaux qui communiquent entre eux pour offrir une expérience utilisateur fluide.

### **1. Hardware (Système Embarqué)**

Le cœur du système de collecte de données. Il est composé de :

- Un **boîtier central** qui agrège les données des différents capteurs.
- Des **capteurs de contact** pour surveiller l'état des fenêtres.
- Un **capteur de CO2** pour analyser la qualité de l'air ambiant.

### **2. Backend (API)**

Le backend sert de pont entre le matériel et l'application web. Ses responsabilités incluent :

- La réception et le stockage des données envoyées par le boîtier central.
- L'exposition d'une API REST sécurisée documentée via Swagger.
- La gestion de la logique métier et des Webhooks (Clerk).

### **3. Web Application (Frontend)**

L'interface utilisateur permet aux utilisateurs de :

- S'inscrire et se connecter à leur compte personnel.
- Consulter un tableau de bord affichant l'état de leurs capteurs avec des mises à jour en temps réel (Pusher).
- Gérer leurs appareils et leurs préférences.

---

## **Technology Stack**

Une stack moderne, typée et performante.

### **Frontend**

- **Framework** : [Next.js 15](https://nextjs.org/) (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS
- **Authentification** : [Clerk](https://clerk.com/)
- **Temps Réel** : [Pusher](https://pusher.com/)

### **Backend**

- **Serveur** : Node.js & Express
- **Langage** : TypeScript
- **ORM** : TypeORM
- **Monitoring** : Better Stack (Logtail)

### **Infrastructure & DevOps**

- **Base de données** : PostgreSQL (via [Supabase](https://supabase.com/))
- **Hébergement** : Vercel
- **Gestion des secrets** : [Doppler](https://doppler.com/)
- **CI/CD** : GitHub Actions

---

## **Repository Structure**

Ce dépôt est un monorepo organisé pour séparer clairement les responsabilités.

```bash
/
├── hardware/       # Code source (Python/C++) et schémas pour le système embarqué
├── owl-api/        # API Backend (Express)
├── owl-db/         # Scripts d'initialisation de la base de données
├── owl-next-app/   # Application Web (Next.js)
└── README.md       # Ce fichier
```

---

## **Getting Started**

Chaque partie du projet possède sa propre documentation détaillée pour l'installation et le lancement.

### 1. Démarrer l'API (Backend)

Pour configurer le serveur local, la connexion à la base de données et les variables d'environnement :
**[Voir le README de l'API](./owl-api/README.md)**

### 2. Démarrer l'Application Web (Frontend)

Pour lancer l'interface utilisateur et la connecter à l'API :
**[Voir le README du Frontend](./owl-next-app/README.md)**

---

## **The Team**

Ce projet est rendu possible grâce à une équipe de six développeurs passionnés :

| Nom                   | Rôle                                 |
| --------------------- | ------------------------------------ |
| **Arno Stärkel**      | Développeur Backend                  |
| **Clément Vier**      | Développeur Fullstack                |
| **Corentin Mertens**  | Développeur Électronique             |
| **Liam Gérard**       | Développeur Frontend                 |
| **Lucas Bretenstein** | Développeur Backend                  |
| **Martin Stocq**      | Développeur Frontend                 |

## **Contact**

Pour toute question ou suggestion, n'hésitez pas à nous contacter à l'adresse suivante : [**team.owl.project@proton.me**](mailto:team.owl.project@proton.me).
