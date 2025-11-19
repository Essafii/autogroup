const express = require('express');
const { Client } = require('../models');
const Joi = require('joi');

const router = express.Router();

// Schémas de validation
const clientSchema = Joi.object({
  type: Joi.string().valid('particulier', 'entreprise').required(),
  nom: Joi.string().when('type', {
    is: 'particulier',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  prenom: Joi.string().when('type', {
    is: 'particulier',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  raison_sociale: Joi.string().when('type', {
    is: 'entreprise',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  telephone: Joi.string().pattern(/^(\+212|0)[0-9]{9}$/).required(),
  email: Joi.string().email().optional(),
  adresse: Joi.string().optional(),
  ville: Joi.string().optional(),
  code_postal: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  type_entreprise: Joi.string().valid('SARL', 'SA', 'AE').when('type', {
    is: 'entreprise',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  rc: Joi.string().when('type', {
    is: 'entreprise',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  ice: Joi.string().when('type', {
    is: 'entreprise',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  tva: Joi.string().when('type', {
    is: 'entreprise',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  })
});

// GET /api/clients
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, type, is_prospect } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { nom: { [Op.iLike]: `%${search}%` } },
        { prenom: { [Op.iLike]: `%${search}%` } },
        { raison_sociale: { [Op.iLike]: `%${search}%` } },
        { telephone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (type) where.type = type;
    if (is_prospect !== undefined) where.is_prospect = is_prospect === 'true';

    const { count, rows: clients } = await Client.findAndCountAll({
      where,
      include: ['commercial', 'agence'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      clients,
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

// GET /api/clients/:id
router.get('/:id', async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: ['commercial', 'agence', 'commandes']
    });

    if (!client) {
      return res.status(404).json({
        error: 'Client non trouvé',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    res.json({ client });

  } catch (error) {
    next(error);
  }
});

// POST /api/clients
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = clientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données client invalides',
        details: error.details[0].message
      });
    }

    // Vérifier les doublons par téléphone
    const existingClient = await Client.findOne({
      where: { telephone: value.telephone }
    });

    if (existingClient) {
      return res.status(409).json({
        error: 'Un client avec ce numéro de téléphone existe déjà',
        code: 'DUPLICATE_PHONE',
        existingClient: existingClient.toJSON()
      });
    }

    const clientData = {
      ...value,
      commercial_id: req.user.role === 'commercial' ? req.user.id : value.commercial_id,
      agence_id: req.user.agence_id,
      created_by: req.user.id
    };

    const client = await Client.create(clientData);

    res.status(201).json({
      message: 'Client créé avec succès',
      client: client.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/clients/:id
router.put('/:id', async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({
        error: 'Client non trouvé',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    const { error, value } = clientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données client invalides',
        details: error.details[0].message
      });
    }

    await client.update(value);

    res.json({
      message: 'Client mis à jour avec succès',
      client: client.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/clients/:id/convert-to-client
router.post('/:id/convert-to-client', async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({
        error: 'Client non trouvé',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    if (!client.is_prospect) {
      return res.status(400).json({
        error: 'Ce client n\'est pas un prospect',
        code: 'NOT_A_PROSPECT'
      });
    }

    await client.update({ is_prospect: false });

    res.json({
      message: 'Prospect converti en client avec succès',
      client: client.toJSON()
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /api/clients/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({
        error: 'Client non trouvé',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    // Vérifier s'il y a des commandes associées
    const commandesCount = await client.countCommandes();
    if (commandesCount > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer un client avec des commandes',
        code: 'CLIENT_HAS_ORDERS',
        commandesCount
      });
    }

    await client.update({ is_active: false });

    res.json({
      message: 'Client désactivé avec succès'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;














