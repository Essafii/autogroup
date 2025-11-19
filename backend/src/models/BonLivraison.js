const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const BonLivraison = sequelize.define('BonLivraison', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  commande_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Commandes',
      key: 'id'
    }
  },
  client_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Clients',
      key: 'id'
    }
  },
  commercial_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  agence_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Agences',
      key: 'id'
    }
  },
  statut: {
    type: DataTypes.ENUM('brouillon', 'valide', 'livre', 'facture'),
    allowNull: false,
    defaultValue: 'brouillon'
  },
  date_livraison: {
    type: DataTypes.DATE,
    allowNull: true
  },
  montant_ht: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  montant_tva: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  montant_ttc: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  is_encaisse: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_encaissement: {
    type: DataTypes.DATE,
    allowNull: true
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
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

module.exports = BonLivraison;

