import { prisma } from '../config/database';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../schemas/categorySchemas';
import { NotFoundError, ValidationError } from './ticketService';

/**
 * List categories (optionally including inactive ones for administrative consoles)
 */
export const listCategories = async (includeInactive: boolean = false) => {
  const where = includeInactive ? {} : { is_active: true };

  const categories = await prisma.categories.findMany({
    where,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      is_active: true,
      created_at: true,
      updated_at: true,
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  return categories;
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: string) => {
  const category = await prisma.categories.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      is_active: true,
      created_at: true,
      updated_at: true,
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  return category;
};

/**
 * Create a new ticket category (Admin only)
 */
export const createCategory = async (input: CreateCategoryInput) => {
  const normalizedName = input.name.trim();

  // Check unique category name (case-insensitive)
  const existing = await prisma.categories.findFirst({
    where: {
      name: { equals: normalizedName, mode: 'insensitive' },
    },
  });

  if (existing) {
    throw new ValidationError('A category with this name already exists.');
  }

  const category = await prisma.categories.create({
    data: {
      name: normalizedName,
      description: input.description ? input.description.trim() : null,
      is_active: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      is_active: true,
      created_at: true,
      updated_at: true,
    },
  });

  return category;
};

/**
 * Update category details or toggle active status (Admin only)
 */
export const updateCategory = async (
  id: string,
  input: UpdateCategoryInput
) => {
  const category = await prisma.categories.findUnique({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  // Check unique name if updating
  if (input.name && input.name.trim().toLowerCase() !== category.name.toLowerCase()) {
    const existing = await prisma.categories.findFirst({
      where: {
        name: { equals: input.name.trim(), mode: 'insensitive' },
        id: { not: id },
      },
    });

    if (existing) {
      throw new ValidationError('Another category with this name already exists.');
    }
  }

  // Check if active tickets exist before deactivating
  if (input.isActive === false && category.is_active === true) {
    const activeTicketsCount = await prisma.tickets.count({
      where: {
        category_id: id,
        status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
      },
    });

    if (activeTicketsCount > 0) {
      throw new ValidationError(
        `Cannot deactivate category: ${activeTicketsCount} active ticket(s) are currently in progress.`
      );
    }
  }

  const updated = await prisma.categories.update({
    where: { id },
    data: {
      name: input.name ? input.name.trim() : undefined,
      description: input.description !== undefined ? (input.description ? input.description.trim() : null) : undefined,
      is_active: input.isActive !== undefined ? input.isActive : undefined,
    },
    select: {
      id: true,
      name: true,
      description: true,
      is_active: true,
      created_at: true,
      updated_at: true,
    },
  });

  return updated;
};
