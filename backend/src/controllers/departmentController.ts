import { Request, Response, NextFunction } from 'express';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentQuerySchema,
} from '../schemas/departmentSchemas';
import * as departmentService from '../services/departmentService';
import { ValidationError, NotFoundError } from '../services/ticketService';

/**
 * List departments
 * GET /api/departments
 */
export const getDepartments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = departmentQuerySchema.safeParse(req.query);
    const includeInactive = req.user?.role === 'ADMINISTRATOR' && parseResult.success && !!parseResult.data.all;

    const departments = await departmentService.listDepartments(includeInactive);

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get department by ID
 * GET /api/departments/:id
 */
export const getDepartmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const departmentId = req.params.id as string;
    const department = await departmentService.getDepartmentById(departmentId);

    res.status(200).json({
      success: true,
      data: department,
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
 * Create a new department
 * POST /api/departments
 */
export const createDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = createDepartmentSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const department = await departmentService.createDepartment(parseResult.data);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
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
 * Update department details or toggle active status
 * PATCH /api/departments/:id
 */
export const updateDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const departmentId = req.params.id as string;
    const parseResult = updateDepartmentSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const updated = await departmentService.updateDepartment(
      departmentId,
      parseResult.data
    );

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: updated,
    });
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError
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
