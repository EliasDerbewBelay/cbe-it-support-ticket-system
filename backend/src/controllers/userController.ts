import { Request, Response, NextFunction } from 'express';
import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
} from '../schemas/userSchemas';
import * as userService from '../services/userService';
import { ValidationError, NotFoundError, ForbiddenError } from '../services/ticketService';

/**
 * List users with pagination and administrative filters
 * GET /api/users
 */
export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = userQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Invalid query parameters: ${errorMessages}`,
      });
      return;
    }

    const result = await userService.listUsers(parseResult.data);

    res.status(200).json({
      success: true,
      data: result.users,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user account
 * POST /api/users
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = createUserSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const user = await userService.createUser(parseResult.data);

    res.status(201).json({
      success: true,
      message: 'User account created successfully',
      data: user,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
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
 * Fetch detailed profile of a single user
 * GET /api/users/:id
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id as string;
    const user = await userService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
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
 * Update user details or active status
 * PATCH /api/users/:id
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id as string;
    const parseResult = updateUserSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const updatedUser = await userService.updateUser(
      userId,
      req.user!.id,
      parseResult.data
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof ForbiddenError
    ) {
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
 * List active technicians with workload metrics
 * GET /api/users/technicians/active
 */
export const getActiveTechnicians = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const technicians = await userService.getActiveTechnicians();

    res.status(200).json({
      success: true,
      data: technicians,
    });
  } catch (error) {
    next(error);
  }
};
