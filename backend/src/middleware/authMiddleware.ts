import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_ssms_key_2026') as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
       res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
       return;
    }
    next();
  };
};
