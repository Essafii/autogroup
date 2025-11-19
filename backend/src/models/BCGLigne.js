const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const BCGLigne = sequelize.define('BCGLigne', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bcg_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'BCGs',
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
  quantite_chargee: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  quantite_retournee: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  quantite_vendue: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = BCGLigne;

