const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Leave = sequelize.define('Leave', {
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
  type: {
    type: DataTypes.ENUM('congé_annuel', 'congé_maladie', 'congé_maternite', 'congé_paternite', 'congé_exceptionnel', 'absence_non_justifiee'),
    allowNull: false
  },
  date_debut: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  nombre_jours: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'approuve', 'rejete', 'annule'),
    allowNull: false,
    defaultValue: 'en_attente'
  },
  motif: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  justificatif_url: {
    type: DataTypes.STRING,
    allowNull: true
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
  }
});

module.exports = Leave;

