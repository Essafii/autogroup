const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Commande = sequelize.define('Commande', {
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
    type: DataTypes.ENUM('brouillon', 'validee', 'livree', 'facturee', 'annulee'),
    allowNull: false,
    defaultValue: 'brouillon'
  },
  date_commande: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  date_livraison_souhaitee: {
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
  remise_montant: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  remise_pourcentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Encaissement
  encaissement_type: {
    type: DataTypes.ENUM('especes', 'cheque', 'virement', 'a_credit'),
    allowNull: true
  },
  encaissement_montant: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  encaissement_reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  encaissement_scan_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_encaisse: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_encaissement: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Relations
  bl_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'BonLivraisons',
      key: 'id'
    }
  },
  facture_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Factures',
      key: 'id'
    }
  }
});

module.exports = Commande;

