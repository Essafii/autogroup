# Schéma de Base de Données - ERP Groupauto

## Vue d'ensemble

Le schéma de base de données de l'ERP Groupauto est conçu pour gérer tous les aspects de la distribution automobile : gestion commerciale, stock, RH & paie, et portail revendeurs.

## Entités Principales

### 1. Gestion des Utilisateurs et Agences

#### Users
- **id**: UUID (PK)
- **email**: String (unique)
- **password**: String (hashé)
- **nom**: String
- **prenom**: String
- **telephone**: String
- **role**: ENUM (admin, comptable, tc, commercial, rh, manager_agence, employe)
- **agence_id**: UUID (FK vers Agences)
- **is_active**: Boolean
- **last_login**: DateTime
- **created_by**: UUID (FK vers Users)

#### Agences
- **id**: UUID (PK)
- **nom**: String
- **code**: String (unique)
- **adresse**: Text
- **ville**: String
- **telephone**: String
- **email**: String
- **is_depot**: Boolean
- **is_vehicule**: Boolean
- **commercial_id**: UUID (FK vers Users)
- **is_active**: Boolean

### 2. Gestion Commerciale

#### Clients
- **id**: UUID (PK)
- **type**: ENUM (particulier, entreprise)
- **nom**: String (pour particuliers)
- **prenom**: String (pour particuliers)
- **raison_sociale**: String (pour entreprises)
- **telephone**: String (unique)
- **email**: String
- **adresse**: Text
- **ville**: String
- **code_postal**: String
- **latitude**: Decimal (GPS)
- **longitude**: Decimal (GPS)
- **type_entreprise**: ENUM (SARL, SA, AE)
- **rc**: String (Registre de Commerce)
- **ice**: String (Identifiant Commun de l'Entreprise)
- **tva**: String (Numéro TVA)
- **is_prospect**: Boolean
- **is_active**: Boolean
- **commercial_id**: UUID (FK vers Users)
- **agence_id**: UUID (FK vers Agences)
- **created_by**: UUID (FK vers Users)

#### Commandes
- **id**: UUID (PK)
- **numero**: String (unique)
- **client_id**: UUID (FK vers Clients)
- **commercial_id**: UUID (FK vers Users)
- **agence_id**: UUID (FK vers Agences)
- **statut**: ENUM (brouillon, validee, livree, facturee, annulee)
- **date_commande**: DateTime
- **date_livraison_souhaitee**: DateTime
- **montant_ht**: Decimal
- **montant_tva**: Decimal
- **montant_ttc**: Decimal
- **remise_montant**: Decimal
- **remise_pourcentage**: Decimal
- **commentaire**: Text
- **encaissement_type**: ENUM (especes, cheque, virement, a_credit)
- **encaissement_montant**: Decimal
- **encaissement_reference**: String
- **encaissement_scan_url**: String
- **is_encaisse**: Boolean
- **date_encaissement**: DateTime
- **bl_id**: UUID (FK vers BonLivraisons)
- **facture_id**: UUID (FK vers Factures)

#### CommandeLignes
- **id**: UUID (PK)
- **commande_id**: UUID (FK vers Commandes)
- **article_id**: UUID (FK vers Articles)
- **quantite**: Integer
- **prix_unitaire**: Decimal
- **remise_pourcentage**: Decimal
- **remise_montant**: Decimal
- **montant_ht**: Decimal
- **montant_ttc**: Decimal
- **commentaire**: Text

#### BonLivraisons
- **id**: UUID (PK)
- **numero**: String (unique)
- **commande_id**: UUID (FK vers Commandes)
- **client_id**: UUID (FK vers Clients)
- **commercial_id**: UUID (FK vers Users)
- **agence_id**: UUID (FK vers Agences)
- **statut**: ENUM (brouillon, valide, livre, facture)
- **date_livraison**: DateTime
- **montant_ht**: Decimal
- **montant_tva**: Decimal
- **montant_ttc**: Decimal
- **is_encaisse**: Boolean
- **date_encaissement**: DateTime
- **commentaire**: Text
- **created_by**: UUID (FK vers Users)

#### Factures
- **id**: UUID (PK)
- **numero**: String (unique)
- **bl_id**: UUID (FK vers BonLivraisons)
- **commande_id**: UUID (FK vers Commandes)
- **client_id**: UUID (FK vers Clients)
- **commercial_id**: UUID (FK vers Users)
- **agence_id**: UUID (FK vers Agences)
- **statut**: ENUM (brouillon, declaree, payee, impayee, annulee)
- **date_facture**: DateTime
- **date_echeance**: DateTime
- **montant_ht**: Decimal
- **montant_tva**: Decimal
- **montant_ttc**: Decimal
- **montant_paye**: Decimal
- **montant_restant**: Decimal
- **is_exporte**: Boolean
- **date_export**: DateTime
- **commentaire**: Text
- **created_by**: UUID (FK vers Users)

### 3. Gestion des Articles et Stock

#### Articles
- **id**: UUID (PK)
- **sku**: String (unique)
- **code_barres**: String (unique)
- **libelle**: String
- **marque**: String
- **famille**: String
- **sous_famille**: String
- **type**: ENUM (piece, accessoire, lubrifiant, pneu, autre)
- **photo**: String (URL)
- **unite**: String
- **pack_size**: Integer
- **prix_public**: Decimal
- **prix_standard**: Decimal
- **cmp**: Decimal (Coût Moyen Pondéré)
- **dernier_prix_achat**: Decimal
- **seuil_min**: Integer
- **seuil_max**: Integer
- **safety_stock**: Integer
- **lead_time**: Integer (en jours)
- **is_active**: Boolean
- **created_by**: UUID (FK vers Users)

#### Stock
- **id**: UUID (PK)
- **article_id**: UUID (FK vers Articles)
- **agence_id**: UUID (FK vers Agences)
- **quantite**: Integer
- **quantite_reservee**: Integer
- **valeur_stock**: Decimal
- **last_movement**: DateTime

#### MouvementStock
- **id**: UUID (PK)
- **article_id**: UUID (FK vers Articles)
- **agence_id**: UUID (FK vers Agences)
- **type**: ENUM (ACHAT, VENTE, TRANSFERT, BCG, BRT, INVENTAIRE, AVOIR_CLIENT)
- **quantite**: Integer
- **prix_unitaire**: Decimal
- **valeur_totale**: Decimal
- **reference**: String
- **reference_id**: UUID
- **commentaire**: Text
- **created_by**: UUID (FK vers Users)

### 4. Gestion des Transferts (BCG/BRT)

#### BCG (Bon de Charge)
- **id**: UUID (PK)
- **numero**: String (unique)
- **depot_source_id**: UUID (FK vers Agences)
- **vehicule_id**: UUID (FK vers Agences)
- **commercial_id**: UUID (FK vers Users)
- **statut**: ENUM (brouillon, charge, retourne)
- **date_charge**: DateTime
- **date_retour**: DateTime
- **commentaire**: Text
- **created_by**: UUID (FK vers Users)

#### BCGLigne
- **id**: UUID (PK)
- **bcg_id**: UUID (FK vers BCG)
- **article_id**: UUID (FK vers Articles)
- **quantite_chargee**: Integer
- **quantite_retournee**: Integer
- **quantite_vendue**: Integer
- **commentaire**: Text

### 5. RH & Paie

#### Employees
- **id**: UUID (PK)
- **user_id**: UUID (FK vers Users, unique)
- **matricule**: String (unique)
- **date_embauche**: Date
- **date_fin_contrat**: Date
- **type_contrat**: ENUM (CDI, CDD, STAGE, FREELANCE)
- **poste**: String
- **departement**: String
- **manager_id**: UUID (FK vers Users)
- **salaire_base**: Decimal
- **salaire_brut**: Decimal
- **is_active**: Boolean
- **created_by**: UUID (FK vers Users)

#### Attendance
- **id**: UUID (PK)
- **employee_id**: UUID (FK vers Employees)
- **date**: Date
- **heure_arrivee**: Time
- **heure_depart**: Time
- **heures_travaillees**: Decimal
- **heures_supplementaires**: Decimal
- **statut**: ENUM (present, absent, retard, depart_anticipe, congé)
- **commentaire**: Text
- **is_approved**: Boolean
- **approved_by**: UUID (FK vers Users)
- **approved_at**: DateTime

#### Leave
- **id**: UUID (PK)
- **employee_id**: UUID (FK vers Employees)
- **type**: ENUM (congé_annuel, congé_maladie, congé_maternite, congé_paternite, congé_exceptionnel, absence_non_justifiee)
- **date_debut**: Date
- **date_fin**: Date
- **nombre_jours**: Integer
- **statut**: ENUM (en_attente, approuve, rejete, annule)
- **motif**: Text
- **justificatif_url**: String
- **approved_by**: UUID (FK vers Users)
- **approved_at**: DateTime
- **commentaire_approbation**: Text

#### Commission
- **id**: UUID (PK)
- **employee_id**: UUID (FK vers Employees)
- **periode**: String (format YYYY-MM)
- **facture_id**: UUID (FK vers Factures)
- **montant_facture**: Decimal
- **taux_commission**: Decimal
- **montant_commission**: Decimal
- **statut**: ENUM (calculee, payee, clawback)
- **date_paiement**: DateTime
- **commentaire**: Text

#### Expense
- **id**: UUID (PK)
- **employee_id**: UUID (FK vers Employees)
- **categorie**: ENUM (carburant, hotel, panier, peages, divers)
- **montant**: Decimal
- **date_depense**: Date
- **description**: Text
- **justificatif_url**: String
- **statut**: ENUM (en_attente, approuve, rejete, paye)
- **approved_by**: UUID (FK vers Users)
- **approved_at**: DateTime
- **commentaire_approbation**: Text
- **date_paiement**: DateTime

## Index et Contraintes

### Index Principaux
- **Users**: email (unique), telephone (unique)
- **Agences**: code (unique)
- **Clients**: telephone (unique)
- **Articles**: sku (unique), code_barres (unique)
- **Stock**: (article_id, agence_id) (unique)
- **Commandes**: numero (unique)
- **Factures**: numero (unique)
- **BCG**: numero (unique)
- **Employees**: matricule (unique), user_id (unique)

### Contraintes de Clés Étrangères
- Toutes les relations sont définies avec des contraintes de clés étrangères
- Suppression en cascade pour les relations parent-enfant
- Contraintes de validation pour les types ENUM

## Optimisations

### Partitioning
- **MouvementStock**: Partitioning par date pour les performances
- **Attendance**: Partitioning par mois pour les données de présence

### Vues Matérialisées
- **Vue Stock Global**: Agrégation des stocks par article
- **Vue CA Mensuel**: Chiffre d'affaires par mois
- **Vue Commissions**: Calcul des commissions par période

## Sécurité

### Rôles et Permissions
- Chaque utilisateur a un rôle défini
- Les permissions sont gérées au niveau application
- Audit trail complet avec created_by et timestamps

### Données Sensibles
- Mots de passe hashés avec bcrypt
- Données GPS optionnelles
- Chiffrement des données sensibles (à implémenter)

## Migration et Maintenance

### Scripts de Migration
- Versioning des schémas avec des migrations Sequelize
- Scripts de données de test dans `database/init.sql`
- Procédures de sauvegarde et restauration

### Monitoring
- Logs d'audit pour toutes les modifications
- Métriques de performance
- Alertes sur les seuils de stock














