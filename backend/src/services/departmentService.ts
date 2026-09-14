import { prisma } from '../config/database';
import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '../schemas/departmentSchemas';
import { NotFoundError, ValidationError } from './ticketService';

/**
 * List departments (optionally including inactive ones for administrative management)
 */
export const listDepartments = async (includeInactive: boolean = false) => {
  const where = includeInactive ? {} : { is_active: true };

  const departments = await prisma.departments.findMany({
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
          users: true,
          tickets: true,
        },
      },
    },
  });

  return departments;
};

/**
 * Retrieve single department details by ID
 */
export const getDepartmentById = async (id: string) => {
  const department = await prisma.departments.findUnique({
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
          users: true,
          tickets: true,
        },
      },
    },
  });

  if (!department) {
    throw new NotFoundError('Department not found');
  }

  return department;
};

/**
 * Create a new department (Admin only)
 */
export const createDepartment = async (input: CreateDepartmentInput) => {
  const normalizedName = input.name.trim();

  // Check unique department name (case-insensitive)
  const existing = await prisma.departments.findFirst({
    where: {
      name: { equals: normalizedName, mode: 'insensitive' },
    },
  });

  if (existing) {
    throw new ValidationError('A department with this name already exists.');
  }

  const department = await prisma.departments.create({
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

  return department;
};

/**
 * Update department details or toggle active status (Admin only)
 */
export const updateDepartment = async (
  id: string,
  input: UpdateDepartmentInput
) => {
  const department = await prisma.departments.findUnique({
    where: { id },
  });

  if (!department) {
    throw new NotFoundError('Department not found');
  }

  // Check unique name if updating
  if (input.name && input.name.trim().toLowerCase() !== department.name.toLowerCase()) {
    const existing = await prisma.departments.findFirst({
      where: {
        name: { equals: input.name.trim(), mode: 'insensitive' },
        id: { not: id },
      },
    });

    if (existing) {
      throw new ValidationError('Another department with this name already exists.');
    }
  }

  // Enforce INV-07 / BR-10: Deactivation blocked if active tickets remain in progress
  if (input.isActive === false && department.is_active === true) {
    const activeTicketsCount = await prisma.tickets.count({
      where: {
        department_id: id,
        status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
      },
    });

    if (activeTicketsCount > 0) {
      throw new ValidationError(
        `Cannot deactivate department: ${activeTicketsCount} active ticket(s) are currently in progress.`
      );
    }
  }

  const updated = await prisma.departments.update({
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
