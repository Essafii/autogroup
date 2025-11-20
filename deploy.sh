#!/bin/bash
# ============================================
# Script de déploiement automatique
# Groupauto ERP - VPS Ubuntu
# ============================================

set -e  # Arrêter en cas d'erreur

echo "========================================="
echo "Déploiement Groupauto ERP"
echo "========================================="

# Variables
APP_DIR="/var/www/site2"
BACKEND_DIR="$APP_DIR/backend"
REPO_URL="https://github.com/Essafii/autogroup.git"
DOMAIN=""  # Sera demandé plus tard

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Vérifier que nous sommes root ou sudo
if [ "$EUID" -ne 0 ]; then 
    error "Veuillez exécuter ce script avec sudo"
fi

# ============================================
# ÉTAPE 1: Installation des dépendances système
# ============================================
info "Vérification des dépendances système..."

# Node.js
if ! command -v node &> /dev/null; then
    info "Installation de Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    info "Node.js déjà installé: $(node --version)"
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    info "Installation de PM2..."
    npm install -g pm2
else
    info "PM2 déjà installé"
fi

# Nginx
if ! command -v nginx &> /dev/null; then
    info "Installation de Nginx..."
    apt-get update
    apt-get install -y nginx
    systemctl enable nginx
    systemctl start nginx
else
    info "Nginx déjà installé"
fi

# Certbot
if ! command -v certbot &> /dev/null; then
    info "Installation de Certbot..."
    apt-get install -y certbot python3-certbot-nginx
else
    info "Certbot déjà installé"
fi

# PostgreSQL
if ! command -v psql &> /dev/null; then
    info "Installation de PostgreSQL..."
    apt-get install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
else
    info "PostgreSQL déjà installé"
fi

# ============================================
# ÉTAPE 2: Cloner le repository
# ============================================
info "Clonage du repository..."

if [ -d "$APP_DIR" ]; then
    warning "Le répertoire $APP_DIR existe déjà"
    read -p "Voulez-vous le supprimer et recommencer? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$APP_DIR"
    else
        info "Mise à jour du repository existant..."
        cd "$APP_DIR"
        git pull origin main || error "Erreur lors du git pull"
        cd - > /dev/null
    fi
fi

if [ ! -d "$APP_DIR" ]; then
    mkdir -p "$APP_DIR"
    git clone "$REPO_URL" "$APP_DIR" || error "Erreur lors du clonage"
fi

# ============================================
# ÉTAPE 3: Installation des dépendances Node.js
# ============================================
info "Installation des dépendances Node.js..."
cd "$BACKEND_DIR"
npm install --production || error "Erreur lors de npm install"

# ============================================
# ÉTAPE 4: Configuration de la base de données
# ============================================
info "Configuration de la base de données PostgreSQL..."

read -p "Nom de la base de données (défaut: groupauto_erp): " DB_NAME
DB_NAME=${DB_NAME:-groupauto_erp}

read -p "Nom d'utilisateur PostgreSQL (défaut: groupauto): " DB_USER
DB_USER=${DB_USER:-groupauto}

read -sp "Mot de passe PostgreSQL: " DB_PASS
echo

# Créer la base de données et l'utilisateur
sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

info "Base de données créée: $DB_NAME"

# ============================================
# ÉTAPE 5: Configuration du fichier .env
# ============================================
info "Configuration du fichier .env..."

# Générer les secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Demander le domaine
read -p "Votre domaine (ex: example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    error "Le domaine est obligatoire"
fi

# Créer le fichier .env
cat > "$BACKEND_DIR/.env" <<EOF
# Configuration Production - Groupauto ERP
# Généré automatiquement le $(date)

# Base de données
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME

# Serveur
NODE_ENV=production
PORT=4001

# Sécurité
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET

# CORS
ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Logs
LOG_LEVEL=info
LOG_FILE=./logs/app.log
EOF

info "Fichier .env créé"

