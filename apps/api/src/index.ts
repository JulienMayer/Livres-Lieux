import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './middleware/auth';
import { router as booksRouter } from './routes/books';
import { router as listsRouter } from './routes/lists';
import { router as placesRouter } from './routes/places';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  const now = await prisma.$queryRawUnsafe<string>(`SELECT NOW()::text`);
  res.json({ ok: true, dbTime: now });
});

// Auth-protected routes (example):
app.use('/api', authMiddleware);

app.use('/api/books', booksRouter);
app.use('/api/lists', listsRouter);
app.use('/api/places', placesRouter);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

