const express = require('express');
const { Commande, CommandeLigne, Article, Client, Stock, BonLivraison, Facture } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

const router = express.Router();

// Schémas de validation
const commandeSchema = Joi.object({
  client_id: Joi.string().uuid().required(),
  date_livraison_souhaitee: Joi.date().optional(),
  commentaire: Joi.string().optional(),
  lignes: Joi.array().items(
    Joi.object({
      article_id: Joi.string().uuid().required(),
      quantite: Joi.number().integer().min(1).required(),
      prix_unitaire: Joi.number().min(0).required(),
      remise_pourcentage: Joi.number().min(0).max(100).default(0),
      commentaire: Joi.string().optional()
    })
  ).min(1).required(),
  encaissement_type: Joi.string().valid('especes', 'cheque', 'virement', 'a_credit').optional(),
  encaissement_montant: Joi.number().min(0).optional(),
  encaissement_reference: Joi.string().optional(),
  encaissement_scan_url: Joi.string().optional()
});

// GET /api/commandes
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      statut, 
      client_id, 
      commercial_id,
      date_debut,
      date_fin,
      is_encaisse
    } = req.query;
    
    const offset = (page - 1) * limit;

    const where = {};
    
    if (statut) where.statut = statut;
    if (client_id) where.client_id = client_id;
    if (commercial_id) where.commercial_id = commercial_id;
    if (is_encaisse !== undefined) where.is_encaisse = is_encaisse === 'true';
    
    if (date_debut || date_fin) {
      where.date_commande = {};
      if (date_debut) where.date_commande[Op.gte] = new Date(date_debut);
      if (date_fin) where.date_commande[Op.lte] = new Date(date_fin);
    }

    // Filtrage par agence pour les non-admins
    if (req.user.role !== 'admin') {
      where.agence_id = req.user.agence_id;
    }

    const { count, rows: commandes } = await Commande.findAndCountAll({
      where,
      include: [
        'client',
        'commercial',
        'agence',
        'bonLivraison',
        'facture',
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

// GET /api/commandes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const commande = await Commande.findByPk(req.params.id, {
      include: [
        'client',
        'commercial',
        'agence',
        'bonLivraison',
        'facture',
        {
          model: CommandeLigne,
          as: 'lignes',
          include: ['article']
        }
      ]
    });

    if (!commande) {
      return res.status(404).json({
        error: 'Commande non trouvée',
        code: 'COMMANDE_NOT_FOUND'
      });
    }

    res.json({ commande });

  } catch (error) {
    next(error);
  }
});

