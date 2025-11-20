# 📊 Analyse Complète du Backend - Groupauto ERP

## 1. 🔍 TYPE DE BASE DE DONNÉES

**RÉPONSE EXACTE : PostgreSQL (par défaut en production)**

### Analyse du code :

**Fichier : `backend/src/database/connection.js`**
- Ligne 36-45 : Par défaut, utilise PostgreSQL si l'URL ne commence pas par `sqlite:`
- Ligne 8-10 : En développement, utilise SQLite par défaut si DATABASE_URL n'est pas défini
- Ligne 107 (server.js) : Détecte SQLite si DATABASE_URL commence par `sqlite:`

**Fichier : `docker-compose.yml`**
- Ligne 2-15 : Service PostgreSQL configuré
- Ligne 22 : DATABASE_URL pointe vers PostgreSQL

**Conclusion :**
- **Production** : PostgreSQL (obligatoire via DATABASE_URL)
- **Développement** : SQLite par défaut (optionnel)

---

## 2. 📝 VARIABLES D'ENVIRONNEMENT UTILISÉES

### Variables OBLIGATOIRES :

| Variable | Fichier(s) | Usage | Valeur par défaut |
|----------|------------|-------|-------------------|
| `DATABASE_URL` | `database/connection.js`, `server.js` | Connexion DB | Aucun (erreur si absent) |
| `JWT_SECRET` | `routes/auth.js`, `middleware/auth.js` | Signature tokens JWT | Aucun (erreur si absent) |
| `SESSION_SECRET` | `server.js:46` | Secret pour sessions | `'very-secret-dev-key'` (dev uniquement) |
| `PORT` | `server.js:23` | Port d'écoute | `8000` |
| `NODE_ENV` | `server.js`, `connection.js`, `auth.js` | Environnement | `development` |
| `ALLOWED_ORIGINS` | `server.js:28` | CORS - domaines autorisés | `['http://localhost:3000']` |

### Variables OPTIONNELLES :

| Variable | Fichier(s) | Usage | Valeur par défaut |
|----------|------------|-------|-------------------|
| `REDIS_URL` | `docker-compose.yml` | URL Redis (non utilisé dans le code actuel) | - |
| `UPLOAD_DIR` | `env.example` | Répertoire uploads | `./uploads` |
| `MAX_FILE_SIZE` | `env.example` | Taille max upload | `10485760` (10MB) |
| `SMTP_HOST` | `env.example` | Serveur SMTP | - |
| `SMTP_PORT` | `env.example` | Port SMTP | - |
| `SMTP_USER` | `env.example` | Utilisateur SMTP | - |
| `SMTP_PASS` | `env.example` | Mot de passe SMTP | - |
| `TWILIO_ACCOUNT_SID` | `env.example` | Twilio Account SID | - |
| `TWILIO_AUTH_TOKEN` | `env.example` | Twilio Auth Token | - |
| `TWILIO_PHONE_NUMBER` | `env.example` | Numéro Twilio | - |
| `LOG_LEVEL` | `env.example` | Niveau de log | `info` |
| `LOG_FILE` | `env.example` | Fichier de log | `./logs/app.log` |

---

## 3. 📍 FICHIERS QUI LISENT LES VARIABLES

### `backend/src/server.js`
- **Ligne 8** : `require('dotenv').config()` - Charge le .env
- **Ligne 23** : `process.env.PORT || 8000`
- **Ligne 28** : `process.env.ALLOWED_ORIGINS?.split(',')`
- **Ligne 46** : `process.env.SESSION_SECRET || 'very-secret-dev-key'`
- **Ligne 52** : `process.env.NODE_ENV === 'production'`
- **Ligne 77** : `process.env.NODE_ENV !== 'production'`
- **Ligne 107** : `process.env.DATABASE_URL || ''`

### `backend/src/database/connection.js`
- **Ligne 2** : `require('dotenv').config()`
- **Ligne 6** : `process.env.NODE_ENV === 'development'`
- **Ligne 9** : `process.env.DATABASE_URL || 'sqlite:./dev.sqlite'`
- **Ligne 10** : `process.env.DATABASE_URL`

### `backend/src/routes/auth.js`
- **Ligne 72** : `process.env.JWT_SECRET`
- **Ligne 78** : `process.env.JWT_SECRET`
- **Ligne 142** : `process.env.JWT_SECRET`
- **Ligne 162** : `process.env.JWT_SECRET`

