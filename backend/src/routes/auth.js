const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const Joi = require('joi');

const router = express.Router();

// Schémas de validation
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nom: Joi.string().required(),
  prenom: Joi.string().required(),
  telephone: Joi.string().pattern(/^(\+212|0)[0-9]{9}$/).required(),
  role: Joi.string().valid('admin', 'comptable', 'tc', 'commercial', 'rh', 'manager_agence', 'employe').required(),
  agence_id: Joi.string().uuid().optional()
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données de connexion invalides',
        details: error.details[0].message
      });
    }

    const { email, password } = value;

    // Rechercher l'utilisateur
    const user = await User.findOne({
      where: { email },
      include: ['agence']
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Mettre à jour la dernière connexion
    await user.update({ last_login: new Date() });

    // Générer les tokens
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        agenceId: user.agence_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      user: user.toJSON(),
      accessToken,
      refreshToken
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register
router.post('/register', authenticateToken, async (req, res, next) => {
  try {
    // Seuls les admins peuvent créer des utilisateurs
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Seuls les administrateurs peuvent créer des utilisateurs',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données d\'inscription invalides',
        details: error.details[0].message
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

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token requis',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: ['agence']
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'Refresh token invalide',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Générer un nouveau token d'accès
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        agenceId: user.agence_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      accessToken,
      user: user.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    // Dans une implémentation complète, on pourrait ajouter le token à une blacklist
    res.json({
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;














