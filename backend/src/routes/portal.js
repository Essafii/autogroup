const express = require('express');
const { Article, Client, Commande, CommandeLigne, Agence, User } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

const router = express.Router();

// Schémas de validation
const otpRequestSchema = Joi.object({
  telephone: Joi.string().pattern(/^(\+212|0)[0-9]{9}$/).required()
});

const otpVerifySchema = Joi.object({
  telephone: Joi.string().pattern(/^(\+212|0)[0-9]{9}$/).required(),
  code: Joi.string().length(6).required()
});

const checkoutSchema = Joi.object({
  client_id: Joi.string().uuid().required(),
  articles: Joi.array().items(
    Joi.object({
      article_id: Joi.string().uuid().required(),
      quantite: Joi.number().integer().min(1).required()
    })
  ).min(1).required(),
  commentaire: Joi.string().optional()
});

const registerSchema = Joi.object({
  type: Joi.string().valid('particulier', 'entreprise').required(),
  nom: Joi.string().when('type', { is: 'particulier', then: Joi.required(), otherwise: Joi.optional() }),
  prenom: Joi.string().when('type', { is: 'particulier', then: Joi.required(), otherwise: Joi.optional() }),
  raison_sociale: Joi.string().when('type', { is: 'entreprise', then: Joi.required(), otherwise: Joi.optional() }),
  telephone: Joi.string().pattern(/^(\+212|0)[0-9]{9}$/).required(),
  email: Joi.string().email().optional(),
  adresse: Joi.string().optional(),
  ville: Joi.string().optional(),
  code_postal: Joi.string().optional()
});

