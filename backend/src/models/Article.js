const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  code_barres: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  libelle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  marque: {
    type: DataTypes.STRING,
    allowNull: false
  },
  famille: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sous_famille: {
    type: DataTypes.STRING,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('piece', 'accessoire', 'lubrifiant', 'pneu', 'autre'),
    allowNull: false
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  unite: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'PIECE'
  },
  pack_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  prix_public: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  prix_standard: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  cmp: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Coût Moyen Pondéré'
  },
  dernier_prix_achat: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  seuil_min: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  seuil_max: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  safety_stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  lead_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Délai en jours'
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

module.exports = Article;

