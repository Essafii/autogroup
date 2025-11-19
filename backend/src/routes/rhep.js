const express = require('express');
const { Employee, Attendance, Leave, Commission, Expense, User, Facture } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

const router = express.Router();

// Schémas de validation
const employeeSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  matricule: Joi.string().required(),
  date_embauche: Joi.date().required(),
  date_fin_contrat: Joi.date().optional(),
  type_contrat: Joi.string().valid('CDI', 'CDD', 'STAGE', 'FREELANCE').required(),
  poste: Joi.string().required(),
  departement: Joi.string().required(),
  manager_id: Joi.string().uuid().optional(),
  salaire_base: Joi.number().min(0).required(),
  salaire_brut: Joi.number().min(0).required()
});

const attendanceSchema = Joi.object({
  employee_id: Joi.string().uuid().required(),
  date: Joi.date().required(),
  heure_arrivee: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  heure_depart: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  statut: Joi.string().valid('present', 'absent', 'retard', 'depart_anticipe', 'congé').required(),
  commentaire: Joi.string().optional()
});

const leaveSchema = Joi.object({
  employee_id: Joi.string().uuid().required(),
  type: Joi.string().valid('congé_annuel', 'congé_maladie', 'congé_maternite', 'congé_paternite', 'congé_exceptionnel', 'absence_non_justifiee').required(),
  date_debut: Joi.date().required(),
  date_fin: Joi.date().required(),
  motif: Joi.string().optional(),
  justificatif_url: Joi.string().optional()
});

const expenseSchema = Joi.object({
  employee_id: Joi.string().uuid().required(),
  categorie: Joi.string().valid('carburant', 'hotel', 'panier', 'peages', 'divers').required(),
  montant: Joi.number().min(0).required(),
  date_depense: Joi.date().required(),
  description: Joi.string().required(),
  justificatif_url: Joi.string().optional()
});

