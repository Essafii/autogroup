# Guide de Déploiement - Groupauto ERP

Ce guide vous permet de déployer l'application Groupauto ERP sur un VPS Linux.

## Prérequis

- VPS Linux (Ubuntu 20.04+ recommandé)
- Accès root ou utilisateur avec sudo
- Nom de domaine configuré pointant vers votre VPS
- Ports 80, 443 et 4001 ouverts

## Étape 1 : Préparation du serveur

### Mettre à jour le système
```bash
sudo apt update && sudo apt upgrade -y
```

### Installer Node.js (version 18+)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Vérifier la version
```

### Installer PM2 (gestionnaire de processus)
```bash
sudo npm install -g pm2
```

### Installer Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Installer Certbot (pour SSL)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

## Étape 2 : Cloner le projet

```bash
# Créer le répertoire
sudo mkdir -p /var/www/site2
sudo chown -R $USER:$USER /var/www/site2

# Cloner le repository
cd /var/www/site2
git clone https://github.com/Essafii/autogroup.git .

# Ou si le repo existe déjà, faire un pull
# git pull origin main
```

## Étape 3 : Configuration de l'application

### Installer les dépendances
```bash
cd /var/www/site2/backend
npm install --production
```

### Créer le fichier .env
```bash
cd /var/www/site2/backend
cp env.example .env
nano .env
```

**Configuration minimale du .env :**
```env
# Port de l'application
PORT=4001

# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/groupauto_db
# OU pour SQLite (développement uniquement)
# DATABASE_URL=sqlite:./dev.sqlite

# JWT Secret (générer une clé aléatoire)
JWT_SECRET=votre_cle_secrete_tres_longue_et_aleatoire_ici

# Session Secret
SESSION_SECRET=votre_session_secret_aleatoire_ici

# CORS - Autoriser votre domaine
ALLOWED_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com

# Environnement
NODE_ENV=production
```

**Générer des secrets aléatoires :**
```bash
# Pour JWT_SECRET
openssl rand -base64 32

# Pour SESSION_SECRET
openssl rand -base64 32
```

### Initialiser la base de données

Si vous utilisez PostgreSQL :
```bash
# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE groupauto_db;
CREATE USER groupauto_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE groupauto_db TO groupauto_user;
\q
```

Puis synchroniser les modèles :
```bash
cd /var/www/site2/backend
npm run migrate  # Si vous avez un script de migration
# OU lancer l'app qui synchronisera automatiquement en dev (désactiver en production)
```

## Étape 4 : Lancer l'application avec PM2

```bash
cd /var/www/site2/backend

# Lancer l'application
pm2 start src/server.js --name "groupauto-erp" --env production

# Configurer PM2 pour démarrer au boot
pm2 startup
pm2 save

# Vérifier le statut
pm2 status
pm2 logs groupauto-erp
```

**Note :** L'application écoute sur le port 4001 (configuré dans .env ou PORT=4001).

## Étape 5 : Configuration Nginx

### Créer la configuration Nginx
```bash
sudo nano /etc/nginx/sites-available/groupauto
```

**Contenu de la configuration :**
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Redirection vers HTTPS (après installation SSL)
    # return 301 https://$server_name$request_uri;

    # Pour l'instant, proxy vers l'application
    location / {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Taille maximale des uploads
    client_max_body_size 10M;
}
```

### Activer le site
```bash
sudo ln -s /etc/nginx/sites-available/groupauto /etc/nginx/sites-enabled/
sudo nginx -t  # Tester la configuration
sudo systemctl reload nginx
```

## Étape 6 : Configuration SSL avec Certbot

```bash
# Obtenir le certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Certbot configurera automatiquement Nginx pour HTTPS
# Renouvellement automatique
sudo certbot renew --dry-run
```

**Après SSL, mettre à jour Nginx pour forcer HTTPS :**
Décommenter la ligne `return 301 https://$server_name$request_uri;` dans la config Nginx.

## Étape 7 : Configuration du firewall

```bash
# Autoriser les ports nécessaires
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Étape 8 : Vérification

1. **Vérifier que l'application tourne :**
   ```bash
   pm2 status
   curl http://localhost:4001/health
   ```

2. **Vérifier Nginx :**
   ```bash
   sudo systemctl status nginx
   ```

3. **Tester depuis le navigateur :**
   - Accéder à `http://votre-domaine.com` (devrait rediriger vers HTTPS)
   - Vérifier que l'application répond

## Commandes utiles

### PM2
```bash
pm2 restart groupauto-erp    # Redémarrer
pm2 stop groupauto-erp       # Arrêter
pm2 logs groupauto-erp       # Voir les logs
pm2 monit                    # Monitoring en temps réel
```

### Nginx
```bash
sudo systemctl restart nginx
sudo nginx -t                # Tester la config
sudo tail -f /var/log/nginx/error.log
```

### Mise à jour du code
```bash
cd /var/www/site2
git pull origin main
cd backend
npm install --production
pm2 restart groupauto-erp
```

## Dépannage

### L'application ne démarre pas
- Vérifier les logs : `pm2 logs groupauto-erp`
- Vérifier le fichier .env
- Vérifier que le port 4001 n'est pas utilisé : `sudo lsof -i :4001`

### Erreur 502 Bad Gateway
- Vérifier que PM2 tourne : `pm2 status`
- Vérifier que l'app écoute sur le bon port
- Vérifier les logs Nginx : `sudo tail -f /var/log/nginx/error.log`

### Problème de base de données
- Vérifier la connexion : `psql -U groupauto_user -d groupauto_db`
- Vérifier les variables d'environnement DATABASE_URL

## Sécurité

1. **Ne jamais commiter le fichier .env**
2. **Utiliser des mots de passe forts pour la base de données**
3. **Configurer un firewall (UFW)**
4. **Mettre à jour régulièrement le système**
5. **Configurer des backups automatiques de la base de données**

## Backups

### Script de backup automatique (à ajouter dans crontab)
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/groupauto"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup base de données PostgreSQL
pg_dump -U groupauto_user groupauto_db > $BACKUP_DIR/db_$DATE.sql

# Backup fichiers uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/site2/backend/uploads

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## Support

En cas de problème, vérifier :
- Les logs PM2 : `pm2 logs`
- Les logs Nginx : `/var/log/nginx/`
- Les logs système : `journalctl -u nginx`

