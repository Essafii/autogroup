# 🔧 Résolution de l'Erreur "relation 'User' does not exist"

## ❌ Problème

L'erreur `relation "User" does not exist` signifie que les tables de la base de données PostgreSQL n'ont pas été créées.

---

## ✅ Solution Rapide

### Étape 1: Arrêter le serveur backend
Si le serveur tourne, appuyez sur `Ctrl+C` pour l'arrêter.

### Étape 2: Initialiser la base de données

```bash
cd backend
npm run init-db
```

Ce script va:
- ✅ Créer toutes les tables nécessaires (User, Agence, Client, Article, etc.)
- ✅ Créer l'utilisateur admin (`admin@groupauto.ma` / `admin123`)
- ✅ Créer l'utilisateur commercial (`commercial@groupauto.ma` / `commercial123`)
- ✅ Créer une agence par défaut (Dépôt Témara)

### Étape 3: Redémarrer le serveur

```bash
npm run dev
```

---

## 🔍 Vérification

### Tester la connexion:
```bash
curl http://localhost:8000/health
```

### Tester la connexion admin:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@groupauto.ma","password":"admin123"}'
```

Si vous recevez un token JWT, c'est que tout fonctionne! ✅

---

## 📋 URLs d'Accès Après Correction

### Production (groupauto.ma):
- **Admin:** https://groupauto.ma/admin
- **Commercial:** https://groupauto.ma/commercial  
- **Portal:** https://groupauto.ma/login
- **API:** https://groupauto.ma/api

### Développement Local:
- **Admin:** http://localhost:3000/login
- **Commercial:** http://localhost:3001/login
- **Portal:** http://localhost:3002/login
- **Backend:** http://localhost:8000

---

## 🔑 Identifiants

**Admin:**
- Email: `admin@groupauto.ma`
- Mot de passe: `admin123`

**Commercial:**
- Email: `commercial@groupauto.ma`
- Mot de passe: `commercial123`

**Portal:**
- ⚠️ Aucun compte par défaut (créé par l'admin)

---

**✅ Après l'exécution du script, l'erreur sera résolue!**

