import { Request, Response, NextFunction } from 'express';
import { user_role } from '@prisma/client';
import { verifyToken } from '../utils/authUtils';
import { getUserById } from '../services/authService';

/**
 * Authentication Middleware
 * Validates incoming JWT Bearer token and attaches user profile to req.user
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No authorization token provided.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Token missing in Bearer header.',
      });
      return;
    }

    // Verify token cryptographic signature
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.',
      });
      return;
    }

    // Load active user profile from database to confirm existence and active status
    const user = await getUserById(decoded.sub);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account associated with this token no longer exists.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'User account has been deactivated. Please contact an IT administrator.',
      });
      return;
    }

    // Attach validated user to request object
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Role-Based Access Control (RBAC) Authorization Middleware
 * Verifies that the authenticated user possesses one of the allowed roles
 */
export const authorize = (...allowedRoles: user_role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required prior to authorization check.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};
