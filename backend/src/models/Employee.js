const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  matricule: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  date_embauche: {
    type: DataTypes.DATE,
    allowNull: false
  },
  date_fin_contrat: {
    type: DataTypes.DATE,
    allowNull: true
  },
  type_contrat: {
    type: DataTypes.ENUM('CDI', 'CDD', 'STAGE', 'FREELANCE'),
    allowNull: false
  },
  poste: {
    type: DataTypes.STRING,
    allowNull: false
  },
  departement: {
    type: DataTypes.STRING,
    allowNull: false
  },
  manager_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  salaire_base: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  salaire_brut: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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

module.exports = Employee;

