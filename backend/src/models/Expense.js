const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Expense = sequelize.define('Expense', {
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
  categorie: {
    type: DataTypes.ENUM('carburant', 'hotel', 'panier', 'peages', 'divers'),
    allowNull: false
  },
  montant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date_depense: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  justificatif_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'approuve', 'rejete', 'paye'),
    allowNull: false,
    defaultValue: 'en_attente'
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  commentaire_approbation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_paiement: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Expense;