### `backend/src/middleware/auth.js`
- **Ligne 16** : `process.env.JWT_SECRET`

### `backend/src/middleware/errorHandler.js`
- **Ligne 72** : `process.env.NODE_ENV === 'development'`

### `backend/src/routes/portal.js`
- **Ligne 216** : `process.env.NODE_ENV === 'development'`

---

## 4. 🚀 CONFIGURATION PM2

### Fichier généré : `backend/ecosystem.config.js`

```javascript
{
  name: 'groupauto-erp',
  script: './src/server.js',
  cwd: '/var/www/site2/backend',
  PORT: 4001
}
```

### Commandes PM2 :

```bash
# Démarrer
cd /var/www/site2/backend
pm2 start ecosystem.config.js

# Ou directement
pm2 start src/server.js --name "groupauto-erp" --env production

# Vérifier
pm2 status
pm2 logs groupauto-erp

# Sauvegarder pour démarrage auto
pm2 save
pm2 startup
```

---

## 5. 🌐 CONFIGURATION NGINX

### Fichier généré : `nginx-groupauto.conf`

**Points clés :**
- Reverse proxy vers `http://localhost:4001`
- Support des WebSockets (upgrade headers)
- Headers X-Forwarded-* pour le proxy
- Taille max upload : 10MB
- Logs séparés : `/var/log/nginx/groupauto-*.log`

**Installation :**
```bash
sudo cp nginx-groupauto.conf /etc/nginx/sites-available/groupauto
sudo ln -s /etc/nginx/sites-available/groupauto /etc/nginx/sites-enabled/groupauto
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. 📋 FICHIER .ENV PRODUCTION COMPLET

### Fichier généré : `backend/env.production.template`

**Variables OBLIGATOIRES à remplir :**

```env
# Base de données PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/groupauto_erp

# Serveur
NODE_ENV=production
PORT=4001

# Sécurité (générer avec: openssl rand -base64 32)
JWT_SECRET=<GÉNÉRER_32_CARACTÈRES>
SESSION_SECRET=<GÉNÉRER_32_CARACTÈRES>

# CORS (remplacer par votre domaine)
ALLOWED_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com
```

**Variables OPTIONNELLES :**
- `REDIS_URL` (si vous utilisez Redis)
- `UPLOAD_DIR`, `MAX_FILE_SIZE`
- `SMTP_*` (pour emails)
- `TWILIO_*` (pour SMS)
- `LOG_LEVEL`, `LOG_FILE`

---

## 7. 🛠️ SCRIPT DE DÉPLOIEMENT

### Fichier généré : `deploy.sh`

**Ce script fait automatiquement :**
1. ✅ Installation Node.js, PM2, Nginx, Certbot, PostgreSQL
2. ✅ Clonage du repository dans `/var/www/site2`
3. ✅ Installation des dépendances npm
4. ✅ Création de la base de données PostgreSQL
5. ✅ Génération du fichier `.env` avec secrets aléatoires
6. ✅ Démarrage avec PM2 sur le port 4001
7. ✅ Configuration Nginx
8. ✅ Installation SSL avec Certbot
9. ✅ Configuration du firewall

**Utilisation :**
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

---

## 8. ✅ CHECKLIST DE DÉPLOIEMENT

- [ ] VPS Ubuntu 20.04+ configuré
- [ ] Domaine pointant vers le VPS
- [ ] Ports 80, 443, 4001 ouverts
- [ ] Exécuter `deploy.sh` ou suivre les étapes manuelles
- [ ] Vérifier `.env` contient les bonnes valeurs
- [ ] Tester : `curl http://localhost:4001/health`
- [ ] Vérifier les logs : `pm2 logs groupauto-erp`
- [ ] Accéder au site : `https://votre-domaine.com`

---

## 📞 SUPPORT

En cas de problème :
1. Vérifier les logs PM2 : `pm2 logs groupauto-erp`
2. Vérifier les logs Nginx : `sudo tail -f /var/log/nginx/groupauto-error.log`
3. Tester la connexion DB : `psql -U groupauto_user -d groupauto_erp`
4. Vérifier que PM2 tourne : `pm2 status`


