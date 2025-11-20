const express = require('express');
const { Stock, Article, Agence, MouvementStock, BCG, BCGLigne } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

const router = express.Router();

// Schémas de validation
const transfertSchema = Joi.object({
  article_id: Joi.string().uuid().required(),
  agence_source_id: Joi.string().uuid().required(),
  agence_destination_id: Joi.string().uuid().required(),
  quantite: Joi.number().integer().min(1).required(),
  commentaire: Joi.string().optional()
});

const inventaireSchema = Joi.object({
  agence_id: Joi.string().uuid().required(),
  articles: Joi.array().items(
    Joi.object({
      article_id: Joi.string().uuid().required(),
      quantite_reelle: Joi.number().integer().min(0).required(),
      commentaire: Joi.string().optional()
    })
  ).min(1).required()
});

const bcgSchema = Joi.object({
  depot_source_id: Joi.string().uuid().required(),
  vehicule_id: Joi.string().uuid().required(),
  lignes: Joi.array().items(
    Joi.object({
      article_id: Joi.string().uuid().required(),
      quantite: Joi.number().integer().min(1).required(),
      commentaire: Joi.string().optional()
    })
  ).min(1).required(),
  commentaire: Joi.string().optional()
});

// GET /api/stock/where
router.get('/where', async (req, res, next) => {
  try {
    const { article_id } = req.query;

    if (!article_id) {
      return res.status(400).json({
        error: 'article_id requis',
        code: 'ARTICLE_ID_REQUIRED'
      });
    }

    const stocks = await Stock.findAll({
      where: { article_id },
      include: [
        'article',
        'agence'
      ]
    });

    const totalQuantite = stocks.reduce((sum, stock) => sum + stock.quantite, 0);
    const totalValeur = stocks.reduce((sum, stock) => sum + stock.valeur_stock, 0);

    res.json({
      article: stocks[0]?.article,
      stocks,
      totalQuantite,
      totalValeur
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/stock/seuils
router.get('/seuils', async (req, res, next) => {
  try {
    const { agence_id } = req.query;
    
    const where = {};
    if (agence_id) where.agence_id = agence_id;

    const stocks = await Stock.findAll({
      where,
      include: [
        {
          model: Article,
          as: 'article',
          where: {
            is_active: true
          }
        },
        'agence'
      ]
    });

    const articlesSousSeuil = stocks.filter(stock => 
      stock.quantite <= stock.article.seuil_min
    );

    res.json({
      articlesSousSeuil,
      count: articlesSousSeuil.length
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/stock/transferts
router.post('/transferts', async (req, res, next) => {
  try {
    const { error, value } = transfertSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données transfert invalides',
        details: error.details[0].message
      });
    }

    // Vérifier que l'article existe
    const article = await Article.findByPk(value.article_id);
    if (!article) {
      return res.status(404).json({
        error: 'Article non trouvé',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    // Vérifier le stock source
    const stockSource = await Stock.findOne({
      where: {
        article_id: value.article_id,
        agence_id: value.agence_source_id
      }
    });

    if (!stockSource || stockSource.quantite < value.quantite) {
      return res.status(400).json({
        error: 'Stock insuffisant pour le transfert',
        code: 'INSUFFICIENT_STOCK'
      });
    }

    // Vérifier que les agences existent
    const [agenceSource, agenceDestination] = await Promise.all([
      Agence.findByPk(value.agence_source_id),
      Agence.findByPk(value.agence_destination_id)
    ]);

    if (!agenceSource || !agenceDestination) {
      return res.status(404).json({
        error: 'Agence non trouvée',
        code: 'AGENCE_NOT_FOUND'
      });
    }

    // Effectuer le transfert
    await Stock.decrement('quantite', {
      by: value.quantite,
      where: {
        article_id: value.article_id,
        agence_id: value.agence_source_id
      }
    });

    // Créer ou mettre à jour le stock destination
    const stockDestination = await Stock.findOne({
      where: {
        article_id: value.article_id,
        agence_id: value.agence_destination_id
      }
    });

    if (stockDestination) {
      await stockDestination.increment('quantite', { by: value.quantite });
    } else {
      await Stock.create({
        article_id: value.article_id,
        agence_id: value.agence_destination_id,
        quantite: value.quantite,
        quantite_reservee: 0,
        valeur_stock: value.quantite * article.cmp
      });
    }

    // Enregistrer les mouvements
    await MouvementStock.create({
      article_id: value.article_id,
      agence_id: value.agence_source_id,
      type: 'TRANSFERT',
      quantite: -value.quantite,
      prix_unitaire: article.cmp,
      valeur_totale: -value.quantite * article.cmp,
      reference: `TRANSFERT-${Date.now()}`,
      commentaire: value.commentaire,
      created_by: req.user.id
    });

    await MouvementStock.create({
      article_id: value.article_id,
      agence_id: value.agence_destination_id,
      type: 'TRANSFERT',
      quantite: value.quantite,
      prix_unitaire: article.cmp,
      valeur_totale: value.quantite * article.cmp,
      reference: `TRANSFERT-${Date.now()}`,
      commentaire: value.commentaire,
      created_by: req.user.id
    });

    res.status(201).json({
      message: 'Transfert effectué avec succès'
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/stock/inventaires
router.post('/inventaires', async (req, res, next) => {
  try {
    const { error, value } = inventaireSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données inventaire invalides',
        details: error.details[0].message
      });
    }

    const { agence_id, articles } = value;

    // Vérifier que l'agence existe
    const agence = await Agence.findByPk(agence_id);
    if (!agence) {
      return res.status(404).json({
        error: 'Agence non trouvée',
        code: 'AGENCE_NOT_FOUND'
      });
    }

    const resultats = [];

    for (const item of articles) {
      const stock = await Stock.findOne({
        where: {
          article_id: item.article_id,
          agence_id: agence_id
        },
        include: ['article']
      });

      if (!stock) {
        return res.status(404).json({
          error: `Stock non trouvé pour l'article ${item.article_id}`,
          code: 'STOCK_NOT_FOUND'
        });
      }

      const ecart = item.quantite_reelle - stock.quantite;
      
      if (ecart !== 0) {
        // Mettre à jour le stock
        await stock.update({
          quantite: item.quantite_reelle,
          valeur_stock: item.quantite_reelle * stock.article.cmp,
          last_movement: new Date()
        });

        // Enregistrer le mouvement
        await MouvementStock.create({
          article_id: item.article_id,
          agence_id: agence_id,
          type: 'INVENTAIRE',
          quantite: ecart,
          prix_unitaire: stock.article.cmp,
          valeur_totale: ecart * stock.article.cmp,
          reference: `INVENTAIRE-${Date.now()}`,
          commentaire: item.commentaire || `Inventaire: ${ecart > 0 ? '+' : ''}${ecart}`,
          created_by: req.user.id
        });
      }

      resultats.push({
        article_id: item.article_id,
        article_libelle: stock.article.libelle,
        quantite_ancienne: stock.quantite,
        quantite_nouvelle: item.quantite_reelle,
        ecart,
        valeur_ecart: ecart * stock.article.cmp
      });
    }

    res.status(201).json({
      message: 'Inventaire effectué avec succès',
      resultats
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/stock/bcg
router.post('/bcg', async (req, res, next) => {
  try {
    const { error, value } = bcgSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données BCG invalides',
        details: error.details[0].message
      });
    }

    // Vérifier que les agences existent
    const [depotSource, vehicule] = await Promise.all([
      Agence.findByPk(value.depot_source_id),
      Agence.findByPk(value.vehicule_id)
    ]);

    if (!depotSource || !vehicule) {
      return res.status(404).json({
        error: 'Agence non trouvée',
        code: 'AGENCE_NOT_FOUND'
      });
    }

    if (!depotSource.is_depot) {
      return res.status(400).json({
        error: 'L\'agence source doit être un dépôt',
        code: 'INVALID_SOURCE_AGENCE'
      });
    }

    if (!vehicule.is_vehicule) {
      return res.status(400).json({
        error: 'L\'agence destination doit être un véhicule',
        code: 'INVALID_DESTINATION_AGENCE'
      });
    }

    // Vérifier la disponibilité des articles
    for (const ligne of value.lignes) {
      const stock = await Stock.findOne({
        where: {
          article_id: ligne.article_id,
          agence_id: value.depot_source_id
        }
      });

      if (!stock || stock.quantite < ligne.quantite) {
        return res.status(400).json({
          error: `Stock insuffisant pour l'article ${ligne.article_id}`,
          code: 'INSUFFICIENT_STOCK'
        });
      }
    }

    // Générer le numéro BCG
    const numero = await generateBCGNumber();

    // Créer le BCG
    const bcg = await BCG.create({
      numero,
      depot_source_id: value.depot_source_id,
      vehicule_id: value.vehicule_id,
      commercial_id: req.user.id,
      statut: 'charge',
      date_charge: new Date(),
      commentaire: value.commentaire,
      created_by: req.user.id
    });

    // Créer les lignes et effectuer les transferts
    for (const ligne of value.lignes) {
      await BCGLigne.create({
        bcg_id: bcg.id,
        article_id: ligne.article_id,
        quantite_chargee: ligne.quantite,
        quantite_retournee: 0,
        quantite_vendue: 0,
        commentaire: ligne.commentaire
      });

      // Effectuer le transfert
      await Stock.decrement('quantite', {
        by: ligne.quantite,
        where: {
          article_id: ligne.article_id,
          agence_id: value.depot_source_id
        }
      });

      // Créer ou mettre à jour le stock véhicule
      const stockVehicule = await Stock.findOne({
        where: {
          article_id: ligne.article_id,
          agence_id: value.vehicule_id
        }
      });

      if (stockVehicule) {
        await stockVehicule.increment('quantite', { by: ligne.quantite });
      } else {
        const article = await Article.findByPk(ligne.article_id);
        await Stock.create({
          article_id: ligne.article_id,
          agence_id: value.vehicule_id,
          quantite: ligne.quantite,
          quantite_reservee: 0,
          valeur_stock: ligne.quantite * article.cmp
        });
      }

      // Enregistrer les mouvements
      await MouvementStock.create({
        article_id: ligne.article_id,
        agence_id: value.depot_source_id,
        type: 'BCG',
        quantite: -ligne.quantite,
        reference: bcg.numero,
        reference_id: bcg.id,
        commentaire: `BCG vers véhicule ${vehicule.nom}`,
        created_by: req.user.id
      });

      await MouvementStock.create({
        article_id: ligne.article_id,
        agence_id: value.vehicule_id,
        type: 'BCG',
        quantite: ligne.quantite,
        reference: bcg.numero,
        reference_id: bcg.id,
        commentaire: `BCG depuis dépôt ${depotSource.nom}`,
        created_by: req.user.id
      });
    }

    res.status(201).json({
      message: 'BCG créé avec succès',
      bcg: bcg.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// Fonction utilitaire pour générer le numéro BCG
async function generateBCGNumber() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  const lastBCG = await BCG.findOne({
    where: {
      numero: {
        [Op.like]: `BCG${year}${month}%`
      }
    },
    order: [['numero', 'DESC']]
  });

  let sequence = 1;
  if (lastBCG) {
    const lastSequence = parseInt(lastBCG.numero.slice(-4));
    sequence = lastSequence + 1;
  }

  return `BCG${year}${month}${String(sequence).padStart(4, '0')}`;
}

module.exports = router;















