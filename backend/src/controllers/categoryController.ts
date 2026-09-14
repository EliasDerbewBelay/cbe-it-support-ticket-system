import { Request, Response, NextFunction } from 'express';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from '../schemas/categorySchemas';
import * as categoryService from '../services/categoryService';
import { ValidationError, NotFoundError } from '../services/ticketService';

/**
 * Retrieve ticket categories
 * GET /api/categories
 */
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = categoryQuerySchema.safeParse(req.query);
    const includeInactive = req.user?.role === 'ADMINISTRATOR' && parseResult.success && !!parseResult.data.all;

    const categories = await categoryService.listCategories(includeInactive);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single category by ID
 * GET /api/categories/:id
 */
export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoryId = req.params.id as string;
    const category = await categoryService.getCategoryById(categoryId);

    res.status(200).json({
      success: true,
      data: category,
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
 * Create a new ticket category
 * POST /api/categories
 */
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = createCategorySchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const category = await categoryService.createCategory(parseResult.data);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
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
 * Update category details or active status
 * PATCH /api/categories/:id
 */
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoryId = req.params.id as string;
    const parseResult = updateCategorySchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const updated = await categoryService.updateCategory(
      categoryId,
      parseResult.data
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
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
