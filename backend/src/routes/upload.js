const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configuration de multer pour les uploads de logo
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/assets/images');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error, uploadPath);
    }
  },
  filename: (req, file, cb) => {
    // Renommer le fichier en logo avec l'extension originale
    const ext = path.extname(file.originalname);
    cb(null, `logo${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les images
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seulement les fichiers image sont autorisés!'));
    }
  }
});

// Upload du logo (administrateur seulement)
router.post('/logo', authenticateToken, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Aucun fichier fourni ou type de fichier invalide' 
      });
    }

    // Vérifier que l'utilisateur est administrateur
    // TODO: Implémenter la vérification de rôle admin
    
    res.json({
      message: 'Logo uploadé avec succès',
      file: {
        filename: req.file.filename,
        path: `/assets/images/${req.file.filename}`,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Erreur upload logo:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'upload du logo',
      details: error.message 
    });
  }
});

// Récupérer le logo
router.get('/logo', (req, res) => {
  try {
    const logoPath = path.join(__dirname, '../../public/assets/images/logo.png');
    
    // Vérifier si le fichier existe
    res.sendFile(logoPath, (err) => {
      if (err) {
        // Si le logo n'existe pas, retourner 404
        res.status(404).json({ 
          error: 'Logo non trouvé',
          message: 'Placez un fichier logo.png dans backend/public/assets/images/' 
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du logo' });
  }
});

module.exports = router;







