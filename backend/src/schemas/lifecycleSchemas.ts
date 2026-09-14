import { z } from 'zod';

const postgresUuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const transitionSchema = z.object({
  targetStatus: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED']),
  reason: z
    .string()
    .trim()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason cannot exceed 500 characters')
    .optional(),
  resolutionNotes: z
    .string()
    .trim()
    .min(20, 'Resolution notes must be at least 20 characters')
    .max(2000, 'Resolution notes cannot exceed 2000 characters')
    .optional(),
  technicianId: z
    .string()
    .regex(postgresUuidRegex, 'Technician ID must be a valid UUID')
    .optional(),
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  ticketId: z.string().regex(postgresUuidRegex, 'Invalid ticket UUID').optional(),
  changedBy: z.string().regex(postgresUuidRegex, 'Invalid user UUID').optional(),
  previousStatus: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
  newStatus: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().trim().optional(),
});
