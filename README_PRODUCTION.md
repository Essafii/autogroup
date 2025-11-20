# 🚀 Groupauto ERP - Prêt pour Production

## ✅ Configuration Automatique Terminée

Tous les fichiers ont été générés et configurés automatiquement pour le déploiement en production.

---

## 📦 Structure du Projet

```
/var/www/site2/
├── backend/              # API Node.js/Express
│   ├── src/server.js     # Point d'entrée (PM2)
│   ├── .env              # Variables d'environnement (à configurer)
│   └── ecosystem.config.js # Configuration PM2
│
├── frontend/
│   ├── admin/            # Interface admin (TypeScript)
│   ├── commercial/       # App commerciale
│   └── portal/           # ✅ Portail revendeurs (COMPLET)
│       ├── build/        # Build de production (après npm run build)
│       └── src/
│           ├── config.js # API_BASE = "https://groupauto.ma/api"
│           ├── App.js    # Routing complet
│           ├── pages/Login.js
│           └── pages/Dashboard.js
│
└── nginx-groupauto-production.conf  # Config Nginx
```

---

## 🎯 Commandes de Déploiement

### 1. Build du Portail
```bash
cd /var/www/site2/frontend/portal
npm install
npm run build
```

### 2. Configuration Backend
```bash
cd /var/www/site2/backend
cp env.production.template .env
nano .env  # Configurer DATABASE_URL, JWT_SECRET, ALLOWED_ORIGINS
```

**ALLOWED_ORIGINS doit contenir:**
```
ALLOWED_ORIGINS=https://groupauto.ma,https://www.groupauto.ma
```

### 3. Démarrer PM2
```bash
cd /var/www/site2/backend
pm2 start ecosystem.config.js
pm2 save
```

### 4. Configurer Nginx
```bash
sudo cp /var/www/site2/nginx-groupauto-production.conf /etc/nginx/sites-available/groupauto.conf
sudo ln -s /etc/nginx/sites-available/groupauto.conf /etc/nginx/sites-enabled/groupauto.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Installer SSL
```bash
sudo certbot --nginx -d groupauto.ma -d www.groupauto.ma
```

---

## ✅ Vérifications

```bash
# PM2
pm2 status
pm2 logs groupauto-erp

# API
curl http://localhost:4001/health

# Nginx
sudo systemctl status nginx
sudo nginx -t

# Frontend
ls -la /var/www/site2/frontend/portal/build/
```

---

## 📚 Documentation Complète

- **`PRODUCTION_DEPLOYMENT.md`** - Guide détaillé de déploiement
- **`DEPLOYMENT_SUMMARY.md`** - Résumé de la configuration
- **`ANALYSE_DEPLOIEMENT.md`** - Analyse technique complète

---

**🎉 Le projet est 100% prêt pour la production!**

