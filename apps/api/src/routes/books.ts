import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
export const router = Router();

router.get('/', async (req, res) => {
  const schema = z.object({ query: z.string().optional() });
  const { query } = schema.parse(req.query);
  const where = query
    ? { OR: [{ title: { contains: query, mode: 'insensitive' } }, { author: { contains: query, mode: 'insensitive' } }] }
    : {};
  const books = await prisma.book.findMany({ where, take: 50, orderBy: { title: 'asc' } });
  res.json({ items: books });
});

router.post('/', async (req, res) => {
  const schema = z.object({ title: z.string().min(1), author: z.string().min(1), isbn: z.string().min(5).optional() });
  const data = schema.parse(req.body);
  const created = await prisma.book.create({ data });
  res.status(201).json(created);
});

