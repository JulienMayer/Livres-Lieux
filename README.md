# Livres & Lieux — Monorepo

Application pour créer et partager des listes de livres associés à des lieux réels, avec carte interactive et authentification.

## Périmètre

- apps/web: SPA React (TypeScript) + React-Leaflet
- apps/api: API Node.js (Express + TypeScript) + Prisma
- infra: PostgreSQL + PostGIS via Docker Compose
- packages/shared: types partagés entre front et back

## Démarrage rapide

1) Prérequis: Node 18+, npm 10+, Docker Desktop

2) Lancer la base de données locale (Postgres + PostGIS):

```bash
npm run db:up
```

3) Installer les dépendances et générer Prisma (vous pouvez utiliser npm, pnpm ou yarn):

```bash
npm install
cd apps/api && npx prisma generate
```

4) Copier les fichiers `.env.example` vers `.env` dans `apps/api` et `apps/web`, puis éditer les variables.

5) Démarrer les apps en parallèle:

```bash
npm run dev
```

Front dev: http://localhost:5173
API dev: http://localhost:4000

## Choix d'architecture

- Auth par défaut: à brancher via Supabase Auth côté front (JWT) ou via un provider custom. Le backend expose un middleware prêt à intégrer la vérification de JWT.
- Géospatial: stockage lat/lng dans Prisma, et colonne `location` (POINT 4326) ajoutée via SQL pour PostGIS (requêtes proximales possibles).

## Scripts utiles

- `npm run db:up` / `npm run db:down`: démarrer/arrêter la base Docker
- `npm run dev`: lancer front et back en parallèle
- `npm run build`: build des apps
- `npm run typecheck` / `npm run lint`: vérifications

