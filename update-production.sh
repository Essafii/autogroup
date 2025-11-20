#!/bin/bash
# Script de mise à jour pour le serveur de production
# À exécuter sur le VPS: sudo bash update-production.sh

set -e

echo "🔄 Mise à jour du projet Groupauto ERP..."

# Aller dans le répertoire du projet
cd /var/www/site2

# Mettre à jour depuis GitHub
echo "📥 Récupération des dernières modifications..."
git pull origin main

# Mettre à jour les dépendances backend
echo "📦 Mise à jour des dépendances backend..."
cd backend
npm install --production

# Mettre à jour les dépendances frontend portal
echo "📦 Mise à jour des dépendances frontend portal..."
cd ../frontend/portal
npm install

# Rebuild le frontend portal
echo "🔨 Build du frontend portal..."
npm run build

# Redémarrer PM2
echo "🔄 Redémarrage du backend..."
pm2 restart groupauto-erp

# Recharger Nginx
echo "🔄 Rechargement de Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Mise à jour terminée avec succès!"
echo ""
echo "📊 Statut:"
pm2 status
echo ""
echo "🔍 Vérification:"
echo "  - Backend: http://localhost:4001/health"
echo "  - Frontend: https://groupauto.ma"