// GET /api/portal/catalog/familles
router.get('/catalog/familles', async (req, res, next) => {
  try {
    const familles = await Article.findAll({
      attributes: ['famille'],
      where: { is_active: true },
      group: ['famille'],
      order: [['famille', 'ASC']]
    });

    res.json({
      familles: familles.map(f => f.famille)
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/portal/catalog/sous-familles
router.get('/catalog/sous-familles', async (req, res, next) => {
  try {
    const { famille } = req.query;
    
    const where = { is_active: true };
    if (famille) where.famille = famille;

    const sousFamilles = await Article.findAll({
      attributes: ['sous_famille'],
      where,
      group: ['sous_famille'],
      order: [['sous_famille', 'ASC']]
    });

    res.json({
      sousFamilles: sousFamilles
      .map(sf => sf.sous_famille)
      .filter(sf => sf !== null)
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/portal/catalog/articles
router.get('/catalog/articles', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      famille, 
      sous_famille, 
      marque 
    } = req.query;
    
    const offset = (page - 1) * limit;

    const where = { is_active: true };
    
    if (search) {
      where[Op.or] = [
        { sku: { [Op.iLike]: `%${search}%` } },
        { libelle: { [Op.iLike]: `%${search}%` } },
        { marque: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (famille) where.famille = famille;
    if (sous_famille) where.sous_famille = sous_famille;
    if (marque) where.marque = marque;

    const { count, rows: articles } = await Article.findAndCountAll({
      where,
      attributes: [
        'id', 'sku', 'libelle', 'marque', 'famille', 'sous_famille', 
        'type', 'photo', 'prix_public', 'unite'
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['libelle', 'ASC']]
    });

    // Ajouter la disponibilité (sans révéler les quantités)
    const articlesWithDispo = articles.map(article => ({
      ...article.toJSON(),
      disponible: true // Toujours true pour le portail client
    }));

    res.json({
      articles: articlesWithDispo,
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

// GET /api/portal/catalog/articles/:id
router.get('/catalog/articles/:id', async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      attributes: [
        'id', 'sku', 'libelle', 'marque', 'famille', 'sous_famille', 
        'type', 'photo', 'prix_public', 'unite', 'pack_size'
      ]
    });

    if (!article) {
      return res.status(404).json({
        error: 'Article non trouvé',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    // Ajouter la disponibilité
    const articleWithDispo = {
      ...article.toJSON(),
      disponible: true // Toujours true pour le portail client
    };

    res.json({ article: articleWithDispo });

  } catch (error) {
    next(error);
  }
});

// POST /api/portal/otp/request
router.post('/otp/request', async (req, res, next) => {
  try {
    const { error, value } = otpRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Numéro de téléphone invalide',
        details: error.details[0].message
      });
    }

    const { telephone } = value;

    // Vérifier si le client existe
    const client = await Client.findOne({
      where: { telephone, is_active: true }
    });

    if (!client) {
      return res.status(404).json({
        error: 'Client non trouvé',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    // Générer un code OTP (simulation)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Dans une implémentation réelle, envoyer le code par SMS
    console.log(`Code OTP pour ${telephone}: ${otpCode}`);

    // Stocker le code en session ou cache (simulation)
    req.session = req.session || {};
    req.session.otpCode = otpCode;
    req.session.otpTelephone = telephone;
    req.session.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    res.json({
      message: 'Code OTP envoyé avec succès',
      // En production, ne pas renvoyer le code
      ...(process.env.NODE_ENV === 'development' && { code: otpCode })
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/portal/otp/verify
router.post('/otp/verify', async (req, res, next) => {
  try {
    const { error, value } = otpVerifySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données OTP invalides',
        details: error.details[0].message
      });
    }

    const { telephone, code } = value;

    // Vérifier le code OTP
    if (!req.session || 
        req.session.otpCode !== code || 
        req.session.otpTelephone !== telephone ||
        Date.now() > req.session.otpExpiry) {
      return res.status(401).json({
        error: 'Code OTP invalide ou expiré',
        code: 'INVALID_OTP'
      });
    }

    // Récupérer le client
    const client = await Client.findOne({
      where: { telephone, is_active: true }
    });

    if (!client) {
      return res.status(404).json({
        error: 'Client non trouvé',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    // Générer un token de session simple
    const sessionToken = Buffer.from(`${client.id}-${Date.now()}`).toString('base64');

    // Nettoyer la session OTP
    delete req.session.otpCode;
    delete req.session.otpTelephone;
    delete req.session.otpExpiry;
    req.session.clientId = client.id;
    req.session.sessionToken = sessionToken;

    res.json({
      message: 'Authentification réussie',
      client: client.toJSON(),
      sessionToken
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/portal/checkout
router.post('/checkout', async (req, res, next) => {
  try {
    const { error, value } = checkoutSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données commande invalides',
        details: error.details[0].message
      });
    }

    // Vérifier l'authentification
    if (!req.session || !req.session.clientId) {
      return res.status(401).json({
        error: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }

    const { client_id, articles, commentaire } = value;

    // Vérifier que le client correspond à la session
    if (req.session.clientId !== client_id) {
      return res.status(403).json({
        error: 'Accès non autorisé',
        code: 'UNAUTHORIZED'
      });
    }

    // Vérifier que le client existe
    const client = await Client.findByPk(client_id);
    if (!client) {
      return res.status(404).json({
        error: 'Client non trouvé',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    // Vérifier que les articles existent
    const articleIds = articles.map(a => a.article_id);
    const existingArticles = await Article.findAll({
      where: { 
        id: { [Op.in]: articleIds },
        is_active: true 
      }
    });

    if (existingArticles.length !== articleIds.length) {
      return res.status(400).json({
        error: 'Un ou plusieurs articles non trouvés',
        code: 'ARTICLES_NOT_FOUND'
      });
    }

    // Créer la commande
    const commandeData = {
      client_id,
      commercial_id: client.commercial_id,
      agence_id: client.agence_id,
      statut: 'brouillon',
      commentaire: `Commande portail: ${commentaire || ''}`,
      montant_ht: 0,
      montant_tva: 0,
      montant_ttc: 0
    };

    // Calculer les totaux
    let montant_ht = 0;
    const lignes = [];

    for (const item of articles) {
      const article = existingArticles.find(a => a.id === item.article_id);
      const montant_ligne = article.prix_public * item.quantite;
      montant_ht += montant_ligne;
      
      lignes.push({
        article_id: item.article_id,
        quantite: item.quantite,
        prix_unitaire: article.prix_public,
        remise_pourcentage: 0,
        remise_montant: 0,
        montant_ht: montant_ligne,
        montant_ttc: montant_ligne * 1.2
      });
    }

    const montant_tva = montant_ht * 0.2;
    const montant_ttc = montant_ht + montant_tva;

    commandeData.montant_ht = montant_ht;
    commandeData.montant_tva = montant_tva;
    commandeData.montant_ttc = montant_ttc;

    const commande = await Commande.create(commandeData);

    // Créer les lignes de commande
    for (const ligne of lignes) {
      await CommandeLigne.create({
        ...ligne,
        commande_id: commande.id
      });
    }

    res.status(201).json({
      message: 'Commande créée avec succès',
      commande: {
        id: commande.id,
        numero: commande.numero,
        montant_ttc: commande.montant_ttc,
        statut: commande.statut
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/portal/register
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données d\'inscription invalides',
        details: error.details[0].message
      });
    }

    // Vérifier doublon par téléphone
    const existingByPhone = await Client.findOne({ where: { telephone: value.telephone } });
    if (existingByPhone) {
      return res.status(409).json({
        error: 'Un compte avec ce numéro existe déjà',
        code: 'DUPLICATE_PHONE'
      });
    }

    // Tenter d\'associer un créateur (admin) par défaut
    const admin = await User.findOne({ where: { role: 'admin', is_active: true } });
    if (!admin) {
      return res.status(500).json({
        error: 'Aucun administrateur disponible pour valider l\'inscription',
        code: 'NO_ADMIN_FOUND'
      });
    }

    const clientData = {
      ...value,
      is_prospect: true,
      is_active: false, // en attente d\'approbation admin
      created_by: admin.id,
      agence_id: null,
      commercial_id: null
    };

    const client = await Client.create(clientData);

    res.status(201).json({
      message: 'Inscription reçue. Accès après validation par un administrateur.',
      client: { id: client.id, type: client.type, telephone: client.telephone }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/portal/clients/me/commandes
router.get('/clients/me/commandes', async (req, res, next) => {
  try {
    // Vérifier l'authentification
    if (!req.session || !req.session.clientId) {
      return res.status(401).json({
        error: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: commandes } = await Commande.findAndCountAll({
      where: { 
        client_id: req.session.clientId,
        statut: { [Op.ne]: 'brouillon' } // Ne pas montrer les brouillons
      },
      include: [
        {
          model: CommandeLigne,
          as: 'lignes',
          include: ['article']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_commande', 'DESC']]
    });

    res.json({
      commandes,
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

// GET /api/portal/tracking/:numero
router.get('/tracking/:numero', async (req, res, next) => {
  try {
    const { numero } = req.params;

    // Chercher la commande par numéro
    const commande = await Commande.findOne({
      where: { numero },
      include: [
        {
          model: CommandeLigne,
          as: 'lignes',
          include: [
            {
              model: require('../models').Article,
              as: 'article',
              attributes: ['id', 'sku', 'libelle', 'marque', 'photo']
            }
          ]
        },
        {
          model: require('../models').Client,
          as: 'client',
          attributes: ['id', 'nom', 'prenom', 'type', 'telephone', 'email']
        }
      ],
      order: [['date_commande', 'DESC']]
    });

    if (!commande) {
      return res.status(404).json({
        error: 'Commande non trouvée',
        code: 'ORDER_NOT_FOUND'
      });
    }

    // Formater la réponse avec les détails
    const response = {
      id: commande.id,
      numero: commande.numero,
      statut: commande.statut,
      date_commande: commande.date_commande,
      date_livraison_souhaitee: commande.date_livraison_souhaitee,
      montant_ht: commande.montant_ht,
      montant_tva: commande.montant_tva,
      montant_ttc: commande.montant_ttc,
      commentaire: commande.commentaire,
      client: commande.client ? {
        nom: commande.client.nom,
        prenom: commande.client.prenom,
        telephone: commande.client.telephone
      } : null,
      lignes: commande.lignes ? commande.lignes.map(ligne => ({
        article: ligne.article ? {
          sku: ligne.article.sku,
          libelle: ligne.article.libelle,
          marque: ligne.article.marque,
          photo: ligne.article.photo
        } : null,
        quantite: ligne.quantite,
        prix_unitaire: ligne.prix_unitaire,
        montant_ttc: ligne.montant_ttc
      })) : [],
      bl_numero: commande.bl_id ? 'En préparation' : null,
      facture_numero: commande.facture_id ? 'Disponible' : null
    };

    res.json(response);

  } catch (error) {
    next(error);
  }
});

// POST /api/portal/logout
router.post('/logout', async (req, res, next) => {
  try {
    if (req.session) {
      req.session.destroy(() => {
        res.json({ message: 'Déconnecté' });
      });
    } else {
      res.json({ message: 'Déconnecté' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;





