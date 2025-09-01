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

// Enhanced logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request details based on method
  let logMessage = `[${timestamp}] ${req.method} ${req.path}`;
  
  // Add query parameters for GET requests
  if (req.method === 'GET' && Object.keys(req.query).length > 0) {
    logMessage += ` | Query: ${JSON.stringify(req.query)}`;
  }
  
  // Add request body for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
    const bodyLog = { ...req.body };
    // Mask sensitive fields if they exist
    if (bodyLog.password) bodyLog.password = '***';
    if (bodyLog.token) bodyLog.token = '***';
    logMessage += ` | Body: ${JSON.stringify(bodyLog)}`;
  }
  
  console.log(`📥 ${logMessage}`);
  
  // Override res.end to log the response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    
    let responseLog = `📤 [${timestamp}] ${req.method} ${req.path} | ${statusColor} ${res.statusCode} | ⏱️ ${duration}ms`;
    
    // Add response size for successful requests
    if (res.statusCode < 400 && chunk) {
      const size = Buffer.byteLength(chunk, 'utf8');
      responseLog += ` | 📦 ${size} bytes`;
    }
    
    console.log(responseLog);
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
});

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'Livres & Lieux API',
    endpoints: {
      health: '/health',
      books: '/api/books',
      lists: '/api/lists',
      placesNear: '/api/places/near?lat=48.85&lng=2.35&radius=2000'
    }
  });
});

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
