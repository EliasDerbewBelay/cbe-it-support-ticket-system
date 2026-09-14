import { Request, Response, NextFunction } from 'express';
import {
  auditLogQuerySchema,
  transitionSchema,
} from '../schemas/lifecycleSchemas';
import * as lifecycleService from '../services/lifecycleService';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../services/ticketService';

/**
 * Retrieve chronological status history timeline for a ticket
 * GET /api/tickets/:id/history
 */
export const getTicketHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const history = await lifecycleService.getTicketHistory(
      ticketId,
      req.user!
    );

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
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
 * Retrieve SLA and milestone lifecycle analytics for a ticket
 * GET /api/tickets/:id/lifecycle
 */
export const getTicketLifecycleAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const analytics = await lifecycleService.getTicketLifecycleAnalytics(
      ticketId,
      req.user!
    );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
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
 * Retrieve permitted next states from current status based on user role
 * GET /api/tickets/:id/allowed-transitions
 */
export const getAllowedTransitions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const result = await lifecycleService.getAllowedTransitionsForTicket(
      ticketId,
      req.user!
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
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
 * Execute a formal FSM status transition on a ticket
 * POST /api/tickets/:id/transition
 */
export const transitionTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const parseResult = transitionSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const result = await lifecycleService.executeStatusTransition(
      ticketId,
      parseResult.data,
      req.user!
    );

    res.status(200).json({
      success: true,
      message: `Ticket successfully transitioned to ${parseResult.data.targetStatus}`,
      data: result,
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
 * Global audit trail log for system administrators
 * GET /api/audit-logs
 */
export const getGlobalAuditLog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = auditLogQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Invalid query parameters: ${errorMessages}`,
      });
      return;
    }

    const result = await lifecycleService.getGlobalStatusAuditLog(parseResult.data);

    res.status(200).json({
      success: true,
      data: result.logs,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};
