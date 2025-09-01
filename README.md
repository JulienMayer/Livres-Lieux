# 📚 Livres & Lieux

Une application web interactive qui permet aux utilisateurs de créer et partager des listes de livres associés à des lieux géographiques. Explorez des lectures en fonction de lieux réels et découvrez des endroits évoqués dans vos livres préférés.

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité

- **Connexion sécurisée** avec Supabase Auth
- **Profils utilisateurs** personnalisables
- **Listes privées/publiques** selon le choix de l'utilisateur

### 📖 Gestion de Contenu

- **Recherche de livres** par titre ou auteur
- **Création de listes personnelles** de livres
- **Association livre-lieu** avec notes personnelles
- **Géolocalisation** des lieux mentionnés

### 🗺️ Interface Interactive

- **Carte interactive** avec React-Leaflet
- **Recherche de lieux à proximité** (géolocalisation)
- **Interface responsive** adaptée mobile/desktop
- **Navigation fluide** entre livres et lieux

### 🔍 Découverte

- **Recherche géospatiale** des lieux
- **Partage de listes** avec la communauté
- **Exploration** de nouveaux endroits via la littérature

## 🏗️ Architecture

```
📁 livres-lieux/
├── 🖥️ apps/
│   ├── 🌐 web/          # Frontend React + TypeScript
│   └── ⚙️ api/          # Backend Express + TypeScript
├── 📦 packages/
│   └── 🔄 shared/       # Types et utilitaires partagés
└── 🐳 infra/           # Configuration Docker
```

### Technologies Utilisées

#### Frontend

- **React 18** + **TypeScript**
- **React-Leaflet** pour les cartes interactives
- **Supabase Auth** pour l'authentification
- **Vite** pour le build et le développement

#### Backend

- **Express.js** + **TypeScript**
- **Prisma ORM** pour la base de données
- **PostgreSQL** + **PostGIS** pour les données géospatiales
- **JWT** pour l'authentification

#### Infrastructure

- **Docker Compose** pour le développement local
- **Supabase** pour l'authentification et l'hébergement DB
- **PostgreSQL** avec extension PostGIS

## 🚀 Installation & Configuration

### Prérequis

- Node.js 18+ et npm
- Docker et Docker Compose
- Compte Supabase (gratuit)

### 1. Cloner le projet

```bash
git clone <repository-url>
cd livres-lieux
```

### 2. Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Récupérez vos clés d'API dans Settings > API
3. Créez un fichier `.env` dans `apps/web/` :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:4000
```

### 3. Démarrer la base de données

```bash
npm run db:up
```

### 4. Appliquer les migrations

```bash
npm -w apps/api run prisma:migrate
```

### 5. Installer les dépendances

```bash
npm install
```

### 6. Lancer l'application

```bash
npm run dev
```

L'application sera disponible sur :

- **Frontend** : http://localhost:5173
- **API** : http://localhost:4000
- **Base de données** : localhost:5432

## 📖 Utilisation

### Première connexion

1. Ouvrez http://localhost:5173
2. Cliquez sur "Connexion"
3. Créez un compte ou connectez-vous
4. Commencez à explorer !

### Créer une liste de livres

1. Connectez-vous à votre compte
2. Dans la sidebar, cliquez sur "Créer une liste"
3. Donnez un nom à votre liste
4. Cliquez sur "Ajouter un livre" pour commencer

### Ajouter un livre à une liste

1. Sélectionnez une liste dans la sidebar
2. Cliquez sur "Ajouter un livre"
3. Recherchez et sélectionnez un livre
4. Choisissez un lieu à proximité
5. Ajoutez une note optionnelle
6. Validez l'ajout

### Explorer les lieux

1. Utilisez la recherche de livres pour trouver des titres
2. Cliquez sur "📍 Autour de moi" pour voir les lieux proches
3. Cliquez sur les marqueurs de la carte pour plus d'informations
4. Explorez les listes publiques d'autres utilisateurs

## 🔧 Développement

### Structure des commandes

```bash
npm run dev          # Lance le frontend et l'API
npm run build        # Build de production
npm run typecheck    # Vérification TypeScript
npm run db:up        # Démarre la base de données
npm run db:down      # Arrête la base de données
```

### Ajouter de nouvelles fonctionnalités

1. **API** : Ajoutez les routes dans `apps/api/src/routes/`
2. **Frontend** : Créez les composants dans `apps/web/src/components/`
3. **Base de données** : Modifiez le schéma Prisma dans `apps/api/prisma/schema.prisma`

### Tests

```bash
# Tests API
npm -w apps/api run test

# Tests Frontend
npm -w apps/web run test
```

## 🚀 Déploiement

### Production

1. **Frontend** : Déployez sur Vercel/Netlify
2. **API** : Déployez sur Railway/Render/Fly.io
3. **Base de données** : Utilisez Supabase ou un autre hébergeur PostgreSQL

### Variables d'environnement de production

```env
# API
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production

# Frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-api-domain.com
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Issues** : Utilisez les GitHub Issues pour signaler des bugs
- **Discussions** : Utilisez les GitHub Discussions pour les questions
- **Documentation** : Consultez les commentaires dans le code

---

**Livres & Lieux** - Explorez le monde à travers la littérature 📚🗺️
