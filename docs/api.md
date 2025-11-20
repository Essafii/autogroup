# Documentation API - ERP Groupauto

## Vue d'ensemble

L'API REST de l'ERP Groupauto fournit tous les endpoints nécessaires pour la gestion commerciale, stock, RH & paie, et portail revendeurs.

**Base URL**: `http://localhost:8000/api`

## Authentification

### POST /auth/login
Connexion utilisateur

**Body:**
```json
{
  "email": "user@groupauto.ma",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": "uuid",
    "email": "user@groupauto.ma",
    "nom": "Nom",
    "prenom": "Prénom",
    "role": "commercial",
    "agence": {
      "id": "uuid",
      "nom": "Dépôt Témara"
    }
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### POST /auth/refresh
Rafraîchir le token d'accès

**Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### GET /auth/me
Récupérer les informations de l'utilisateur connecté

**Headers:** `Authorization: Bearer <token>`

### POST /auth/logout
Déconnexion

## Gestion Commerciale

### Clients

#### GET /clients
Récupérer la liste des clients

**Query Parameters:**
- `page`: Numéro de page (défaut: 1)
- `limit`: Nombre d'éléments par page (défaut: 20)
- `search`: Terme de recherche
- `type`: Type de client (particulier, entreprise)
- `is_prospect`: Filtrer les prospects (true/false)

**Response:**
```json
{
  "clients": [
    {
      "id": "uuid",
      "type": "particulier",
      "nom": "Dupont",
      "prenom": "Jean",
      "telephone": "+212600111111",
      "email": "jean.dupont@email.com",
      "ville": "Casablanca",
      "is_prospect": false,
      "commercial": {
        "nom": "Commercial",
        "prenom": "Nom"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

#### POST /clients
Créer un nouveau client

**Body:**
```json
{
  "type": "particulier",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+212600111111",
  "email": "jean.dupont@email.com",
  "adresse": "123 Rue Mohammed V",
  "ville": "Casablanca"
}
```

#### PUT /clients/:id
Modifier un client

#### DELETE /clients/:id
Supprimer un client

#### POST /clients/:id/convert-to-client
Convertir un prospect en client

### Articles

#### GET /articles
Récupérer la liste des articles

**Query Parameters:**
- `page`, `limit`, `search`: Pagination et recherche
- `famille`: Filtrer par famille
- `sous_famille`: Filtrer par sous-famille
- `marque`: Filtrer par marque
- `type`: Filtrer par type
- `sous_seuil`: Filtrer les articles sous seuil (true/false)

**Response:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "sku": "ART001",
      "libelle": "Filtre à huile",
      "marque": "Bosch",
      "famille": "Filtres",
      "prix_public": 150.00,
      "stocks": [
        {
          "agence": {
            "nom": "Dépôt Témara"
          },
          "quantite": 25,
          "quantite_reservee": 5
        }
      ]
    }
  ]
}
```

#### GET /articles/:id
Récupérer un article par ID

#### POST /articles
Créer un nouvel article

#### PUT /articles/:id
Modifier un article

#### GET /articles/:id/mouvements
Récupérer les mouvements de stock d'un article

#### GET /articles/familles/list
Récupérer la liste des familles

#### GET /articles/sous-familles/list
Récupérer la liste des sous-familles

### Commandes

#### GET /commandes
Récupérer la liste des commandes

**Query Parameters:**
- `page`, `limit`, `search`: Pagination et recherche
- `statut`: Filtrer par statut
- `client_id`: Filtrer par client
- `commercial_id`: Filtrer par commercial
- `date_debut`, `date_fin`: Filtrer par période
- `is_encaisse`: Filtrer par encaissement

**Response:**
```json
{
  "commandes": [
    {
      "id": "uuid",
      "numero": "CMD2024120001",
      "client": {
        "nom": "Dupont",
        "prenom": "Jean"
      },
      "commercial": {
        "nom": "Commercial",
        "prenom": "Nom"
      },
      "date_commande": "2024-12-01T10:00:00Z",
      "montant_ttc": 1500.00,
      "statut": "validee",
      "is_encaisse": true,
      "lignes": [
        {
          "article": {
            "libelle": "Filtre à huile"
          },
          "quantite": 2,
          "prix_unitaire": 150.00,
          "montant_ttc": 300.00
        }
      ]
    }
  ]
}
```

#### POST /commandes
Créer une nouvelle commande

**Body:**
```json
{
  "client_id": "uuid",
  "date_livraison_souhaitee": "2024-12-15",
  "commentaire": "Commande urgente",
  "lignes": [
    {
      "article_id": "uuid",
      "quantite": 2,
      "prix_unitaire": 150.00,
      "remise_pourcentage": 5
    }
  ],
  "encaissement_type": "especes",
  "encaissement_montant": 1500.00
}
```

#### PUT /commandes/:id/valider
Valider une commande

## Gestion du Stock

### GET /stock/where
Récupérer la localisation d'un article

**Query Parameters:**
- `article_id`: ID de l'article

**Response:**
```json
{
  "article": {
    "id": "uuid",
    "libelle": "Filtre à huile"
  },
  "stocks": [
    {
      "agence": {
        "nom": "Dépôt Témara"
      },
      "quantite": 25,
      "valeur_stock": 3750.00
    }
  ],
  "totalQuantite": 25,
  "totalValeur": 3750.00
}
```

### GET /stock/seuils
Récupérer les articles sous seuil

**Query Parameters:**
- `agence_id`: Filtrer par agence

### POST /stock/transferts
Effectuer un transfert de stock

**Body:**
```json
{
  "article_id": "uuid",
  "agence_source_id": "uuid",
  "agence_destination_id": "uuid",
  "quantite": 10,
  "commentaire": "Transfert vers véhicule"
}
```

### POST /stock/inventaires
Effectuer un inventaire

**Body:**
```json
{
  "agence_id": "uuid",
  "articles": [
    {
      "article_id": "uuid",
      "quantite_reelle": 25,
      "commentaire": "Inventaire mensuel"
    }
  ]
}
```

### POST /stock/bcg
Créer un Bon de Charge (BCG)

**Body:**
```json
{
  "depot_source_id": "uuid",
  "vehicule_id": "uuid",
  "lignes": [
    {
      "article_id": "uuid",
      "quantite": 5,
      "commentaire": "Stock véhicule"
    }
  ],
  "commentaire": "Chargement véhicule commercial"
}
```

## RH & Paie

### Employés

#### GET /rhep/employees
Récupérer la liste des employés

#### POST /rhep/employees
Créer un nouvel employé

### Présence

#### GET /rhep/attendance
Récupérer les données de présence

#### POST /rhep/attendance
Enregistrer une présence

**Body:**
```json
{
  "employee_id": "uuid",
  "date": "2024-12-01",
  "heure_arrivee": "08:00",
  "heure_depart": "17:00",
  "statut": "present",
  "commentaire": "Journée normale"
}
```

### Congés

#### GET /rhep/leaves
Récupérer les demandes de congés

#### POST /rhep/leaves
Créer une demande de congé

**Body:**
```json
{
  "employee_id": "uuid",
  "type": "congé_annuel",
  "date_debut": "2024-12-15",
  "date_fin": "2024-12-20",
  "motif": "Vacances familiales"
}
```

#### PUT /rhep/leaves/:id/approve
Approuver/rejeter une demande de congé

**Body:**
```json
{
  "approved": true,
  "commentaire_approbation": "Demande approuvée"
}
```

### Commissions

#### GET /rhep/commissions
Récupérer les commissions

#### POST /rhep/commissions/calc
Calculer les commissions pour une période

**Query Parameters:**
- `periode`: Période au format YYYY-MM

### Notes de Frais

#### GET /rhep/expenses
Récupérer les notes de frais

#### POST /rhep/expenses
Créer une note de frais

**Body:**
```json
{
  "employee_id": "uuid",
  "categorie": "carburant",
  "montant": 200.00,
  "date_depense": "2024-12-01",
  "description": "Carburant pour déplacement client",
  "justificatif_url": "https://example.com/receipt.jpg"
}
```

#### PUT /rhep/expenses/:id/approve
Approuver/rejeter une note de frais

## Portail Revendeurs

### Catalogue

#### GET /portal/catalog/familles
Récupérer les familles d'articles

#### GET /portal/catalog/sous-familles
Récupérer les sous-familles

#### GET /portal/catalog/articles
Récupérer les articles du catalogue

**Query Parameters:**
- `page`, `limit`, `search`: Pagination et recherche
- `famille`, `sous_famille`, `marque`: Filtres

**Response:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "sku": "ART001",
      "libelle": "Filtre à huile",
      "marque": "Bosch",
      "famille": "Filtres",
      "prix_public": 150.00,
      "disponible": true
    }
  ]
}
```

#### GET /portal/catalog/articles/:id
Récupérer un article du catalogue

### Authentification

#### POST /portal/otp/request
Demander un code OTP

**Body:**
```json
{
  "telephone": "+212600111111"
}
```

#### POST /portal/otp/verify
Vérifier le code OTP

**Body:**
```json
{
  "telephone": "+212600111111",
  "code": "123456"
}
```

### Commandes

#### POST /portal/checkout
Créer une commande depuis le portail

**Body:**
```json
{
  "client_id": "uuid",
  "articles": [
    {
      "article_id": "uuid",
      "quantite": 2
    }
  ],
  "commentaire": "Commande urgente"
}
```

#### GET /portal/clients/me/commandes
Récupérer les commandes du client connecté

## Codes d'Erreur

### Erreurs d'Authentification
- `TOKEN_REQUIRED`: Token d'accès requis
- `TOKEN_EXPIRED`: Token expiré
- `TOKEN_INVALID`: Token invalide
- `INVALID_CREDENTIALS`: Identifiants incorrects

### Erreurs de Validation
- `VALIDATION_ERROR`: Erreur de validation des données
- `DUPLICATE_ERROR`: Données en doublon
- `FOREIGN_KEY_ERROR`: Référence invalide

### Erreurs Métier
- `CLIENT_NOT_FOUND`: Client non trouvé
- `ARTICLE_NOT_FOUND`: Article non trouvé
- `INSUFFICIENT_STOCK`: Stock insuffisant
- `INSUFFICIENT_PERMISSIONS`: Permissions insuffisantes

## Limites et Quotas

### Rate Limiting
- 100 requêtes par IP toutes les 15 minutes
- 1000 requêtes par utilisateur par heure

### Taille des Fichiers
- Maximum 10MB par fichier uploadé
- Formats acceptés: JPG, PNG, PDF

### Pagination
- Maximum 100 éléments par page
- Pagination par défaut: 20 éléments

## Exemples d'Intégration

### JavaScript/React
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Récupérer les clients
const clients = await api.get('/clients', {
  params: { page: 1, limit: 20, search: 'Dupont' }
});

// Créer une commande
const commande = await api.post('/commandes', {
  client_id: 'uuid',
  lignes: [
    { article_id: 'uuid', quantite: 2, prix_unitaire: 150.00 }
  ]
});
```

### cURL
```bash
# Connexion
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@groupauto.ma","password":"admin123"}'

# Récupérer les articles
curl -X GET "http://localhost:8000/api/articles?page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```















