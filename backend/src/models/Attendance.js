const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Attendance = sequelize.define('Attendance', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  heure_arrivee: {
    type: DataTypes.TIME,
    allowNull: true
  },
  heure_depart: {
    type: DataTypes.TIME,
    allowNull: true
  },
  heures_travaillees: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    defaultValue: 0
  },
  heures_supplementaires: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    defaultValue: 0
  },
  statut: {
    type: DataTypes.ENUM('present', 'absent', 'retard', 'depart_anticipe', 'congé'),
    allowNull: false,
    defaultValue: 'absent'
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  }
});

module.exports = Attendance;