# Créer les répertoires nécessaires
mkdir -p "$BACKEND_DIR/uploads"
mkdir -p "$BACKEND_DIR/logs"
chown -R $SUDO_USER:$SUDO_USER "$BACKEND_DIR/uploads"
chown -R $SUDO_USER:$SUDO_USER "$BACKEND_DIR/logs"

# ============================================
# ÉTAPE 6: Synchronisation de la base de données
# ============================================
info "Synchronisation de la base de données..."
cd "$BACKEND_DIR"
# Note: En production, utilisez des migrations plutôt que sync
# Pour l'instant, on laisse Sequelize créer les tables
NODE_ENV=production node -e "
const { sequelize } = require('./src/database/connection');
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion DB OK');
    // En production, ne pas utiliser sync, utiliser des migrations
    // sequelize.sync({ alter: true });
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur DB:', err);
    process.exit(1);
  });
" || warning "Vérifiez manuellement la connexion à la base de données"

# ============================================
# ÉTAPE 7: Configuration PM2
# ============================================
info "Configuration de PM2..."

cd "$BACKEND_DIR"
pm2 start ecosystem.config.js || error "Erreur lors du démarrage PM2"
pm2 save
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER || warning "PM2 startup déjà configuré"

info "Application démarrée avec PM2"
pm2 status

# ============================================
# ÉTAPE 8: Configuration Nginx
# ============================================
info "Configuration de Nginx..."

# Remplacer VOTRE_DOMAINE dans le fichier de config
sed "s/VOTRE_DOMAINE/$DOMAIN/g" "$APP_DIR/nginx-groupauto.conf" > /etc/nginx/sites-available/groupauto

# Créer le lien symbolique
ln -sf /etc/nginx/sites-available/groupauto /etc/nginx/sites-enabled/groupauto

# Supprimer la config par défaut si elle existe
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
nginx -t || error "Erreur dans la configuration Nginx"

# Redémarrer Nginx
systemctl reload nginx

info "Nginx configuré pour $DOMAIN"

# ============================================
# ÉTAPE 9: Configuration SSL avec Certbot
# ============================================
info "Configuration SSL avec Certbot..."

read -p "Voulez-vous installer SSL maintenant? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" || warning "Erreur lors de l'installation SSL. Vous pouvez le faire manuellement plus tard avec: certbot --nginx -d $DOMAIN"
    
    # Mettre à jour Nginx pour forcer HTTPS
    sed -i 's/# return 301 https/return 301 https/' /etc/nginx/sites-available/groupauto
    systemctl reload nginx
    
    info "SSL installé avec succès"
else
    warning "SSL non installé. Installez-le plus tard avec: certbot --nginx -d $DOMAIN"
fi

# ============================================
# ÉTAPE 10: Configuration du firewall
# ============================================
info "Configuration du firewall..."

if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable || warning "UFW déjà configuré"
    info "Firewall configuré"
fi

# ============================================
# RÉSUMÉ
# ============================================
echo ""
echo "========================================="
echo "✅ Déploiement terminé avec succès!"
echo "========================================="
echo ""
echo "📋 Informations importantes:"
echo "   - Application: http://$DOMAIN (ou https:// si SSL installé)"
echo "   - Port PM2: 4001"
echo "   - Répertoire: $APP_DIR"
echo "   - Base de données: $DB_NAME"
echo ""
echo "🔧 Commandes utiles:"
echo "   - Voir les logs: pm2 logs groupauto-erp"
echo "   - Redémarrer: pm2 restart groupauto-erp"
echo "   - Statut: pm2 status"
echo "   - Mettre à jour: cd $APP_DIR && git pull && cd backend && npm install && pm2 restart groupauto-erp"
echo ""
echo "📝 Fichiers importants:"
echo "   - .env: $BACKEND_DIR/.env"
echo "   - Logs PM2: $BACKEND_DIR/logs/"
echo "   - Config Nginx: /etc/nginx/sites-available/groupauto"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Vérifiez que le fichier .env contient les bonnes valeurs"
echo "   - Testez l'application: curl http://localhost:4001/health"
echo "   - Vérifiez les logs: pm2 logs groupauto-erp"
echo ""


