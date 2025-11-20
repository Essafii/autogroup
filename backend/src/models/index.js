const { sequelize } = require('../database/connection');

// Import des modèles
const User = require('./User');
const Agence = require('./Agence');
const Client = require('./Client');
const Article = require('./Article');
const Stock = require('./Stock');
const MouvementStock = require('./MouvementStock');
const Commande = require('./Commande');
const CommandeLigne = require('./CommandeLigne');
const BonLivraison = require('./BonLivraison');
const Facture = require('./Facture');
const BCG = require('./BCG');
const BCGLigne = require('./BCGLigne');
const Employee = require('./Employee');
const Attendance = require('./Attendance');
const Leave = require('./Leave');
const Commission = require('./Commission');
const Expense = require('./Expense');

// Définition des associations
const defineAssociations = () => {
  // User associations
  User.belongsTo(Agence, { foreignKey: 'agence_id', as: 'agence' });
  User.hasMany(User, { foreignKey: 'created_by', as: 'createdUsers' });
  User.hasMany(Client, { foreignKey: 'commercial_id', as: 'clients' });
  User.hasMany(Commande, { foreignKey: 'commercial_id', as: 'commandes' });
  User.hasMany(Commande, { foreignKey: 'created_by', as: 'commandesCreees' });
  User.hasMany(BonLivraison, { foreignKey: 'commercial_id', as: 'bonLivraisons' });
  User.hasMany(BonLivraison, { foreignKey: 'created_by', as: 'bonLivraisonsCrees' });
  User.hasMany(Facture, { foreignKey: 'commercial_id', as: 'factures' });
  User.hasMany(Facture, { foreignKey: 'created_by', as: 'facturesCrees' });
  User.hasMany(BCG, { foreignKey: 'commercial_id', as: 'bcgs' });
  User.hasMany(BCG, { foreignKey: 'created_by', as: 'bcgsCrees' });
  User.hasMany(Employee, { foreignKey: 'manager_id', as: 'employees' });
  User.hasMany(Attendance, { foreignKey: 'approved_by', as: 'attendancesApprouvees' });
  User.hasMany(Leave, { foreignKey: 'approved_by', as: 'congesApprouves' });
  User.hasMany(Expense, { foreignKey: 'approved_by', as: 'fraisApprouves' });

  // Agence associations
  Agence.hasMany(User, { foreignKey: 'agence_id', as: 'users' });
  Agence.hasMany(Client, { foreignKey: 'agence_id', as: 'clients' });
  Agence.hasMany(Commande, { foreignKey: 'agence_id', as: 'commandes' });
  Agence.hasMany(BonLivraison, { foreignKey: 'agence_id', as: 'bonLivraisons' });
  Agence.hasMany(Facture, { foreignKey: 'agence_id', as: 'factures' });
  Agence.hasMany(Stock, { foreignKey: 'agence_id', as: 'stocks' });
  Agence.hasMany(MouvementStock, { foreignKey: 'agence_id', as: 'mouvementsStock' });
  Agence.hasMany(BCG, { foreignKey: 'depot_source_id', as: 'bcgsDepot' });
  Agence.hasMany(BCG, { foreignKey: 'vehicule_id', as: 'bcgsVehicule' });

  // Client associations
  Client.belongsTo(User, { foreignKey: 'commercial_id', as: 'commercial' });
  Client.belongsTo(Agence, { foreignKey: 'agence_id', as: 'agence' });
  Client.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });
  Client.hasMany(Commande, { foreignKey: 'client_id', as: 'commandes' });

  // Article associations
  Article.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });
  Article.hasMany(Stock, { foreignKey: 'article_id', as: 'stocks' });
  Article.hasMany(MouvementStock, { foreignKey: 'article_id', as: 'mouvementsStock' });
  Article.hasMany(CommandeLigne, { foreignKey: 'article_id', as: 'commandeLignes' });
  Article.hasMany(BCGLigne, { foreignKey: 'article_id', as: 'bcgLignes' });

  // Stock associations
  Stock.belongsTo(Article, { foreignKey: 'article_id', as: 'article' });
  Stock.belongsTo(Agence, { foreignKey: 'agence_id', as: 'agence' });

  // MouvementStock associations
  MouvementStock.belongsTo(Article, { foreignKey: 'article_id', as: 'article' });
  MouvementStock.belongsTo(Agence, { foreignKey: 'agence_id', as: 'agence' });
  MouvementStock.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });

  // Commande associations
  Commande.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
  Commande.belongsTo(User, { foreignKey: 'commercial_id', as: 'commercial' });
  Commande.belongsTo(Agence, { foreignKey: 'agence_id', as: 'agence' });
  Commande.belongsTo(BonLivraison, { foreignKey: 'bl_id', as: 'bonLivraison' });
  Commande.belongsTo(Facture, { foreignKey: 'facture_id', as: 'facture' });
  Commande.hasMany(CommandeLigne, { foreignKey: 'commande_id', as: 'lignes' });

  // CommandeLigne associations
  CommandeLigne.belongsTo(Commande, { foreignKey: 'commande_id', as: 'commande' });
  CommandeLigne.belongsTo(Article, { foreignKey: 'article_id', as: 'article' });

  // BonLivraison associations
  BonLivraison.belongsTo(Commande, { foreignKey: 'commande_id', as: 'commande' });
  BonLivraison.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
  BonLivraison.belongsTo(User, { foreignKey: 'commercial_id', as: 'commercial' });
  BonLivraison.belongsTo(Agence, { foreignKey: 'agence_id', as: 'agence' });
  BonLivraison.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });
  BonLivraison.hasOne(Facture, { foreignKey: 'bl_id', as: 'facture' });

  // Facture associations
  Facture.belongsTo(BonLivraison, { foreignKey: 'bl_id', as: 'bonLivraison' });
  Facture.belongsTo(Commande, { foreignKey: 'commande_id', as: 'commande' });
  Facture.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
  Facture.belongsTo(User, { foreignKey: 'commercial_id', as: 'commercial' });
  Facture.belongsTo(Agence, { foreignKey: 'agence_id', as: 'agence' });
  Facture.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });
  Facture.hasMany(Commission, { foreignKey: 'facture_id', as: 'commissions' });

  // BCG associations
  BCG.belongsTo(Agence, { foreignKey: 'depot_source_id', as: 'depotSource' });
  BCG.belongsTo(Agence, { foreignKey: 'vehicule_id', as: 'vehicule' });
  BCG.belongsTo(User, { foreignKey: 'commercial_id', as: 'commercial' });
  BCG.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });
  BCG.hasMany(BCGLigne, { foreignKey: 'bcg_id', as: 'lignes' });

  // BCGLigne associations
  BCGLigne.belongsTo(BCG, { foreignKey: 'bcg_id', as: 'bcg' });
  BCGLigne.belongsTo(Article, { foreignKey: 'article_id', as: 'article' });

  // Employee associations
  Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Employee.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });
  Employee.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });
  Employee.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendances' });
  Employee.hasMany(Leave, { foreignKey: 'employee_id', as: 'leaves' });
  Employee.hasMany(Commission, { foreignKey: 'employee_id', as: 'commissions' });
  Employee.hasMany(Expense, { foreignKey: 'employee_id', as: 'expenses' });

  // Attendance associations
  Attendance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  Attendance.belongsTo(User, { foreignKey: 'approved_by', as: 'approvedBy' });

  // Leave associations
  Leave.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  Leave.belongsTo(User, { foreignKey: 'approved_by', as: 'approvedBy' });

  // Commission associations
  Commission.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  Commission.belongsTo(Facture, { foreignKey: 'facture_id', as: 'facture' });

  // Expense associations
  Expense.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  Expense.belongsTo(User, { foreignKey: 'approved_by', as: 'approvedBy' });
};

// Initialiser les associations
defineAssociations();

module.exports = {
  sequelize,
  User,
  Agence,
  Client,
  Article,
  Stock,
  MouvementStock,
  Commande,
  CommandeLigne,
  BonLivraison,
  Facture,
  BCG,
  BCGLigne,
  Employee,
  Attendance,
  Leave,
  Commission,
  Expense
};















