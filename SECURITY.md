# Politique de Sécurité - Project OwL

Nous prenons la sécurité de **Project OwL** très au sérieux. Ce document décrit notre politique de maintenance, comment nous signaler une vulnérabilité et les mesures que nous avons mises en place.

## 📦 Versions Supportées

Comme Project OwL est une application web (SaaS) déployée en continu, seule la version la plus récente déployée en production est supportée.

| Version | Supporté | Note |
| ------- | ------------------ | ---- |
| `main` (Production) | :white_check_mark: | Dernière version déployée |
| `develop` (Dev) | :warning: | Version de développement (instable) |
| Versions antérieures | :x: | Non supportées |

## REPORT : Signaler une Vulnérabilité

Si vous découvrez une faille de sécurité ou un problème de confidentialité dans Project OwL, nous vous demandons de **ne pas créer d'Issue publique** sur GitHub, afin de ne pas exposer les utilisateurs avant qu'un correctif ne soit disponible.

Merci d'utiliser l'une des méthodes suivantes :

### 1. Signalement Privé GitHub (Recommandé)

Ce projet utilise la fonctionnalité **Private Vulnerability Reporting** de GitHub.

1. Allez dans l'onglet **Security** du dépôt.
2. Cliquez sur **"Report a vulnerability"**.
3. Remplissez le formulaire. Seuls les mainteneurs du projet verront ce rapport.

### 2. Par Email

Vous pouvez également contacter l'équipe de sécurité directement :
📧 **Email :** [team.owl.project@proton.me](mailto:team.owl.project@proton.me)

### Ce qu'il faut inclure

Pour nous aider à résoudre le problème rapidement, merci d'inclure :

* Le type de problème (ex: Injection SQL, XSS, etc.).
* Les étapes complètes pour reproduire le bug.
* Des captures d'écran ou des extraits de code si pertinent.

## ⏱️ Notre Processus de Réponse

En tant qu'équipe étudiante, nous nous engageons à faire de notre mieux pour traiter les rapports :

1. **Accusé de réception :** Nous essaierons de répondre dans les **48 à 72 heures**.
2. **Évaluation :** Nous confirmerons la vulnérabilité et déterminerons son impact.
3. **Correction :** Un correctif sera développé sur une branche privée et testé.
4. **Déploiement :** Le correctif sera déployé en production.
5. **Divulgation :** Une fois le correctif en place, nous pourrons discuter de la divulgation publique du problème si nécessaire.

## 🛡️ Mesures de Sécurité Actives

Ce projet intègre une approche **DevSecOps** ("Shift Left") pour garantir la sécurité du code :

* **Authentification :** Gestion sécurisée des identités via [Clerk](https://clerk.com).
* **Infrastructure :** Déploiement Serverless sur Vercel et base de données gérée (Supabase).
* **Protection API :** Rate Limiting activé sur les endpoints sensibles pour prévenir les DoS.
* **Analyses Automatisées (CI/CD) :**
  * **SAST :** Analyse statique du code via **CodeQL** (GitHub Advanced Security).
  * **SCA :** Surveillance des dépendances npm via **Dependabot**.
  * **Secret Scanning :** Détection automatique des fuites de clés API ou tokens.

## 🚫 Hors Périmètre (Out of Scope)

Les éléments suivants ne sont pas considérés comme des vulnérabilités critiques dans le cadre de ce projet académique :

* Attaques par Déni de Service (DDoS) volumétriques (gérées par Vercel).
* Ingénierie sociale (Phishing) contre les membres de l'équipe.
* Accès physique aux boîtiers IoT (Hubs) ou aux capteurs.
* Vulnérabilités affectant les utilisateurs de navigateurs obsolètes ou non supportés.

---

Merci de nous aider à garder **Project OwL** sûr pour tous ! 🦉
