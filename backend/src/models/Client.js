const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('particulier', 'entreprise'),
    allowNull: false
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: true
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: true
  },
  raison_sociale: {
    type: DataTypes.STRING,
    allowNull: true
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^(\+212|0)[0-9]{9}$/
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  adresse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ville: {
    type: DataTypes.STRING,
    allowNull: true
  },
  code_postal: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Coordonnées GPS
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  // Informations entreprise
  type_entreprise: {
    type: DataTypes.ENUM('SARL', 'SA', 'AE'),
    allowNull: true
  },
  rc: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ice: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tva: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Statut
  is_prospect: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Relations
  commercial_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  agence_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Agences',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

module.exports = Client;

