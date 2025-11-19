const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const CommandeLigne = sequelize.define('CommandeLigne', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  commande_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Commandes',
      key: 'id'
    }
  },
  article_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Articles',
      key: 'id'
    }
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  remise_pourcentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  remise_montant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  montant_ht: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  montant_ttc: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = CommandeLigne;

