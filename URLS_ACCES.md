# 🔗 URLs d'Accès - Groupauto ERP

## 🌐 URLs de Production (groupauto.ma)

### 1. 👨‍💼 Interface ADMIN
**URL:** https://groupauto.ma/admin  
**OU:** https://admin.groupauto.ma (si configuré)

**Identifiants:**
- **Email:** `admin@groupauto.ma`
- **Mot de passe:** `admin123`

---

### 2. 💼 Application COMMERCIALE
**URL:** https://groupauto.ma/commercial  
**OU:** https://commercial.groupauto.ma (si configuré)

**Identifiants:**
- **Email:** `commercial@groupauto.ma`
- **Mot de passe:** `commercial123`

---

### 3. 🌐 Portail REVENDEURS
**URL:** https://groupauto.ma/login  
**OU:** https://portal.groupauto.ma (si configuré)

**Identifiants:**
- ⚠️ **Aucun compte par défaut**
- Les comptes sont créés par l'administrateur
- L'admin doit activer chaque compte (`is_active: true`)

---

### 4. 🔧 Backend API
**URL:** https://groupauto.ma/api  
**OU:** https://api.groupauto.ma (si configuré)

**Endpoints principaux:**
- `POST /api/auth/login` - Connexion
- `GET /api/health` - Santé de l'API
- `GET /api-docs` - Documentation Swagger (dev uniquement)

---

## 💻 URLs de Développement Local

### 1. 👨‍💼 Interface ADMIN
**URL:** http://localhost:3000/login

**Démarrer:**
```bash
cd frontend/admin
npm start
```

**Identifiants:**
- **Email:** `admin@groupauto.ma`
- **Mot de passe:** `admin123`

---

### 2. 💼 Application COMMERCIALE
**URL:** http://localhost:3001/login

**Démarrer:**
```bash
cd frontend/commercial
npm start
```

**Identifiants:**
- **Email:** `commercial@groupauto.ma`
- **Mot de passe:** `commercial123`

---

### 3. 🌐 Portail REVENDEURS
**URL:** http://localhost:3002/login

**Démarrer:**
```bash
cd frontend/portal
npm start
```

**OU via le backend (HTML statique):**
**URL:** http://localhost:8000/login.html

**Identifiants:**
- ⚠️ Aucun compte par défaut (créé par l'admin)

---

### 4. 🔧 Backend API
**URL:** http://localhost:8000

**Démarrer:**
```bash
cd backend
npm run dev
```

**Endpoints:**
- http://localhost:8000/api/auth/login
- http://localhost:8000/api/health
- http://localhost:8000/api-docs (documentation Swagger)

---

## ⚠️ Résolution de l'Erreur "relation 'User' does not exist"

Cette erreur signifie que les tables de la base de données n'ont pas été créées.

### Solution: Initialiser la Base de Données

**1. Arrêter le serveur backend (Ctrl+C)**

**2. Exécuter le script d'initialisation:**
```bash
cd backend
npm run init-db
```

Ce script va:
- ✅ Créer toutes les tables nécessaires
- ✅ Créer l'utilisateur admin (`admin@groupauto.ma` / `admin123`)
- ✅ Créer l'utilisateur commercial (`commercial@groupauto.ma` / `commercial123`)
- ✅ Créer une agence par défaut

**3. Redémarrer le serveur:**
```bash
npm run dev
```

---

## 🔍 Vérification

### Tester la connexion à la base de données:
```bash
cd backend
node -e "const { sequelize } = require('./src/database/connection'); sequelize.authenticate().then(() => console.log('✅ DB OK')).catch(e => console.error('❌ Erreur:', e));"
```

### Tester l'API:
```bash
curl http://localhost:8000/health
```

### Tester la connexion admin:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@groupauto.ma","password":"admin123"}'
```

---

## 📋 Résumé des URLs

| Interface | Production | Développement | Port |
|-----------|------------|---------------|------|
| **Admin** | https://groupauto.ma/admin | http://localhost:3000 | 3000 |
| **Commercial** | https://groupauto.ma/commercial | http://localhost:3001 | 3001 |
| **Portal** | https://groupauto.ma/login | http://localhost:3002 | 3002 |
| **Backend** | https://groupauto.ma/api | http://localhost:8000 | 8000 |

---

## 🚀 Démarrage Rapide

**1. Initialiser la base de données (une seule fois):**
```bash
cd backend
npm run init-db
```

**2. Démarrer le backend:**
```bash
cd backend
npm run dev
```

**3. Démarrer les frontends (dans des terminaux séparés):**
```bash
# Terminal 1 - Admin
cd frontend/admin && npm start

# Terminal 2 - Commercial  
cd frontend/commercial && npm start

# Terminal 3 - Portal
cd frontend/portal && npm start
```

---

**✅ Après l'initialisation, toutes les URLs fonctionneront correctement!**

