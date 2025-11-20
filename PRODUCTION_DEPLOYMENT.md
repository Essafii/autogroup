# 🚀 Instructions de Déploiement Production - Groupauto ERP

## ✅ Configuration Complète Effectuée

### 1. Frontend Portal - Structure Complète ✅
- ✅ `/public/index.html` - Existe
- ✅ `/public/favicon.ico` - Placeholder créé
- ✅ `/src/index.js` - Existe
- ✅ `/src/App.js` - Implémenté avec routing complet
- ✅ `/src/index.css` - Existe
- ✅ `/src/config.js` - Créé avec `API_BASE = "https://groupauto.ma/api"`
- ✅ `/src/components/ProtectedRoute.js` - Créé
- ✅ `/src/pages/Login.js` - Implémenté (email + password, POST /auth/login)
- ✅ `/src/pages/Dashboard.js` - Créé
- ✅ `package.json` - Scripts corrects (`build`, `start`)

### 2. Backend Configuration ✅
- ✅ CORS configuré pour accepter `https://groupauto.ma`
- ✅ Port: 4001 (PM2)
- ✅ Variables d'environnement: Voir `backend/env.production.template`

### 3. Nginx Configuration ✅
- ✅ Fichier généré: `nginx-groupauto-production.conf`
- ✅ Domaine: `groupauto.ma`
- ✅ Frontend: `/var/www/site2/frontend/portal/build`
- ✅ API Proxy: `/api/` → `http://localhost:4001/api/`

---

## 📋 Commandes de Déploiement

### Étape 1: Build du Portail Frontend

```bash
cd /var/www/site2/frontend/portal
npm install
npm run build
```

**Vérification:**
```bash
# Le dossier build/ doit être créé
ls -la build/
```

---

### Étape 2: Configuration Backend (.env)

```bash
cd /var/www/site2/backend
cp env.production.template .env
nano .env
```

**Variables OBLIGATOIRES à configurer:**
```env
DATABASE_URL=postgresql://groupauto:groupauto2025@localhost:5432/groupauto_erp
NODE_ENV=production
PORT=4001
JWT_SECRET=<générer avec: openssl rand -base64 32>
SESSION_SECRET=<générer avec: openssl rand -base64 32>
ALLOWED_ORIGINS=https://groupauto.ma,https://www.groupauto.ma
```

---

### Étape 3: Démarrage PM2 (Backend)

```bash
cd /var/www/site2/backend
pm2 start ecosystem.config.js
# OU
pm2 start src/server.js --name "groupauto-erp" --env production

# Vérifier
pm2 status
pm2 logs groupauto-erp
```

**Redémarrer si nécessaire:**
```bash
pm2 restart groupauto-erp
```

---

### Étape 4: Configuration Nginx

```bash
# Copier la configuration
sudo cp /var/www/site2/nginx-groupauto-production.conf /etc/nginx/sites-available/groupauto.conf

# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/groupauto.conf /etc/nginx/sites-enabled/groupauto.conf

# Supprimer la config par défaut
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl reload nginx
```

---

### Étape 5: Installation SSL (Certbot)

```bash
# Installer Certbot si pas déjà fait
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d groupauto.ma -d www.groupauto.ma

# Certbot configurera automatiquement Nginx pour HTTPS
```

**Vérification SSL:**
```bash
# Tester la configuration après SSL
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔍 Vérifications Post-Déploiement

### 1. Vérifier PM2
```bash
pm2 status
pm2 logs groupauto-erp --lines 50
```

**Test API:**
```bash
curl http://localhost:4001/health
# Devrait retourner: {"status":"OK",...}
```

### 2. Vérifier Nginx
```bash
sudo systemctl status nginx
sudo nginx -t
```

**Test Frontend:**
```bash
# Vérifier que le build existe
ls -la /var/www/site2/frontend/portal/build/

# Tester depuis le serveur
curl -I https://groupauto.ma
```

### 3. Vérifier les Logs
```bash
# Logs PM2
pm2 logs groupauto-erp

# Logs Nginx
sudo tail -f /var/log/nginx/groupauto-access.log
sudo tail -f /var/log/nginx/groupauto-error.log
```

### 4. Test Complet depuis le Navigateur
1. Accéder à: `https://groupauto.ma`
2. Vérifier que le portail se charge
3. Tester la connexion: `/login`
4. Vérifier la redirection vers `/dashboard` après login
5. Tester une requête API (devrait fonctionner via `/api/`)

---

## 🔄 Commandes de Mise à Jour

### Mettre à jour le Frontend
```bash
cd /var/www/site2
git pull origin main
cd frontend/portal
npm install
npm run build
sudo systemctl reload nginx
```

### Mettre à jour le Backend
```bash
cd /var/www/site2
git pull origin main
cd backend
npm install --production
pm2 restart groupauto-erp
```

---

## 🐛 Dépannage

### Erreur 502 Bad Gateway
```bash
# Vérifier que PM2 tourne
pm2 status

# Vérifier que le backend écoute sur le bon port
sudo lsof -i :4001

# Vérifier les logs
pm2 logs groupauto-erp
```

### Erreur 404 sur le Frontend
```bash
# Vérifier que le build existe
ls -la /var/www/site2/frontend/portal/build/

# Vérifier les permissions
sudo chown -R www-data:www-data /var/www/site2/frontend/portal/build
```

### Erreur CORS
```bash
# Vérifier ALLOWED_ORIGINS dans .env
cd /var/www/site2/backend
cat .env | grep ALLOWED_ORIGINS

# Doit contenir: https://groupauto.ma,https://www.groupauto.ma
```

### Erreur de Connexion Base de Données
```bash
# Tester la connexion PostgreSQL
psql -U groupauto -d groupauto_erp -h localhost

# Vérifier DATABASE_URL dans .env
cat /var/www/site2/backend/.env | grep DATABASE_URL
```

---

## ✅ Checklist Finale

- [ ] Frontend buildé: `npm run build` exécuté sans erreur
- [ ] Backend .env configuré avec toutes les variables
- [ ] PM2 démarré et fonctionnel
- [ ] Nginx configuré et testé
- [ ] SSL installé avec Certbot
- [ ] Test de connexion réussi depuis le navigateur
- [ ] API répond correctement via `/api/`
- [ ] Logs vérifiés (pas d'erreurs critiques)

---

## 📞 Support

En cas de problème:
1. Vérifier les logs PM2: `pm2 logs groupauto-erp`
2. Vérifier les logs Nginx: `sudo tail -f /var/log/nginx/groupauto-error.log`
3. Tester l'API directement: `curl http://localhost:4001/health`
4. Vérifier les permissions des fichiers

---

**🎉 Le projet est maintenant prêt pour la production!**

