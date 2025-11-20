# 🔐 Guide d'Accès - Groupauto ERP

## 📍 URLs d'Accès

### 🖥️ Mode Développement (Local)

| Interface | URL | Port | Commande de démarrage |
|-----------|-----|------|----------------------|
| **Admin** | http://localhost:3000 | 3000 | `cd frontend/admin && npm start` |
| **Commercial** | http://localhost:3001 | 3001 | `cd frontend/commercial && npm start` |
| **Portal** | http://localhost:3002 | 3002 | `cd frontend/portal && npm start` |
| **Backend API** | http://localhost:8000 | 8000 | `cd backend && npm run dev` |

### 🌐 Mode Production

| Interface | URL | Description |
|-----------|-----|-------------|
| **Admin** | https://admin.groupauto.ma | Interface d'administration |
| **Commercial** | https://commercial.groupauto.ma | Application commerciale |
| **Portal** | https://portal.groupauto.ma | Portail revendeurs |
| **API** | https://api.groupauto.ma | API Backend |

---

## 🔑 Identifiants de Connexion

### 1. 👨‍💼 Interface ADMIN

**URL:** http://localhost:3000/login (dev) ou https://admin.groupauto.ma/login (prod)

**Identifiants:**
- **Email:** `admin@groupauto.ma`
- **Mot de passe:** `admin123`

**Pages disponibles après connexion:**
- `/dashboard` - Tableau de bord
- `/users` - Gestion des utilisateurs
- `/settings` - Paramètres

---

### 2. 💼 Application COMMERCIALE

**URL:** http://localhost:3001/login (dev) ou https://commercial.groupauto.ma/login (prod)

**Identifiants:**
- **Email:** `commercial@groupauto.ma`
- **Mot de passe:** `commercial123`

**Pages disponibles après connexion:**
- `/orders` - Saisie des commandes
- `/clients` - Liste des clients

---

### 3. 🌐 Portail REVENDEURS

**URL:** http://localhost:3002/login (dev) ou https://portal.groupauto.ma/login (prod)

**Identifiants:**
- ⚠️ **Aucun compte par défaut**
- Les comptes doivent être créés par l'administrateur
- L'admin doit activer chaque compte (`is_active: true`)

**Pour créer un compte client:**
1. Se connecter en tant qu'admin
2. Aller dans la gestion des clients
3. Créer un nouveau client avec email et mot de passe
4. Activer le compte (`is_active: true`)

---

## 🚀 Démarrage Rapide (Développement)

### Étape 1: Démarrer le Backend

```bash
cd backend
npm install
npm run dev
```

Le backend sera accessible sur: **http://localhost:8000**

---

### Étape 2: Démarrer les Frontends

**Terminal 1 - Admin:**
```bash
cd frontend/admin
npm install
npm start
```
→ Ouvre automatiquement http://localhost:3000

**Terminal 2 - Commercial:**
```bash
cd frontend/commercial
npm install
npm start
```
→ Ouvre automatiquement http://localhost:3001

**Terminal 3 - Portal:**
```bash
cd frontend/portal
npm install
npm start
```
→ Ouvre automatiquement http://localhost:3002

---

## 📝 Création des Comptes Utilisateurs

### Créer un compte Admin

Si le compte admin n'existe pas, vous pouvez le créer via:

1. **Script SQL** (dans `database/init.sql`):
```sql
INSERT INTO "Users" (id, email, password, nom, prenom, telephone, role, is_active, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'admin@groupauto.ma',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2a', -- admin123
  'Admin',
  'Groupauto',
  '+212600000000',
  'admin',
  true,
  NOW(),
  NOW()
);
```

2. **Via l'interface Admin** (si vous avez déjà un compte admin):
   - Aller dans `/users`
   - Cliquer sur "Nouvel utilisateur"
   - Remplir le formulaire

---

### Créer un compte Commercial

```sql
INSERT INTO "Users" (id, email, password, nom, prenom, telephone, role, is_active, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'commercial@groupauto.ma',
  '$2a$12$...', -- commercial123 (hashé avec bcrypt)
  'Commercial',
  'User',
  '+212600000001',
  'commercial',
  true,
  NOW(),
  NOW()
);
```

---

### Créer un compte Client (Portal)

**Via l'interface Admin:**
1. Se connecter en tant qu'admin
2. Aller dans la gestion des clients
3. Créer un nouveau client avec:
   - Email
   - Mot de passe
   - Type (particulier/entreprise)
   - Informations de contact
4. **Important:** Activer le compte (`is_active: true`)

**Via l'API:**
```bash
POST /api/portal/register
{
  "email": "client@example.com",
  "password": "password123",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+212600111111",
  "type": "particulier"
}
```

⚠️ Le compte sera créé avec `is_active: false` par défaut. L'admin doit l'activer.

---

## 🔧 Vérification des Comptes

### Vérifier si un compte existe

**Via PostgreSQL:**
```bash
psql -U groupauto -d groupauto_erp
SELECT email, role, is_active FROM "Users" WHERE email = 'admin@groupauto.ma';
```

**Via l'API:**
```bash
# Tester la connexion
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@groupauto.ma","password":"admin123"}'
```

---

## ⚠️ Notes Importantes

1. **Sécurité:**
   - ⚠️ Changez les mots de passe par défaut en production
   - Utilisez des mots de passe forts
   - Activez HTTPS en production

2. **Portail Revendeurs:**
   - Les nouveaux comptes sont **inactifs** par défaut
   - L'admin doit activer chaque compte manuellement
   - Les clients ne peuvent pas se connecter tant que `is_active = false`

3. **Base de Données:**
   - Assurez-vous que la base de données est démarrée
   - Vérifiez que les tables sont créées (via Sequelize migrations)

---

## 🐛 Dépannage

### Erreur "Email ou mot de passe incorrect"
- Vérifiez que le compte existe dans la base de données
- Vérifiez que `is_active = true` pour le compte
- Vérifiez que le mot de passe est correct

### Erreur "Accès refusé"
- Vérifiez que le compte a le bon rôle (admin/commercial/client)
- Vérifiez que `is_active = true`

### Le frontend ne se connecte pas au backend
- Vérifiez que le backend tourne sur le bon port (8000)
- Vérifiez la configuration CORS dans `backend/src/server.js`
- Vérifiez `ALLOWED_ORIGINS` dans le `.env`

---

**✅ Tous les identifiants sont prêts à être utilisés!**

