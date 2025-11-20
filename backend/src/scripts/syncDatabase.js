/**
 * Script de synchronisation de la base de données
 * Crée toutes les tables et initialise l'utilisateur admin par défaut
 */

require('dotenv').config();
const { sequelize } = require('../database/connection');
const bcrypt = require('bcryptjs');

// Importer tous les modèles pour qu'ils soient enregistrés et leurs associations définies
// Cela garantit que sequelize.sync() créera toutes les tables nécessaires
const { User, Agence } = require('../models');

async function syncDatabase() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    console.log('🔄 Synchronisation des modèles avec la base de données...');
    // Utiliser alter: true pour créer/modifier les tables sans supprimer les données existantes
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synchronisées avec succès');

    // Vérifier si un utilisateur existe déjà
    console.log('🔄 Vérification des utilisateurs existants...');
    const userCount = await User.count();

    if (userCount === 0) {
      console.log('🔄 Aucun utilisateur trouvé. Création de l\'utilisateur admin...');
      
      // Créer une agence par défaut si elle n'existe pas
      let agence = await Agence.findOne({ where: { code: 'TEM' } });
      if (!agence) {
        agence = await Agence.create({
          nom: 'Dépôt Témara',
          code: 'TEM',
          adresse: 'Zone Industrielle, Témara',
          ville: 'Témara',
          telephone: '+212537123456',
          email: 'temara@groupauto.ma',
          is_depot: true,
          is_vehicule: false,
          is_active: true
        });
        console.log('✅ Agence par défaut créée');
      }

      // Hasher le mot de passe avec bcrypt (même stratégie que le modèle User)
      const hashedPassword = await bcrypt.hash('Admin123!', 12);

      // Créer l'utilisateur admin
      await User.create({
        email: 'admin@groupauto.ma',
        password: hashedPassword,
        nom: 'Admin',
        prenom: 'Groupauto',
        telephone: '+212600000000',
        role: 'admin',
        agence_id: agence.id,
        is_active: true
      });
      console.log('✅ Utilisateur admin créé avec succès');
      console.log('   Email: admin@groupauto.ma');
      console.log('   Mot de passe: Admin123!');
    } else {
      console.log(`ℹ️  ${userCount} utilisateur(s) existant(s) dans la base de données`);
    }

    console.log('\n✅ Synchronisation de la base de données terminée avec succès!');
    
    // Fermer la connexion
    await sequelize.close();
    console.log('✅ Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    console.error('Détails:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    
    // Fermer la connexion en cas d'erreur
    try {
      await sequelize.close();
    } catch (closeError) {
      // Ignorer les erreurs de fermeture
    }
    
    process.exit(1);
  }
}

// Exécuter le script
syncDatabase();
