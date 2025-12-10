// doppler run -- npx tsx scripts/sync-clerk-users.ts

import 'reflect-metadata';
import dotenv from 'dotenv';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { AppDataSource } from '../src/config/data-source.js';
import { User } from '../src/entities/User.js';

// Charger les variables d'environnement depuis le .env
dotenv.config();

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const syncExistingUsers = async () => {
  console.log(
    '🚀 Démarrage de la synchronisation des utilisateurs Clerk existants...'
  );

  if (!process.env.CLERK_SECRET_KEY) {
    console.error(
      "❌ Erreur : CLERK_SECRET_KEY n'est pas défini dans le .env."
    );
    return;
  }

  try {
    // 1. Connexion à la base de données
    await AppDataSource.initialize();
    console.log('✅ Connecté à la base de données Supabase.');
    const userRepository = AppDataSource.getRepository(User);

    // 2. Récupération de TOUS les utilisateurs avec gestion de la pagination
    let offset = 0;
    const limit = 100; // Taille du lot à récupérer à chaque appel
    let totalUsersProcessed = 0;

    console.log("🔍 Récupération des utilisateurs depuis l'API de Clerk...");

    while (true) {
      // --- CORRECTION CLERK V5 ---
      // getUserList retourne maintenant un objet { data, totalCount }
      const response = await clerkClient.users.getUserList({
        limit,
        offset,
        orderBy: '+created_at',
      });

      const clerkUsers = response.data; // On récupère le tableau via .data
      // ----------------------------

      // Si le lot est vide, nous avons récupéré tous les utilisateurs
      if (clerkUsers.length === 0) {
        break;
      }

      console.log(
        `📄 Traitement d'un lot de ${clerkUsers.length} utilisateur(s)...`
      );

      // 3. Boucle sur chaque utilisateur du lot et "upsert" dans la BDD
      for (const clerkUser of clerkUsers) {
        const primaryEmailObject = clerkUser.emailAddresses.find(
          (emailObj) => emailObj.id === clerkUser.primaryEmailAddressId
        );
        const email = primaryEmailObject?.emailAddress;

        if (!email) {
          console.warn(
            `⚠️ Utilisateur Clerk ${clerkUser.id} ignoré (pas d'adresse email principale trouvée).`
          );
          continue;
        }

        let dbUser = await userRepository.findOneBy({
          clerk_user_id: clerkUser.id,
        });

        if (dbUser) {
          console.log(`   -> 🔄 Mise à jour : ${email}`);
        } else {
          console.log(`   -> ✨ Création : ${email}`);
          dbUser = userRepository.create();
        }

        // --- MISE À JOUR DES CHAMPS ---
        dbUser.clerk_user_id = clerkUser.id;
        dbUser.first_name = clerkUser.firstName;
        dbUser.email = email;

        // On préserve la date de création originale de Clerk.
        dbUser.created_at = new Date(clerkUser.createdAt);

        await userRepository.save(dbUser);
      }

      totalUsersProcessed += clerkUsers.length;
      offset += limit; // On passe au lot suivant
    }

    console.log(
      `\n✅ Synchronisation terminée ! ${totalUsersProcessed} utilisateurs traités au total.`
    );
  } catch (error) {
    console.error(
      '❌ Une erreur est survenue lors de la synchronisation :',
      error
    );
  } finally {
    // 4. Fermeture de la connexion à la BDD
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🚪 Connexion à la base de données fermée.');
    }
  }
};

// Lancement du script
syncExistingUsers();
