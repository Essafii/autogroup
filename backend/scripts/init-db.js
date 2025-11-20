/**
 * Script d'initialisation de la base de données
 * Crée toutes les tables et insère les données de base
 */

require('dotenv').config();
const { sequelize } = require('../src/database/connection');
const bcrypt = require('bcryptjs');

// Importer tous les modèles pour qu'ils soient enregistrés
// Cela charge tous les modèles et leurs associations
const { User, Agence, Client } = require('../src/models');

async function initDatabase() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion établie');

    console.log('🔄 Synchronisation des modèles...');
    // En production, utiliser { alter: true } pour modifier les tables existantes
    // En développement, on peut utiliser { force: true } pour recréer (ATTENTION: supprime les données)
    const syncOptions = process.env.NODE_ENV === 'production' 
      ? { alter: true } 
      : { alter: true };
    
    await sequelize.sync(syncOptions);
    console.log('✅ Tables créées/mises à jour');

    // Les modèles sont déjà importés

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ where: { email: 'admin@groupauto.ma' } });
    
    if (!existingAdmin) {
      console.log('🔄 Création de l\'utilisateur admin...');
      
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

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash('admin123', 12);

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
      console.log('✅ Utilisateur admin créé');
      console.log('   Email: admin@groupauto.ma');
      console.log('   Mot de passe: admin123');
    } else {
      console.log('ℹ️  L\'utilisateur admin existe déjà');
    }

    // Créer l'utilisateur commercial par défaut
    const existingCommercial = await User.findOne({ where: { email: 'commercial@groupauto.ma' } });
    
    if (!existingCommercial) {
      console.log('🔄 Création de l\'utilisateur commercial...');
      
      let agence = await Agence.findOne({ where: { code: 'TEM' } });
      if (!agence) {
        agence = await Agence.findOne();
      }

      if (agence) {
        const hashedPassword = await bcrypt.hash('commercial123', 12);
        await User.create({
          email: 'commercial@groupauto.ma',
          password: hashedPassword,
          nom: 'Commercial',
          prenom: 'User',
          telephone: '+212600000001',
          role: 'commercial',
          agence_id: agence.id,
          is_active: true
        });
        console.log('✅ Utilisateur commercial créé');
        console.log('   Email: commercial@groupauto.ma');
        console.log('   Mot de passe: commercial123');
      }
    } else {
      console.log('ℹ️  L\'utilisateur commercial existe déjà');
    }

    console.log('\n✅ Initialisation terminée avec succès!');
    console.log('\n📋 Comptes créés:');
    console.log('   Admin: admin@groupauto.ma / admin123');
    console.log('   Commercial: commercial@groupauto.ma / commercial123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

initDatabase();

