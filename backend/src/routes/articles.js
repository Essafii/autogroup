const express = require('express');
const { Article, Stock, Agence } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

const router = express.Router();

// Schémas de validation
const articleSchema = Joi.object({
  sku: Joi.string().required(),
  code_barres: Joi.string().optional(),
  libelle: Joi.string().required(),
  marque: Joi.string().required(),
  famille: Joi.string().required(),
  sous_famille: Joi.string().optional(),
  type: Joi.string().valid('piece', 'accessoire', 'lubrifiant', 'pneu', 'autre').required(),
  photo: Joi.string().optional(),
  unite: Joi.string().default('PIECE'),
  pack_size: Joi.number().integer().min(1).default(1),
  prix_public: Joi.number().min(0).required(),
  prix_standard: Joi.number().min(0).required(),
  cmp: Joi.number().min(0).default(0),
  dernier_prix_achat: Joi.number().min(0).optional(),
  seuil_min: Joi.number().integer().min(0).default(0),
  seuil_max: Joi.number().integer().min(0).default(0),
  safety_stock: Joi.number().integer().min(0).default(0),
  lead_time: Joi.number().integer().min(0).default(0)
});

// GET /api/articles
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      famille, 
      sous_famille, 
      marque, 
      type,
      sous_seuil = false 
    } = req.query;
    
    const offset = (page - 1) * limit;

    const where = { is_active: true };
    
    if (search) {
      where[Op.or] = [
        { sku: { [Op.iLike]: `%${search}%` } },
        { libelle: { [Op.iLike]: `%${search}%` } },
        { marque: { [Op.iLike]: `%${search}%` } },
        { code_barres: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (famille) where.famille = famille;
    if (sous_famille) where.sous_famille = sous_famille;
    if (marque) where.marque = marque;
    if (type) where.type = type;

    const { count, rows: articles } = await Article.findAndCountAll({
      where,
      include: [
        {
          model: Stock,
          as: 'stocks',
          include: ['agence']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['libelle', 'ASC']]
    });

    // Filtrer les articles sous seuil si demandé
    let filteredArticles = articles;
    if (sous_seuil === 'true') {
      filteredArticles = articles.filter(article => {
        return article.stocks.some(stock => 
          stock.quantite <= article.seuil_min
        );
      });
    }

    res.json({
      articles: filteredArticles,
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

// GET /api/articles/:id
router.get('/:id', async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [
        {
          model: Stock,
          as: 'stocks',
          include: ['agence']
        }
      ]
    });

    if (!article) {
      return res.status(404).json({
        error: 'Article non trouvé',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    res.json({ article });

  } catch (error) {
    next(error);
  }
});

// GET /api/articles/:id/mouvements
router.get('/:id/mouvements', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const article = await Article.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({
        error: 'Article non trouvé',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    const { count, rows: mouvements } = await article.getMouvementsStock({
      include: ['agence', 'createdBy'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      mouvements,
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

// POST /api/articles
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = articleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données article invalides',
        details: error.details[0].message
      });
    }

    const articleData = {
      ...value,
      created_by: req.user.id
    };

    const article = await Article.create(articleData);

    // Créer les stocks pour toutes les agences
    const agences = await Agence.findAll({ where: { is_depot: true } });
    for (const agence of agences) {
      await Stock.create({
        article_id: article.id,
        agence_id: agence.id,
        quantite: 0,
        quantite_reservee: 0,
        valeur_stock: 0
      });
    }

    res.status(201).json({
      message: 'Article créé avec succès',
      article: article.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/articles/:id
router.put('/:id', async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({
        error: 'Article non trouvé',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    const { error, value } = articleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données article invalides',
        details: error.details[0].message
      });
    }

    await article.update(value);

    res.json({
      message: 'Article mis à jour avec succès',
      article: article.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/articles/familles
router.get('/familles/list', async (req, res, next) => {
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

// GET /api/articles/sous-familles
router.get('/sous-familles/list', async (req, res, next) => {
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

// DELETE /api/articles/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({
        error: 'Article non trouvé',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    // Vérifier s'il y a des mouvements de stock
    const mouvementsCount = await article.countMouvementsStock();
    if (mouvementsCount > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer un article avec des mouvements de stock',
        code: 'ARTICLE_HAS_MOVEMENTS',
        mouvementsCount
      });
    }

    await article.update({ is_active: false });

    res.json({
      message: 'Article désactivé avec succès'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;















