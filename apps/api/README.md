# API (Express + Prisma)

Endpoints de base:

- `GET /health`: état du service et connectivité DB
- `GET /api/books?query=`: recherche titre/auteur
- `POST /api/books`: créer un livre
- `GET /api/lists`: lister listes (publiques + utilisateur)
- `POST /api/lists`: créer une liste
- `GET /api/lists/:id`: récupérer une liste avec items
- `POST /api/lists/:id/items`: ajouter un item (book+place)
- `GET /api/places/near?lat&lng&radius`: lieux à proximité (approx.; passez à PostGIS ensuite)

Auth: middleware JWT minimal, compatible avec Supabase (payload.sub)

Prisma: voir `prisma/schema.prisma`.

