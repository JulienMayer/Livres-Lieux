import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
export const router = Router();

router.get('/', async (req, res) => {
  try {
    const schema = z.object({ query: z.string().optional() });
    const { query } = schema.parse(req.query);
    const where = query
      ? { OR: [{ title: { contains: query, mode: 'insensitive' } }, { author: { contains: query, mode: 'insensitive' } }] }
      : {};
    const books = await prisma.book.findMany({ where, take: 50, orderBy: { title: 'asc' } });
    res.json({ items: books });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

router.post('/', async (req, res) => {
  try {
    const schema = z.object({ title: z.string().min(1), author: z.string().min(1), isbn: z.string().min(5).optional() });
    const data = schema.parse(req.body);
    
    // Check if book with same ISBN already exists
    if (data.isbn) {
      const existingBook = await prisma.book.findUnique({
        where: { isbn: data.isbn }
      });
      
      if (existingBook) {
        return res.status(409).json({ 
          error: 'A book with this ISBN already exists',
          existingBook 
        });
      }
    }
    
    const created = await prisma.book.create({ data });
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

