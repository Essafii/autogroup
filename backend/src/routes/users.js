const express = require('express');
const { User, Agence } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Schémas de validation
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nom: Joi.string().required(),
  prenom: Joi.string().required(),
  telephone: Joi.string().pattern(/^(\+212|0)[0-9]{9}$/).required(),
  role: Joi.string().valid('admin', 'comptable', 'tc', 'commercial', 'rh', 'manager_agence', 'employe').required(),
  agence_id: Joi.string().uuid().optional(),
  is_active: Joi.boolean().optional()
});

const userUpdateSchema = Joi.object({
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  nom: Joi.string().optional(),
  prenom: Joi.string().optional(),
  telephone: Joi.string().pattern(/^(\+212|0)[0-9]{9}$/).optional(),
  role: Joi.string().valid('admin', 'comptable', 'tc', 'commercial', 'rh', 'manager_agence', 'employe').optional(),
  agence_id: Joi.string().uuid().allow(null).optional(),
  is_active: Joi.boolean().optional()
});

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, is_active } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { nom: { [Op.iLike]: `%${search}%` } },
        { prenom: { [Op.iLike]: `%${search}%` } },
        { telephone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    // Filtrage par agence pour les non-admins
    if (req.user.role !== 'admin') {
      where.agence_id = req.user.agence_id;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include: ['agence'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      users,
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

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: ['agence']
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    // Vérifier les permissions (admin ou son propre profil)
    if (req.user.role !== 'admin' && req.user.id !== user.id) {
      return res.status(403).json({
        error: 'Permissions insuffisantes',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    res.json({ user: user.toJSON() });

  } catch (error) {
    next(error);
  }
});

// POST /api/users (admin only)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données utilisateur invalides',
        details: error.details[0].message
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({
      where: { email: value.email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Un utilisateur avec cet email existe déjà',
        code: 'DUPLICATE_EMAIL'
      });
    }

    const userData = {
      ...value,
      created_by: req.user.id
    };

    const user = await User.create(userData);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: user.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id (admin only)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    const { error, value } = userUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données utilisateur invalides',
        details: error.details[0].message
      });
    }

    // Vérifier si l'email existe déjà (si modifié)
    if (value.email && value.email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: value.email }
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'Un utilisateur avec cet email existe déjà',
          code: 'DUPLICATE_EMAIL'
        });
      }
    }

    // Ne pas mettre à jour le mot de passe si non fourni
    if (!value.password) {
      delete value.password;
    }

    await user.update(value);

    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: user.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id (admin only) - désactivation
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    // Ne pas permettre de désactiver soi-même
    if (user.id === req.user.id) {
      return res.status(400).json({
        error: 'Impossible de désactiver votre propre compte',
        code: 'CANNOT_DEACTIVATE_SELF'
      });
    }

    await user.update({ is_active: false });

    res.json({
      message: 'Utilisateur désactivé avec succès'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/users/agences/list
router.get('/agences/list', async (req, res, next) => {
  try {
    const agences = await Agence.findAll({
      where: { is_active: true },
      attributes: ['id', 'nom', 'code', 'ville'],
      order: [['nom', 'ASC']]
    });

    res.json({
      agences
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;

