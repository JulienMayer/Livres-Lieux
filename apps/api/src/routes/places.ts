import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
export const router = Router();

router.get('/near', async (req, res) => {
  const schema = z.object({ lat: z.coerce.number(), lng: z.coerce.number(), radius: z.coerce.number().default(5_000) });
  const { lat, lng, radius } = schema.parse(req.query);
  // Placeholder proximity: simple bounding box fallback; switch to PostGIS ST_DWithin in raw SQL later.
  const latDelta = radius / 111_000; // rough meters to degrees
  const lngDelta = radius / (111_000 * Math.cos((lat * Math.PI) / 180));
  const items = await prisma.place.findMany({
    where: {
      lat: { gte: lat - latDelta, lte: lat + latDelta },
      lng: { gte: lng - lngDelta, lte: lng + lngDelta },
    },
    take: 200,
  });
  res.json({ items });
});

router.post('/', async (req, res) => {
  const schema = z.object({ name: z.string().min(1), lat: z.number(), lng: z.number() });
  const data = schema.parse(req.body);
  const created = await prisma.place.create({ data });
  res.status(201).json(created);
});

