import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Minimal placeholder: accept anonymous by default, parse JWT if provided.
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice('Bearer '.length);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      (req as any).user = payload;
    } catch {
      // Ignore invalid tokens for now; tighten later as needed
    }
  }
  next();
}

