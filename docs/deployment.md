# Guide de Déploiement - ERP Groupauto

## Vue d'ensemble

Ce guide décrit le déploiement de l'ERP Groupauto en utilisant Docker Compose pour un environnement de production.

## Prérequis

### Système
- Docker 20.10+
- Docker Compose 2.0+
- 8GB RAM minimum
- 50GB d'espace disque
- Ubuntu 20.04+ / CentOS 8+ / Windows 10+

### Réseau
- Ports 80, 443, 5432, 6379, 8000 disponibles
- Accès internet pour les mises à jour

## Installation

### 1. Cloner le Repository

```bash
git clone <repository-url>
cd erp-auto-group
```

### 2. Configuration de l'Environnement

```bash
# Copier le fichier d'environnement
cp backend/env.example backend/.env

# Éditer la configuration
nano backend/.env
```

**Configuration minimale requise :**
```env
# Base de données
DATABASE_URL=postgresql://groupauto:groupauto2025@postgres:5432/groupauto_erp

# JWT (CHANGER EN PRODUCTION)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# Serveur
NODE_ENV=production
PORT=8000

# CORS
ALLOWED_ORIGINS=https://admin.groupauto.ma,https://commercial.groupauto.ma,https://portal.groupauto.ma
```

### 3. Configuration SSL (Production)

```bash
# Créer le dossier SSL
mkdir -p nginx/ssl

# Générer les certificats SSL (Let's Encrypt recommandé)
certbot certonly --standalone -d admin.groupauto.ma
certbot certonly --standalone -d commercial.groupauto.ma
certbot certonly --standalone -d portal.groupauto.ma
certbot certonly --standalone -d api.groupauto.ma

# Copier les certificats
cp /etc/letsencrypt/live/admin.groupauto.ma/* nginx/ssl/
```

### 4. Déploiement

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f
```

## Configuration DNS

### Enregistrements DNS requis

```
admin.groupauto.ma     A    <IP_SERVEUR>
commercial.groupauto.ma A   <IP_SERVEUR>
portal.groupauto.ma    A    <IP_SERVEUR>
api.groupauto.ma       A    <IP_SERVEUR>
```

### Configuration Hosts (Développement)

```bash
# Ajouter à /etc/hosts
127.0.0.1 admin.groupauto.local
127.0.0.1 commercial.groupauto.local
127.0.0.1 portal.groupauto.local
127.0.0.1 api.groupauto.local
```

## Accès aux Applications

### URLs de Production
- **Interface Admin**: https://admin.groupauto.ma
- **Application Commerciale**: https://commercial.groupauto.ma
- **Portail Revendeurs**: https://portal.groupauto.ma
- **API**: https://api.groupauto.ma

### URLs de Développement
- **Interface Admin**: http://admin.groupauto.local
- **Application Commerciale**: http://commercial.groupauto.local
- **Portail Revendeurs**: http://portal.groupauto.local
- **API**: http://api.groupauto.local

## Configuration Initiale

### 1. Connexion Admin

1. Accéder à l'interface admin
2. Se connecter avec :
   - **Email**: admin@groupauto.ma
   - **Mot de passe**: admin123

### 2. Configuration des Agences

1. Aller dans **Configuration > Agences**
2. Vérifier les agences créées automatiquement
3. Ajouter/modifier selon les besoins

### 3. Import des Données

```bash
# Exécuter les scripts d'initialisation
docker-compose exec api npm run seed

# Ou manuellement via l'interface admin
```

## Monitoring et Maintenance

### 1. Logs

```bash
# Voir tous les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f api
docker-compose logs -f postgres
```

### 2. Sauvegardes

#### Sauvegarde Base de Données

```bash
# Sauvegarde complète
docker-compose exec postgres pg_dump -U groupauto groupauto_erp > backup_$(date +%Y%m%d_%H%M%S).sql

# Sauvegarde automatique (cron)
0 2 * * * cd /path/to/erp-auto-group && docker-compose exec -T postgres pg_dump -U groupauto groupauto_erp > /backups/groupauto_$(date +\%Y\%m\%d).sql
```

#### Sauvegarde Fichiers

```bash
# Sauvegarder les uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Sauvegarder la configuration
tar -czf config_backup_$(date +%Y%m%d).tar.gz nginx/ backend/.env
```

### 3. Mises à Jour

```bash
# Arrêter les services
docker-compose down

# Récupérer les dernières modifications
git pull origin main

# Reconstruire et redémarrer
docker-compose up -d --build

# Vérifier le statut
docker-compose ps
```

### 4. Surveillance des Performances

```bash
# Utilisation des ressources
docker stats

# Espace disque
df -h

# Logs d'erreur
docker-compose logs | grep ERROR
```

## Sécurité

### 1. Configuration Firewall

```bash
# UFW (Ubuntu)
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# iptables
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -j DROP
```

### 2. Mots de Passe

```bash
# Changer le mot de passe admin par défaut
docker-compose exec api node -e "
const bcrypt = require('bcryptjs');
const newPassword = bcrypt.hashSync('nouveau_mot_de_passe', 12);
console.log('Nouveau hash:', newPassword);
"
```

### 3. Certificats SSL

```bash
# Renouvellement automatique (cron)
0 3 * * 0 certbot renew --quiet && docker-compose restart nginx
```

## Dépannage

### Problèmes Courants

#### 1. Service ne démarre pas

```bash
# Vérifier les logs
docker-compose logs <service_name>

# Redémarrer un service
docker-compose restart <service_name>

# Reconstruire un service
docker-compose up -d --build <service_name>
```

#### 2. Erreur de Base de Données

```bash
# Vérifier la connexion
docker-compose exec postgres psql -U groupauto -d groupauto_erp -c "SELECT 1;"

# Réinitialiser la base
docker-compose down
docker volume rm erp-auto-group_postgres_data
docker-compose up -d
```

#### 3. Problème de Permissions

```bash
# Corriger les permissions
sudo chown -R 1000:1000 uploads/
sudo chmod -R 755 uploads/
```

### Logs d'Erreur

```bash
# Logs d'erreur de l'API
docker-compose logs api | grep ERROR

# Logs de la base de données
docker-compose logs postgres | grep ERROR

# Logs Nginx
docker-compose logs nginx | grep ERROR
```

## Scaling et Performance

### 1. Scaling Horizontal

```yaml
# docker-compose.override.yml
version: '3.8'
services:
  api:
    deploy:
      replicas: 3
  nginx:
    # Configuration load balancer
```

### 2. Optimisation Base de Données

```sql
-- Index pour les performances
CREATE INDEX CONCURRENTLY idx_commandes_date ON "Commandes" (date_commande);
CREATE INDEX CONCURRENTLY idx_stock_article ON "Stock" (article_id);
CREATE INDEX CONCURRENTLY idx_mouvements_date ON "MouvementStock" (created_at);
```

### 3. Cache Redis

```bash
# Configuration Redis pour la production
# Dans backend/.env
REDIS_URL=redis://redis:6379
CACHE_TTL=3600
```

## Support et Maintenance

### Contacts
- **Support Technique**: support@groupauto.ma
- **Développement**: dev@groupauto.ma
- **Urgences**: +212 600 000 000

### Documentation
- **API**: https://api.groupauto.ma/api-docs
- **Manuel Utilisateur**: `/docs/user-manual.md`
- **Changelog**: `/docs/changelog.md`

### Maintenance Programmée
- **Mises à jour**: Premier dimanche du mois à 2h00
- **Sauvegardes**: Quotidiennes à 2h00
- **Monitoring**: 24h/24, 7j/7















