const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const MouvementStock = sequelize.define('MouvementStock', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  article_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Articles',
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
  type: {
    type: DataTypes.ENUM('ACHAT', 'VENTE', 'TRANSFERT', 'BCG', 'BRT', 'INVENTAIRE', 'AVOIR_CLIENT'),
    allowNull: false
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  valeur_totale: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Référence du document source (commande, facture, etc.)'
  },
  reference_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID du document source'
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

module.exports = MouvementStock;

