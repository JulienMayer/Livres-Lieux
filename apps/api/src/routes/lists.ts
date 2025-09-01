import { Router } from 'express';
import { PrismaClient, Visibility } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
export const router = Router();

router.get('/', async (req, res) => {
  try {
    const supabaseUser = (req as any).user;
    let userId: string | undefined;
    
    if (supabaseUser?.sub) {
      // Check if user exists in local database, create if not
      let user = await prisma.user.findUnique({
        where: { externalId: supabaseUser.sub }
      });
      
      if (!user) {
        // Create user in local database
        user = await prisma.user.create({
          data: {
            externalId: supabaseUser.sub,
            email: supabaseUser.email || '',
            displayName: supabaseUser.displayName || null,
          }
        });
      }
      
      userId = user.id;
    }
    
    const lists = await prisma.list.findMany({
      where: {
        OR: [
          { visibility: Visibility.PUBLIC },
          userId ? { userId } : undefined,
        ].filter(Boolean) as any,
      },
      include: {
        items: {
          include: {
            book: true,
            place: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ items: lists });
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

router.post('/', async (req, res) => {
  try {
    const supabaseUser = (req as any).user;
    const schema = z.object({ name: z.string().min(1), visibility: z.nativeEnum(Visibility).default(Visibility.PRIVATE) });
    const { name, visibility } = schema.parse(req.body);
    
    let userId: string | undefined;
    
    if (supabaseUser?.sub) {
      // Check if user exists in local database, create if not
      let user = await prisma.user.findUnique({
        where: { externalId: supabaseUser.sub }
      });
      
      if (!user) {
        // Create user in local database
        user = await prisma.user.create({
          data: {
            externalId: supabaseUser.sub,
            email: supabaseUser.email || '',
            displayName: supabaseUser.displayName || null,
          }
        });
      }
      
      userId = user.id;
    }
    
    const created = await prisma.list.create({ 
      data: { 
        name, 
        visibility, 
        userId 
      } 
    });
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const list = await prisma.list.findUnique({ 
    where: { id }, 
    include: { 
      items: {
        include: {
          book: true,
          place: true
        }
      } 
    } 
  });
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

router.delete('/:listId/items/:itemId', async (req, res) => {
  try {
    const { listId, itemId } = z.object({ 
      listId: z.string().uuid(), 
      itemId: z.string().uuid() 
    }).parse(req.params);
    
    // Vérifier que l'item appartient à la liste
    const item = await prisma.listItem.findFirst({
      where: { id: itemId, listId },
      include: { list: true }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found in this list' });
    }
    
    // Supprimer l'item
    await prisma.listItem.delete({ where: { id: itemId } });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting list item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    
    // Vérifier que la liste existe et appartient à l'utilisateur
    const list = await prisma.list.findUnique({
      where: { id },
      include: { items: true }
    });
    
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    // Supprimer d'abord tous les items de la liste
    if (list.items.length > 0) {
      await prisma.listItem.deleteMany({
        where: { listId: id }
      });
    }
    
    // Puis supprimer la liste
    await prisma.list.delete({ where: { id } });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

