import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'prepflow_super_access_secret_key_2026';

export interface TokenPayload {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired access token' });
    }

    const payload = decoded as TokenPayload;
    if (payload.role !== 'user') {
      return res.status(403).json({ error: 'User access required' });
    }

    (req as any).user = {
      id: payload.id,
      username: payload.username,
      email: payload.email,
    };
    next();
  });
}

export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired access token' });
    }

    const payload = decoded as TokenPayload;
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    (req as any).admin = {
      id: payload.id,
      email: payload.email,
    };
    next();
  });
}
