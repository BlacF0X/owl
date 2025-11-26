# **Project OwL.**

Bienvenue sur le dépôt central du **Project OwL**. Ce projet vise à fournir une solution complète pour la surveillance de l'environnement domestique en temps réel, en combinant du matériel personnalisé, un backend robuste et une application web intuitive.

---

## **Table des matières**

- [**🚀 Core Features**](#-core-features)
- [**🏛️ Project Architecture**](#️-project-architecture)
- [**🛠️ Technology Stack**](#️-technology-stack)
- [**📂 Repository Structure**](#-repository-structure)
- [**🏁 Getting Started**](#-getting-started)
- [**✨ The Team**](#-the-team)
- [**📧 Contact**](#-contact)

---

## **🚀 Core Features**

- **Surveillance en temps réel** : Visualisez les données de vos capteurs instantanément depuis un tableau de bord personnel.
- **Capteurs de Fenêtres** : Soyez notifié si vos fenêtres sont ouvertes ou fermées et depuis combien de temps.
- **Analyse de la qualité de l'air** : Suivez le niveau de CO2 pour garantir un environnement sain.
- **Accès Sécurisé** : Gestion des comptes utilisateurs et accès protégé aux données personnelles.

## **🏛️ Project Architecture**

Le projet est divisé en trois composants principaux qui communiquent entre eux pour offrir une expérience utilisateur fluide.

### **1. 🔌 Hardware (Système Embarqué)**

Le cœur du système de collecte de données. Il est composé de :

- Un **boîtier central** qui agrège les données des différents capteurs.
- Des **capteurs de contact** pour surveiller l'état des fenêtres.
- Un **capteur de CO2** pour analyser la qualité de l'air ambiant.

### **2. ⚙️ Backend**

Le backend sert de pont entre le matériel et l'application web. Ses responsabilités incluent :

- La réception et le stockage des données envoyées par le boîtier central.
- L'exposition d'une API sécurisée pour que l'application web puisse consommer les données.
- La gestion de la logique métier (calculs, notifications, etc.).

### **3. 💻 Web Application (Frontend)**

L'interface utilisateur, construite avec **Next.js**, permet aux utilisateurs de :

- S'inscrire et se connecter à leur compte personnel.
- Consulter un tableau de bord affichant l'état de leurs capteurs.
- Gérer leurs appareils et leurs préférences.

## **🛠️ Technology Stack**

- **Frontend** : Next.js, React, TypeScript, Tailwind CSS
- **Authentification** : Clerk
- **Gestion des secrets** : Doppler
- **Backend** : Express, PostgreSQL
- **Hardware** : Python

## **📂 Repository Structure**

Ce dépôt est organisé pour séparer clairement les différents composants du projet.

```bash
/
├── hardware/       # Code source et schémas pour le système embarqué
├── owl-api/        # Code source de l'API
├── owl-db/         # Code source de l'initialisation de la db
└── owl-next-app/   # Code source de l'application Next.js
└── README.md       # Ce fichier
```

## **🏁 Getting Started**

[![CI - Global Quality Check](https://github.com/BlacF0X/owl/actions/workflows/ci.yml/badge.svg)](https://github.com/BlacF0X/owl/actions/workflows/ci.yml)

Pour lancer l'un des composants du projet, veuillez vous référer au `README.md` spécifique situé dans le dossier correspondant.

- **Pour démarrer l'application web, suivez les instructions dans [`owl-next-app/README.md`](./owl-next-app/README.md).**

- **Pour démarrer l'API, suivez les instructions dans [`owl-api/README.md`](./owl-api/README.md).**

## ✨ **The Team**

Ce projet est rendu possible grâce à une équipe de six développeurs passionnés :

| Nom                   | Rôle                                 |
| --------------------- | ------------------------------------ |
| **Arno Stärkel**      | Développeur Fullstack                |
| **Clément Vier**      | Développeur Fullstack                |
| **Corentin Mertens**  | Développeur Électronique             |
| **Liam Gérard**       | Développeur Frontend et Électronique |
| **Lucas Bretenstein** | Développeur Fullstack                  |
| **Martin Stocq**      | Développeur Fullstack                 |

## 📧 **Contact**

Pour toute question ou suggestion, n'hésitez pas à nous contacter à l'adresse suivante : [**team.owl.project@proton.me**](mailto:team.owl.project@proton.me).
