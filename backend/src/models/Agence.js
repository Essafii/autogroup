const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Agence = sequelize.define('Agence', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  adresse: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ville: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  is_depot: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_vehicule: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  commercial_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Agence;

