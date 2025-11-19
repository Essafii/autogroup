const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Facture = sequelize.define('Facture', {
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
  bl_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'BonLivraisons',
      key: 'id'
    }
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
    type: DataTypes.ENUM('brouillon', 'declaree', 'payee', 'impayee', 'annulee'),
    allowNull: false,
    defaultValue: 'brouillon'
  },
  date_facture: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  date_echeance: {
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
  montant_paye: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  montant_restant: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  is_exporte: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_export: {
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

module.exports = Facture;

