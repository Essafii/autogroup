const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Stock = sequelize.define('Stock', {
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
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  quantite_reservee: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  valeur_stock: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Valeur du stock basée sur CMP'
  },
  last_movement: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['article_id', 'agence_id']
    }
  ]
});

module.exports = Stock;

