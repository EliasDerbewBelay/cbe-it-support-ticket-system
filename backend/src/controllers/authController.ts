import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '../schemas/authSchemas';
import * as authService from '../services/authService';

/**
 * Handle user login
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request payload using Zod
    const parseResult = loginSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const { token, user } = await authService.login(parseResult.data);

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    if (error instanceof authService.AuthenticationError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
};

/**
 * Handle session logout
 * POST /api/auth/logout
 */
export const logout = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};

/**
 * Get current authenticated user session profile
 * GET /api/auth/me
 */
export const getMe = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

/**
 * Role Verification Handlers for Testing / Demonstration
 */
export const verifyEmployeeAccess = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Access granted for EMPLOYEE or higher role.',
    user: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
};

export const verifyTechnicianAccess = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Access granted for TECHNICIAN role.',
    user: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
};

export const verifyAdminAccess = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Access granted for ADMINISTRATOR role.',
    user: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
};
