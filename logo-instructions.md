

# 📸 Ajouter le Logo de la Société

## ✅ Ce qui a été configuré

J'ai ajouté le support du logo personnalisé à votre application ERP. Le système est maintenant prêt à afficher votre logo !

## 📍 Emplacement du logo

Pour ajouter votre logo, placez-le dans le dossier suivant :

```
backend/public/assets/images/logo.png
```

## 📝 Instructions

### Option 1 : Ajout manuel du fichier

1. **Préparez votre logo**
   - Format recommandé : PNG avec fond transparent
   - Taille : 200x200 pixels ou plus (sera redimensionné automatiquement)
   - Nom du fichier : **`logo.png`** (obligatoire)

2. **Placez le fichier**
   - Copiez votre fichier logo
   - Collez-le dans : `backend\public\assets\images\logo.png`

3. **Rechargez l'application**
   - Le logo apparaîtra automatiquement sur le portail client
   - Adresse : http://localhost:8000

### Option 2 : Upload via l'API (à implémenter)

Une fois que vous avez un système d'authentification admin, vous pourrez uploader le logo via l'API :

```bash
# Exemple de requête (après authentification)
curl -X POST http://localhost:8000/api/upload/logo \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -F "logo=@chemin/vers/votre/logo.png"
```

## 🎨 Styles et apparence

Le logo sera affiché dans :
- ✅ L'en-tête de navigation du portail client
- ✅ Toutes les pages du portail (catalog, tracking, history, etc.)
- ✅ Taille : 60x60 pixels (avec padding automatique)
- ✅ Bordure arrondie avec ombre
- ✅ Animation flottante

## 🔄 Fallback automatique

Si le logo n'est pas trouvé :
- L'icône emoji 🚗 s'affichera automatiquement
- L'application continuera de fonctionner normalement

## 📂 Structure des fichiers créés

```
backend/
├── public/
│   └── assets/
│       └── images/
│           ├── logo.png         (à ajouter)
│           └── README.md        (instructions)
├── src/
│   └── routes/
│       └── upload.js            (nouvelle route API)
└── src/
    └── server.js                (modifié)
```

## 🧪 Test

Pour vérifier que votre logo fonctionne :

1. Placez votre fichier `logo.png` dans le bon dossier
2. Visitez : http://localhost:8000
3. Le logo devrait apparaître en haut à gauche

## 📊 Formats supportés

- ✅ PNG (recommandé)
- ✅ JPG/JPEG
- ✅ WebP
- ✅ SVG
- ✅ GIF

## 💡 Conseil

Pour un meilleur rendu :
- Utilisez un logo carré (1:1)
- Format PNG avec transparence
- Minimum 200x200 pixels
- Fond transparent recommandé
- Le système redimensionnera automatiquement

## 🔧 API Endpoints

Une fois l'authentification configurée, vous aurez accès à :

- **GET** `/api/upload/logo` - Récupérer le logo
- **POST** `/api/upload/logo` - Uploader un nouveau logo (admin)

Consultez la documentation Swagger : http://localhost:8000/api-docs

---

**Votre logo sera visible partout dans le portail client !** 🎉
