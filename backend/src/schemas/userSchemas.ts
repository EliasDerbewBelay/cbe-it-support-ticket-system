import { z } from 'zod';

const postgresUuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const createUserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid institutional email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  role: z
    .enum(['EMPLOYEE', 'TECHNICIAN', 'ADMINISTRATOR']),
  departmentId: z
    .string()
    .regex(postgresUuidRegex, 'Department ID must be a valid UUID'),
  employeeId: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .optional(),
  phoneNumber: z
    .string()
    .trim()
    .max(30)
    .optional(),
});

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .optional(),
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .optional(),
  email: z
    .string()
    .trim()
    .email('Please enter a valid institutional email address')
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  phoneNumber: z
    .string()
    .trim()
    .max(30, 'Phone number cannot exceed 30 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  departmentId: z
    .string()
    .regex(postgresUuidRegex, 'Invalid department UUID')
    .optional(),
  employeeId: z
    .string()
    .trim()
    .min(2, 'Staff ID must be at least 2 characters')
    .max(50, 'Staff ID cannot exceed 50 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  role: z
    .enum(['EMPLOYEE', 'TECHNICIAN', 'ADMINISTRATOR'])
    .optional(),
  isActive: z
    .boolean()
    .optional(),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  role: z.enum(['EMPLOYEE', 'TECHNICIAN', 'ADMINISTRATOR']).optional(),
  departmentId: z.string().regex(postgresUuidRegex, 'Invalid department UUID').optional(),
  isActive: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
  search: z.string().trim().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryFilters = z.infer<typeof userQuerySchema>;