// GET /api/rhep/employees
router.get('/employees', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, departement, is_active } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const includeWhere = {};
    if (search) {
      includeWhere[Op.or] = [
        { nom: { [Op.iLike]: `%${search}%` } },
        { prenom: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (departement) includeWhere.departement = departement;

    const { count, rows: employees } = await Employee.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          where: includeWhere
        },
        {
          model: User,
          as: 'manager'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      employees,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/rhep/employees
router.post('/employees', async (req, res, next) => {
  try {
    const { error, value } = employeeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données employé invalides',
        details: error.details[0].message
      });
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(value.user_id);
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    // Vérifier que le matricule est unique
    const existingEmployee = await Employee.findOne({
      where: { matricule: value.matricule }
    });

    if (existingEmployee) {
      return res.status(409).json({
        error: 'Matricule déjà utilisé',
        code: 'DUPLICATE_MATRICULE'
      });
    }

    const employeeData = {
      ...value,
      created_by: req.user.id
    };

    const employee = await Employee.create(employeeData);

    res.status(201).json({
      message: 'Employé créé avec succès',
      employee: employee.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/rhep/attendance
router.get('/attendance', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      employee_id, 
      date_debut, 
      date_fin,
      statut 
    } = req.query;
    
    const offset = (page - 1) * limit;

    const where = {};
    if (employee_id) where.employee_id = employee_id;
    if (statut) where.statut = statut;
    
    if (date_debut || date_fin) {
      where.date = {};
      if (date_debut) where.date[Op.gte] = new Date(date_debut);
      if (date_fin) where.date[Op.lte] = new Date(date_fin);
    }

    const { count, rows: attendances } = await Attendance.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          include: ['user']
        },
        {
          model: User,
          as: 'approvedBy'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });

    res.json({
      attendances,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/rhep/attendance
router.post('/attendance', async (req, res, next) => {
  try {
    const { error, value } = attendanceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données présence invalides',
        details: error.details[0].message
      });
    }

    // Vérifier que l'employé existe
    const employee = await Employee.findByPk(value.employee_id);
    if (!employee) {
      return res.status(404).json({
        error: 'Employé non trouvé',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    // Calculer les heures travaillées
    let heuresTravaillees = 0;
    let heuresSupplementaires = 0;

    if (value.heure_arrivee && value.heure_depart) {
      const arrivee = new Date(`2000-01-01T${value.heure_arrivee}:00`);
      const depart = new Date(`2000-01-01T${value.heure_depart}:00`);
      
      heuresTravaillees = (depart - arrivee) / (1000 * 60 * 60); // en heures
      
      if (heuresTravaillees > 8) {
        heuresSupplementaires = heuresTravaillees - 8;
        heuresTravaillees = 8;
      }
    }

    const attendance = await Attendance.create({
      ...value,
      heures_travaillees: heuresTravaillees,
      heures_supplementaires: heuresSupplementaires
    });

    res.status(201).json({
      message: 'Présence enregistrée avec succès',
      attendance: attendance.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/rhep/leaves
router.get('/leaves', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      employee_id, 
      statut,
      type 
    } = req.query;
    
    const offset = (page - 1) * limit;

    const where = {};
    if (employee_id) where.employee_id = employee_id;
    if (statut) where.statut = statut;
    if (type) where.type = type;

    const { count, rows: leaves } = await Leave.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          include: ['user']
        },
        {
          model: User,
          as: 'approvedBy'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_debut', 'DESC']]
    });

    res.json({
      leaves,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/rhep/leaves
router.post('/leaves', async (req, res, next) => {
  try {
    const { error, value } = leaveSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données congé invalides',
        details: error.details[0].message
      });
    }

    // Vérifier que l'employé existe
    const employee = await Employee.findByPk(value.employee_id);
    if (!employee) {
      return res.status(404).json({
        error: 'Employé non trouvé',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    // Calculer le nombre de jours
    const dateDebut = new Date(value.date_debut);
    const dateFin = new Date(value.date_fin);
    const nombreJours = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      ...value,
      nombre_jours: nombreJours
    });

    res.status(201).json({
      message: 'Demande de congé créée avec succès',
      leave: leave.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/rhep/leaves/:id/approve
router.put('/leaves/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved, commentaire_approbation } = req.body;

    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({
        error: 'Demande de congé non trouvée',
        code: 'LEAVE_NOT_FOUND'
      });
    }

    if (leave.statut !== 'en_attente') {
      return res.status(400).json({
        error: 'Cette demande a déjà été traitée',
        code: 'LEAVE_ALREADY_PROCESSED'
      });
    }

    const statut = approved ? 'approuve' : 'rejete';
    
    await leave.update({
      statut,
      approved_by: req.user.id,
      approved_at: new Date(),
      commentaire_approbation
    });

    res.json({
      message: `Demande de congé ${approved ? 'approuvée' : 'rejetée'} avec succès`,
      leave: leave.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/rhep/commissions
router.get('/commissions', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      employee_id, 
      periode,
      statut 
    } = req.query;
    
    const offset = (page - 1) * limit;

    const where = {};
    if (employee_id) where.employee_id = employee_id;
    if (periode) where.periode = periode;
    if (statut) where.statut = statut;

    const { count, rows: commissions } = await Commission.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          include: ['user']
        },
        {
          model: Facture,
          as: 'facture'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['periode', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({
      commissions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/rhep/commissions/calc
router.post('/commissions/calc', async (req, res, next) => {
  try {
    const { periode } = req.query;

    if (!periode) {
      return res.status(400).json({
        error: 'Période requise (format YYYY-MM)',
        code: 'PERIODE_REQUIRED'
      });
    }

    // Récupérer toutes les factures de la période
    const factures = await Facture.findAll({
      where: {
        statut: 'declaree',
        date_facture: {
          [Op.gte]: new Date(`${periode}-01`),
          [Op.lt]: new Date(`${periode}-01`).setMonth(new Date(`${periode}-01`).getMonth() + 1)
        }
      },
      include: ['commercial']
    });

    const commissions = [];

    for (const facture of factures) {
      // Récupérer l'employé correspondant au commercial
      const employee = await Employee.findOne({
        where: { user_id: facture.commercial_id }
      });

      if (employee) {
        // Calculer le taux de commission (exemple simplifié)
        let tauxCommission = 0;
        if (facture.montant_ttc < 10000) {
          tauxCommission = 1;
        } else if (facture.montant_ttc < 50000) {
          tauxCommission = 1.5;
        } else {
          tauxCommission = 2;
        }

        const montantCommission = (facture.montant_ttc * tauxCommission) / 100;

        const commission = await Commission.create({
          employee_id: employee.id,
          periode,
          facture_id: facture.id,
          montant_facture: facture.montant_ttc,
          taux_commission: tauxCommission,
          montant_commission: montantCommission
        });

        commissions.push(commission);
      }
    }

    res.status(201).json({
      message: 'Commissions calculées avec succès',
      commissions,
      count: commissions.length
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/rhep/expenses
router.get('/expenses', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      employee_id, 
      categorie,
      statut 
    } = req.query;
    
    const offset = (page - 1) * limit;

    const where = {};
    if (employee_id) where.employee_id = employee_id;
    if (categorie) where.categorie = categorie;
    if (statut) where.statut = statut;

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          include: ['user']
        },
        {
          model: User,
          as: 'approvedBy'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_depense', 'DESC']]
    });

    res.json({
      expenses,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/rhep/expenses
router.post('/expenses', async (req, res, next) => {
  try {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données note de frais invalides',
        details: error.details[0].message
      });
    }

    // Vérifier que l'employé existe
    const employee = await Employee.findByPk(value.employee_id);
    if (!employee) {
      return res.status(404).json({
        error: 'Employé non trouvé',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    const expense = await Expense.create(value);

    res.status(201).json({
      message: 'Note de frais créée avec succès',
      expense: expense.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/rhep/expenses/:id/approve
router.put('/expenses/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved, commentaire_approbation } = req.body;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({
        error: 'Note de frais non trouvée',
        code: 'EXPENSE_NOT_FOUND'
      });
    }

    if (expense.statut !== 'en_attente') {
      return res.status(400).json({
        error: 'Cette note de frais a déjà été traitée',
        code: 'EXPENSE_ALREADY_PROCESSED'
      });
    }

    const statut = approved ? 'approuve' : 'rejete';
    
    await expense.update({
      statut,
      approved_by: req.user.id,
      approved_at: new Date(),
      commentaire_approbation
    });

    res.json({
      message: `Note de frais ${approved ? 'approuvée' : 'rejetée'} avec succès`,
      expense: expense.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;














