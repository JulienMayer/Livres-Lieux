import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice('Bearer '.length);
    
    try {
      // Pour Supabase, on peut vérifier le JWT ou simplement le décoder
      // En production, vérifier la signature avec la clé publique Supabase
      const payload = jwt.decode(token) as any;
      
       console.log('🔐 JWT Debug:', {
         hasToken: !!token,
         tokenLength: token.length,
         payload: payload ? {
           sub: payload.sub,
           email: payload.email,
           hasUserMetadata: !!payload.user_metadata
         } : null
       });
      
      if (payload && payload.sub) {
        (req as any).user = {
          sub: payload.sub, // User ID
          email: payload.email,
          displayName: payload.user_metadata?.displayName,
        };
        console.log('✅ User authenticated:', (req as any).user);
      } else {
        console.log('❌ Invalid JWT payload:', payload);
      }
    } catch (error) {
      console.error('JWT verification failed:', error);
      // En mode développement, on peut être plus permissif
      if (process.env.NODE_ENV === 'development') {
        console.warn('Allowing request in development mode despite JWT error');
      }
    }
  } else {
    console.log('🔐 No Authorization header found');
  }
  
  next();
}

