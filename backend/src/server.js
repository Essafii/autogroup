const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
require('dotenv').config();

const { sequelize } = require('./database/connection');
const authRoutes = require('./routes/auth');
const portalRoutes = require('./routes/portal');
const clientRoutes = require('./routes/clients');
const articleRoutes = require('./routes/articles');
const commandeRoutes = require('./routes/commandes');
const stockRoutes = require('./routes/stock');
const rhepRoutes = require('./routes/rhep');
const uploadRoutes = require('./routes/upload');
const userRoutes = require('./routes/users');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par windowMs
});
app.use(limiter);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Sessions pour le portail public (OTP & panier)
app.use(session({
  name: 'portal.sid',
  secret: process.env.SESSION_SECRET || 'very-secret-dev-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
  }
}));

// Contenu statique (portail HTML)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Logging
app.use(morgan('combined'));

// Routes publiques (désactivées pour usage interne uniquement)
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/portal', portalRoutes);

// Routes protégées
app.use('/api/clients', authenticateToken, clientRoutes);
app.use('/api/articles', authenticateToken, articleRoutes);
app.use('/api/commandes', authenticateToken, commandeRoutes);
app.use('/api/stock', authenticateToken, stockRoutes);
app.use('/api/rhep', authenticateToken, rhepRoutes);
app.use('/api/users', authenticateToken, userRoutes);

// Documentation API
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./swagger/swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Route racine → sert l'interface HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Démarrage du serveur
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');
    
    if (process.env.NODE_ENV !== 'production') {
      const useAlter = !(process.env.DATABASE_URL || '').startsWith('sqlite:');
      await sequelize.sync(useAlter ? { alter: true } : undefined);
      console.log('✅ Modèles synchronisés avec la base de données');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

