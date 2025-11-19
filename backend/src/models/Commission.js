const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Commission = sequelize.define('Commission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employee_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Employees',
      key: 'id'
    }
  },
  periode: {
    type: DataTypes.STRING(7),
    allowNull: false,
    comment: 'Format YYYY-MM'
  },
  facture_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Factures',
      key: 'id'
    }
  },
  montant_facture: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  taux_commission: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  montant_commission: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('calculee', 'payee', 'clawback'),
    allowNull: false,
    defaultValue: 'calculee'
  },
  date_paiement: {
    type: DataTypes.DATE,
    allowNull: true
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Commission;

