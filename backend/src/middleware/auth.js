const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token d\'accès requis',
      code: 'TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: ['agence']
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ 
        error: 'Utilisateur non trouvé ou inactif',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(403).json({ 
      error: 'Token invalide',
      code: 'TOKEN_INVALID'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Permissions insuffisantes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

const requireAdmin = requireRole(['admin']);
const requireComptable = requireRole(['admin', 'comptable']);
const requireTC = requireRole(['admin', 'tc']);
const requireCommercial = requireRole(['admin', 'commercial']);
const requireRH = requireRole(['admin', 'rh']);
const requireManager = requireRole(['admin', 'manager_agence']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireComptable,
  requireTC,
  requireCommercial,
  requireRH,
  requireManager
};















