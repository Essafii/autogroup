const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const BCG = sequelize.define('BCG', {
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
  depot_source_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Agences',
      key: 'id'
    }
  },
  vehicule_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Agences',
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
  statut: {
    type: DataTypes.ENUM('brouillon', 'charge', 'retourne'),
    allowNull: false,
    defaultValue: 'brouillon'
  },
  date_charge: {
    type: DataTypes.DATE,
    allowNull: true
  },
  date_retour: {
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

module.exports = BCG;

