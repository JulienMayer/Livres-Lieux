import { Router } from 'express';
import { PrismaClient, Visibility } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
export const router = Router();

router.get('/', async (req, res) => {
  const userId = (req as any).user?.sub as string | undefined;
  const lists = await prisma.list.findMany({
    where: {
      OR: [
        { visibility: Visibility.PUBLIC },
        userId ? { userId } : undefined,
      ].filter(Boolean) as any,
    },
    orderBy: { updatedAt: 'desc' },
  });
  res.json({ items: lists });
});

router.post('/', async (req, res) => {
  const userId = (req as any).user?.sub as string | undefined;
  const schema = z.object({ name: z.string().min(1), visibility: z.nativeEnum(Visibility).default(Visibility.PRIVATE) });
  const { name, visibility } = schema.parse(req.body);
  const created = await prisma.list.create({ data: { name, visibility, userId } });
  res.status(201).json(created);
});

router.get('/:id', async (req, res) => {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const list = await prisma.list.findUnique({ where: { id }, include: { items: true } });
  if (!list) return res.status(404).json({ error: 'Not found' });
  res.json(list);
});

router.post('/:id/items', async (req, res) => {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const schema = z.object({ bookId: z.string().uuid(), placeId: z.string().uuid(), note: z.string().optional() });
  const data = schema.parse(req.body);
  const created = await prisma.listItem.create({ data: { ...data, listId: id } });
  res.status(201).json(created);
});

