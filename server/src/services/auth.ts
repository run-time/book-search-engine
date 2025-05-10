import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

export interface JwtPayload {
  _id: unknown;
  username: string;
  email: string,
}

// Express middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    const secretKey = process.env.JWT_SECRET_KEY || 'temporarysecretkey';

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }

      req.user = user as JwtPayload;
      return next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

// Function to sign token
export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || 'temporarysecretkey';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

// Apollo Server context function for authentication
export const authMiddleware = async ({ req }: { req: Request }) => {
  let token = req.headers.authorization || '';

  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  if (!token) {
    return { user: null };
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY || 'temporarysecretkey';
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    return { user: decoded };
  } catch (error) {
    console.log('Invalid token:', error);
    return { user: null };
  }
};