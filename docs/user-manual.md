# Manuel Utilisateur - ERP Groupauto

## Table des Matières

1. [Introduction](#introduction)
2. [Connexion et Navigation](#connexion-et-navigation)
3. [Gestion Commerciale](#gestion-commerciale)
4. [Gestion des Articles](#gestion-des-articles)
5. [Gestion des Commandes](#gestion-des-commandes)
6. [Gestion du Stock](#gestion-du-stock)
7. [RH & Paie](#rh--paie)
8. [Portail Revendeurs](#portail-revendeurs)
9. [Rapports et Tableaux de Bord](#rapports-et-tableaux-de-bord)
10. [Dépannage](#dépannage)

## Introduction

L'ERP Groupauto est un système de gestion intégré conçu spécialement pour la distribution automobile. Il comprend :

- **Interface d'Administration** : Gestion complète du système
- **Application Commerciale** : Outil de terrain pour les commerciaux
- **Portail Revendeurs** : Interface pour les clients/garagistes
- **Module RH & Paie** : Gestion du personnel et des salaires

### Rôles et Permissions

| Rôle | Accès | Permissions |
|------|-------|-------------|
| **Admin** | Tout | Configuration, utilisateurs, sauvegardes |
| **Comptable** | Comptabilité | Factures, encaissements, paie |
| **TC** | Logistique | Validation commandes, BL, transferts |
| **Commercial** | Ventes | Commandes, clients, encaissements |
| **RH** | Personnel | Dossiers, congés, commissions |
| **Manager Agence** | Agence | Indicateurs, approbations |
| **Employé** | Self-service | Fiche personnelle, demandes |

## Connexion et Navigation

### Connexion

1. Accéder à l'URL de l'application
2. Saisir votre email et mot de passe
3. Cliquer sur "Se connecter"

**Comptes par défaut :**
- Admin : admin@groupauto.ma / admin123
- Commercial : commercial@groupauto.ma / commercial123

### Navigation

#### Interface Admin
- **Dashboard** : Vue d'ensemble et statistiques
- **Clients** : Gestion des clients et prospects
- **Articles** : Catalogue et gestion des produits
- **Commandes** : Suivi des commandes
- **Stock** : Gestion des stocks et transferts
- **RH & Paie** : Gestion du personnel

#### Application Commerciale (PWA)
- **Accueil** : Vue d'ensemble commerciale
- **Nouvelle Commande** : Création de commandes
- **Clients** : Gestion des clients
- **Catalogue** : Consultation des articles
- **Mes Commandes** : Suivi des commandes

## Gestion Commerciale

### Création de Clients

#### Client Particulier
1. Aller dans **Clients > Nouveau Client**
2. Sélectionner "Particulier"
3. Remplir :
   - Nom et Prénom (obligatoire)
   - Téléphone (obligatoire, format +212/0)
   - Email, adresse, ville
4. Cliquer "Enregistrer"

#### Client Entreprise
1. Sélectionner "Entreprise"
2. Remplir :
   - Raison sociale (obligatoire)
   - Téléphone (obligatoire)
   - Type d'entreprise (SARL/SA/AE)
   - RC, ICE, TVA (si applicable)
3. Cliquer "Enregistrer"

#### Conversion Prospect → Client
1. Dans la liste des clients, filtrer "Prospects"
2. Cliquer sur "Convertir" pour le prospect souhaité
3. Confirmer la conversion

### Gestion des Prospects

- **Création automatique** : Lors de la création d'une commande
- **Conversion manuelle** : Bouton "Convertir" dans la liste
- **Conversion automatique** : À la première commande encaissée

## Gestion des Articles

### Création d'Article

1. Aller dans **Articles > Nouvel Article**
2. Remplir les informations :
   - **SKU** : Code unique (obligatoire)
   - **Libellé** : Nom du produit
   - **Marque** : Fabricant
   - **Famille/Sous-famille** : Classification
   - **Type** : Pièce, accessoire, lubrifiant, etc.
   - **Prix** : Prix public et standard
   - **Stock** : Seuils min/max, safety stock
3. Cliquer "Enregistrer"

### Gestion des Prix

- **Prix Public** : Prix de vente standard
- **Prix Standard** : Prix de référence
- **CMP** : Coût Moyen Pondéré (calculé automatiquement)
- **Dernier Prix d'Achat** : Prix du dernier achat

### Équivalents Multi-Marques

1. Sélectionner l'article principal
2. Aller dans "Équivalents"
3. Ajouter les articles équivalents
4. Définir la priorité de substitution

## Gestion des Commandes

### Création de Commande

#### Depuis l'Interface Admin
1. Aller dans **Commandes > Nouvelle Commande**
2. Sélectionner le client
3. Ajouter les articles :
   - Rechercher par SKU, libellé ou marque
   - Saisir la quantité
   - Ajuster le prix si nécessaire
4. Configurer l'encaissement :
   - Espèces : Montant exact
   - Chèque : N° + banque + photo
   - À crédit : Pas d'encaissement
5. Cliquer "Enregistrer"

#### Depuis l'App Commerciale
1. Ouvrir l'application mobile
2. Aller dans "Nouvelle Commande"
3. Scanner le code-barres ou rechercher l'article
4. Saisir la quantité
5. Prendre la photo du chèque si nécessaire
6. Envoyer la commande

### Validation des Commandes

1. **TC** : Valide la commande
   - Vérifie la disponibilité du stock
   - Réserve les quantités
   - Change le statut à "Validée"

2. **Comptable** : Crée le BL puis la facture
   - Génère le Bon de Livraison
   - Transforme en facture
   - Déclare à la comptabilité

### Encaissements

#### Espèces
- Saisir le montant exact
- Le système valide automatiquement

#### Chèque
- Saisir le numéro de chèque
- Indiquer la banque
- Prendre une photo du chèque
- Le système génère un QR code de vérification

#### Virement
- Saisir la référence du virement
- Attendre la confirmation bancaire

## Gestion du Stock

### Vue d'Ensemble

1. Aller dans **Stock**
2. Consulter les onglets :
   - **Articles sous Seuil** : Alertes de réapprovisionnement
   - **Mouvements** : Historique des entrées/sorties
   - **Transferts** : Transferts entre dépôts
   - **BCG/BRT** : Gestion des véhicules commerciaux

### Transferts entre Dépôts

1. Aller dans **Stock > Transfert**
2. Sélectionner :
   - Article à transférer
   - Dépôt source
   - Dépôt destination
   - Quantité
3. Ajouter un commentaire
4. Confirmer le transfert

### Inventaires

1. Aller dans **Stock > Inventaire**
2. Sélectionner l'agence
3. Pour chaque article :
   - Saisir la quantité réelle
   - Ajouter un commentaire si écart
4. Valider l'inventaire
5. Le système calcule automatiquement les écarts

### BCG (Bon de Charge)

1. Aller dans **Stock > BCG**
2. Sélectionner :
   - Dépôt source
   - Véhicule commercial
3. Ajouter les articles à charger
4. Confirmer le chargement
5. Le commercial peut maintenant vendre ces articles

### BRT (Bon de Retour)

1. Depuis un BCG existant
2. Cliquer "Créer BRT"
3. Le système propose les articles chargés
4. Saisir les quantités retournées
5. Confirmer le retour

## RH & Paie

### Gestion du Personnel

#### Création d'Employé
1. Aller dans **RH & Paie > Employés**
2. Cliquer "Nouvel Employé"
3. Remplir :
   - Informations personnelles
   - Matricule (unique)
   - Poste et département
   - Contrat et salaire
   - Manager hiérarchique
4. Enregistrer

#### Présence et Pointage
1. **Import automatique** : Depuis la pointeuse Hikvision
2. **Saisie manuelle** : En cas de problème
3. **Corrections** : Avec approbation du manager

### Gestion des Congés

#### Demande de Congé
1. L'employé se connecte
2. Aller dans "Mes Congés"
3. Cliquer "Nouvelle Demande"
4. Remplir :
   - Type de congé
   - Dates de début/fin
   - Motif
   - Justificatif (si nécessaire)
5. Envoyer la demande

#### Approbation
1. Le manager reçoit la notification
2. Consulter la demande
3. Approuver ou rejeter
4. Ajouter un commentaire si nécessaire

### Commissions

#### Calcul Automatique
1. Le système calcule les commissions mensuellement
2. Basé sur les factures encaissées
3. Selon les barèmes définis par profil

#### Barèmes de Commission
- **Tranche 1** : 0-10 000 MAD → 1%
- **Tranche 2** : 10 000-50 000 MAD → 1.5%
- **Tranche 3** : >50 000 MAD → 2%

#### Clawback
- Commission récupérée si facture impayée
- Calculée automatiquement

### Notes de Frais

#### Création
1. L'employé se connecte
2. Aller dans "Mes Frais"
3. Cliquer "Nouvelle Note"
4. Remplir :
   - Catégorie (carburant, hôtel, etc.)
   - Montant et date
   - Description
   - Photo du justificatif
5. Envoyer pour approbation

#### Approbation
1. Le manager valide la note
2. Le comptable intègre en paie
3. Paiement lors de la paie suivante

## Portail Revendeurs

### Accès

1. Aller sur le portail revendeurs
2. Saisir le numéro de téléphone
3. Recevoir le code OTP par SMS
4. Saisir le code pour se connecter

### Navigation

- **Commander** : Créer une nouvelle commande
- **Offres** : Voir les promotions
- **Mes Commandes** : Historique des commandes

### Catalogue

1. Parcourir par famille/sous-famille
2. Utiliser la recherche
3. Voir les détails de l'article
4. Vérifier la disponibilité (🟢/🔴)

### Commande

1. Ajouter les articles au panier
2. Vérifier les quantités
3. Ajouter un commentaire
4. Confirmer la commande
5. Recevoir la confirmation par WhatsApp/SMS

## Rapports et Tableaux de Bord

### Dashboard Commercial

- **Indicateurs clés** :
  - Nombre de commandes
  - Chiffre d'affaires
  - Taux de conversion
  - Panier moyen
  - Clients uniques

### Dashboard Stock

- **Alertes** :
  - Articles sous seuil
  - Transferts en transit
  - Véhicules à recharger

### Dashboard Comptable

- **Suivi** :
  - Factures à déclarer
  - BL non encaissés
  - Journal des ventes

### Dashboard RH

- **Personnel** :
  - Présents/absents
  - Congés en cours
  - Commissions à payer

## Dépannage

### Problèmes Courants

#### Connexion Impossible
1. Vérifier l'email et mot de passe
2. Contacter l'administrateur
3. Vérifier la connexion internet

#### Commande Ne Se Valide Pas
1. Vérifier la disponibilité du stock
2. Contacter le TC
3. Vérifier les permissions

#### Erreur de Stock
1. Vérifier les mouvements récents
2. Contacter l'administrateur
3. Effectuer un inventaire

#### Problème de Commission
1. Vérifier les factures encaissées
2. Contacter le service RH
3. Vérifier le barème applicable

### Contacts Support

- **Support Technique** : support@groupauto.ma
- **Commercial** : commercial@groupauto.ma
- **RH** : rh@groupauto.ma
- **Urgences** : +212 600 000 000

### Formation

- **Manuels détaillés** : Disponibles dans l'interface
- **Formation en ligne** : Vidéos tutoriels
- **Support personnalisé** : Sur demande

---

*Dernière mise à jour : Décembre 2024*
*Version : 1.0.0*