// POST /api/commandes
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = commandeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données commande invalides',
        details: error.details[0].message
      });
    }

    // Vérifier que le client existe
    const client = await Client.findByPk(value.client_id);
    if (!client) {
      return res.status(404).json({
        error: 'Client non trouvé',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    // Vérifier la disponibilité des articles
    for (const ligne of value.lignes) {
      const article = await Article.findByPk(ligne.article_id);
      if (!article) {
        return res.status(404).json({
          error: `Article ${ligne.article_id} non trouvé`,
          code: 'ARTICLE_NOT_FOUND'
        });
      }

      // Vérifier le stock disponible
      const stock = await Stock.findOne({
        where: {
          article_id: ligne.article_id,
          agence_id: req.user.agence_id
        }
      });

      if (!stock || stock.quantite < ligne.quantite) {
        return res.status(400).json({
          error: `Stock insuffisant pour l'article ${article.libelle}`,
          code: 'INSUFFICIENT_STOCK',
          article: article.libelle,
          stock_disponible: stock ? stock.quantite : 0,
          quantite_demandee: ligne.quantite
        });
      }
    }

    // Générer le numéro de commande
    const numero = await generateCommandeNumber();

    // Calculer les totaux
    let montant_ht = 0;
    let montant_tva = 0;
    const lignes = [];

    for (const ligne of value.lignes) {
      const article = await Article.findByPk(ligne.article_id);
      const remise_montant = (ligne.prix_unitaire * ligne.quantite * ligne.remise_pourcentage) / 100;
      const montant_ligne_ht = (ligne.prix_unitaire * ligne.quantite) - remise_montant;
      
      montant_ht += montant_ligne_ht;
      
      lignes.push({
        article_id: ligne.article_id,
        quantite: ligne.quantite,
        prix_unitaire: ligne.prix_unitaire,
        remise_pourcentage: ligne.remise_pourcentage,
        remise_montant,
        montant_ht: montant_ligne_ht,
        montant_ttc: montant_ligne_ht * 1.2, // TVA 20%
        commentaire: ligne.commentaire
      });
    }

    montant_tva = montant_ht * 0.2; // TVA 20%
    const montant_ttc = montant_ht + montant_tva;

    // Créer la commande
    const commandeData = {
      numero,
      client_id: value.client_id,
      commercial_id: req.user.role === 'commercial' ? req.user.id : value.commercial_id || req.user.id,
      agence_id: req.user.agence_id,
      date_livraison_souhaitee: value.date_livraison_souhaitee,
      montant_ht,
      montant_tva,
      montant_ttc,
      commentaire: value.commentaire,
      encaissement_type: value.encaissement_type,
      encaissement_montant: value.encaissement_montant,
      encaissement_reference: value.encaissement_reference,
      encaissement_scan_url: value.encaissement_scan_url,
      is_encaisse: !!value.encaissement_type,
      date_encaissement: value.encaissement_type ? new Date() : null
    };

    const commande = await Commande.create(commandeData);

    // Créer les lignes de commande
    for (const ligne of lignes) {
      await CommandeLigne.create({
        ...ligne,
        commande_id: commande.id
      });
    }

    // Réserver le stock si encaissé
    if (commande.is_encaisse) {
      for (const ligne of value.lignes) {
        await Stock.decrement('quantite', {
          by: ligne.quantite,
          where: {
            article_id: ligne.article_id,
            agence_id: req.user.agence_id
          }
        });

        await Stock.increment('quantite_reservee', {
          by: ligne.quantite,
          where: {
            article_id: ligne.article_id,
            agence_id: req.user.agence_id
          }
        });
      }
    }

    // Convertir le prospect en client si c'est sa première commande
    if (client.is_prospect && commande.is_encaisse) {
      await client.update({ is_prospect: false });
    }

    const commandeComplete = await Commande.findByPk(commande.id, {
      include: [
        'client',
        'commercial',
        'agence',
        {
          model: CommandeLigne,
          as: 'lignes',
          include: ['article']
        }
      ]
    });

    res.status(201).json({
      message: 'Commande créée avec succès',
      commande: commandeComplete
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/commandes/:id/valider
router.put('/:id/valider', async (req, res, next) => {
  try {
    const commande = await Commande.findByPk(req.params.id, {
      include: ['lignes']
    });

    if (!commande) {
      return res.status(404).json({
        error: 'Commande non trouvée',
        code: 'COMMANDE_NOT_FOUND'
      });
    }

    if (commande.statut !== 'brouillon') {
      return res.status(400).json({
        error: 'Seules les commandes brouillon peuvent être validées',
        code: 'INVALID_STATUS'
      });
    }

    // Vérifier la disponibilité du stock
    for (const ligne of commande.lignes) {
      const stock = await Stock.findOne({
        where: {
          article_id: ligne.article_id,
          agence_id: commande.agence_id
        }
      });

      if (!stock || stock.quantite < ligne.quantite) {
        return res.status(400).json({
          error: `Stock insuffisant pour l'article ${ligne.article.libelle}`,
          code: 'INSUFFICIENT_STOCK'
        });
      }
    }

    // Réserver le stock
    for (const ligne of commande.lignes) {
      await Stock.decrement('quantite', {
        by: ligne.quantite,
        where: {
          article_id: ligne.article_id,
          agence_id: commande.agence_id
        }
      });

      await Stock.increment('quantite_reservee', {
        by: ligne.quantite,
        where: {
          article_id: ligne.article_id,
          agence_id: commande.agence_id
        }
      });
    }

    await commande.update({ statut: 'validee' });

    res.json({
      message: 'Commande validée avec succès',
      commande: commande.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// Fonction utilitaire pour générer le numéro de commande
async function generateCommandeNumber() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  const lastCommande = await Commande.findOne({
    where: {
      numero: {
        [Op.like]: `CMD${year}${month}%`
      }
    },
    order: [['numero', 'DESC']]
  });

  let sequence = 1;
  if (lastCommande) {
    const lastSequence = parseInt(lastCommande.numero.slice(-4));
    sequence = lastSequence + 1;
  }

  return `CMD${year}${month}${String(sequence).padStart(4, '0')}`;
}

module.exports = router;














