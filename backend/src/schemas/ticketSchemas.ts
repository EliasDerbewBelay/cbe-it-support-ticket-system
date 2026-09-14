import { z } from 'zod';

const postgresUuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, 'Title must be at least 10 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters'),
  categoryId: z
    .string()
    .regex(postgresUuidRegex, 'Category ID must be a valid UUID'),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .optional()
    .default('MEDIUM'),
});

export const cancelTicketSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, 'Cancellation reason must be at least 5 characters')
    .max(500, 'Cancellation reason cannot exceed 500 characters'),
});

export const assignTicketSchema = z.object({
  technicianId: z
    .string()
    .regex(postgresUuidRegex, 'Technician ID must be a valid UUID'),
  assignmentNotes: z
    .string()
    .trim()
    .max(500, 'Assignment notes cannot exceed 500 characters')
    .optional(),
});

export const closeTicketSchema = z
  .object({
    notes: z
      .string()
      .trim()
      .max(500, 'Closure remarks cannot exceed 500 characters')
      .optional(),
  })
  .optional()
  .default({});

export const resolveTicketSchema = z.object({
  resolutionNotes: z
    .string()
    .trim()
    .min(20, 'Resolution notes must be at least 20 characters')
    .max(2000, 'Resolution notes cannot exceed 2000 characters'),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Comment content cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters'),
  isInternal: z
    .boolean()
    .optional()
    .default(false),
});

export const ticketQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  categoryId: z.string().regex(postgresUuidRegex, 'Invalid category UUID').optional(),
  departmentId: z.string().regex(postgresUuidRegex, 'Invalid department UUID').optional(),
  technicianId: z.string().regex(postgresUuidRegex, 'Invalid technician UUID').optional(),
  search: z.string().trim().optional(),
});

export const startWorkSchema = z
  .object({
    notes: z
      .string()
      .trim()
      .max(500, 'Notes cannot exceed 500 characters')
      .optional(),
  })
  .optional()
  .default({});

export const updateTicketStatusSchema = z
  .object({
    status: z.enum(['IN_PROGRESS', 'RESOLVED']),
    notes: z
      .string()
      .trim()
      .max(500, 'Notes cannot exceed 500 characters')
      .optional(),
    resolutionNotes: z
      .string()
      .trim()
      .min(20, 'Resolution notes must be at least 20 characters')
      .max(2000, 'Resolution notes cannot exceed 2000 characters')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'RESOLVED' && (!data.resolutionNotes || data.resolutionNotes.length < 20)) {
        return false;
      }
      return true;
    },
    {
      message: 'Resolution notes (min 20 characters) are required when transitioning to RESOLVED status.',
      path: ['resolutionNotes'],
    }
  );

export const assignedTicketQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.enum(['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  categoryId: z.string().regex(postgresUuidRegex, 'Invalid category UUID').optional(),
  search: z.string().trim().optional(),
});
