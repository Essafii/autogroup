const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erreurs de validation Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    
    return res.status(400).json({
      error: 'Erreur de validation',
      code: 'VALIDATION_ERROR',
      details: errors
    });
  }

  // Erreurs de contrainte unique
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    return res.status(409).json({
      error: `${field} déjà utilisé`,
      code: 'DUPLICATE_ERROR',
      field
    });
  }

  // Erreurs de clé étrangère
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Référence invalide',
      code: 'FOREIGN_KEY_ERROR',
      message: err.message
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Erreurs de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Données invalides',
      code: 'VALIDATION_ERROR',
      details: err.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }))
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };














