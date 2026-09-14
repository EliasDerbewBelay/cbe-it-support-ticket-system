import { Request, Response, NextFunction } from 'express';
import {
  createTicketSchema,
  cancelTicketSchema,
  assignTicketSchema,
  closeTicketSchema,
  resolveTicketSchema,
  startWorkSchema,
  updateTicketStatusSchema,
  assignedTicketQuerySchema,
  createCommentSchema,
  ticketQuerySchema,
} from '../schemas/ticketSchemas';
import * as ticketService from '../services/ticketService';

/**
 * Create a new support ticket
 * POST /api/tickets
 */
export const createTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = createTicketSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const employeeId = req.user!.id;
    const departmentId = req.user!.departmentId;

    const ticket = await ticketService.createTicket(
      employeeId,
      departmentId,
      parseResult.data
    );

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket,
    });
  } catch (error) {
    if (
      error instanceof ticketService.ValidationError ||
      error instanceof ticketService.NotFoundError ||
      error instanceof ticketService.ForbiddenError
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
 * Get current employee's submitted tickets
 * GET /api/tickets/my
 */
export const getMyTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = ticketQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Invalid query parameters: ${errorMessages}`,
      });
      return;
    }

    const employeeId = req.user!.id;
    const result = await ticketService.getEmployeeTickets(
      employeeId,
      parseResult.data
    );

    res.status(200).json({
      success: true,
      data: result.tickets,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single ticket details by ID
 * GET /api/tickets/:id
 */
export const getTicketById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const ticket = await ticketService.getTicketDetails(ticketId, req.user!);

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    if (
      error instanceof ticketService.NotFoundError ||
      error instanceof ticketService.ForbiddenError
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
 * Cancel an open ticket
 * POST /api/tickets/:id/cancel
 */
export const cancelTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const parseResult = cancelTicketSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const updated = await ticketService.cancelTicket(
      ticketId,
      req.user!.id,
      req.user!.role,
      parseResult.data.reason
    );

    res.status(200).json({
      success: true,
      message: 'Ticket cancelled successfully',
      data: updated,
    });
  } catch (error) {
    if (
      error instanceof ticketService.ValidationError ||
      error instanceof ticketService.NotFoundError ||
      error instanceof ticketService.ForbiddenError
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
 * Add a comment or update to a ticket
 * POST /api/tickets/:id/comments
 */
export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const parseResult = createCommentSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const comment = await ticketService.addComment(
      ticketId,
      req.user!.id,
      req.user!.role,
      parseResult.data.content,
      parseResult.data.isInternal
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment,
    });
  } catch (error) {
    if (
      error instanceof ticketService.ValidationError ||
      error instanceof ticketService.NotFoundError ||
      error instanceof ticketService.ForbiddenError
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
 * Get comments for a ticket
 * GET /api/tickets/:id/comments
 */
export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const comments = await ticketService.getComments(ticketId, req.user!);

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    if (
      error instanceof ticketService.NotFoundError ||
      error instanceof ticketService.ForbiddenError
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
 * Get employee dashboard metrics summary
 * GET /api/tickets/my/summary
 */
export const getMyDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const summary = await ticketService.getEmployeeDashboardSummary(req.user!.id);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get global list of all tickets (Administrator console)
 * GET /api/tickets
 */
export const getAllTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = ticketQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Invalid query parameters: ${errorMessages}`,
      });
      return;
    }

    const result = await ticketService.getAllTickets(parseResult.data, req.user);

    res.status(200).json({
      success: true,
      data: result.tickets,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign or reassign ticket to a technician
 * POST /api/tickets/:id/assign
 */
export const assignTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const parseResult = assignTicketSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const result = await ticketService.assignTechnician(
      ticketId,
      parseResult.data.technicianId,
      req.user!.id,
      parseResult.data.assignmentNotes
    );

    res.status(200).json({
      success: true,
      message: 'Technician assigned successfully',
      data: result,
    });
  } catch (error) {
    if (
      error instanceof ticketService.ValidationError ||
      error instanceof ticketService.NotFoundError ||
      error instanceof ticketService.ForbiddenError
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
 * Formally close a resolved ticket
 * POST /api/tickets/:id/close
 */
export const closeTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const parseResult = closeTicketSchema.safeParse(req.body || {});

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const updated = await ticketService.closeTicket(
      ticketId,
      req.user!.id,
      parseResult.data?.notes
    );

    res.status(200).json({
      success: true,
      message: 'Ticket closed successfully',
      data: updated,
    });
  } catch (error) {
    if (
      error instanceof ticketService.ValidationError ||
      error instanceof ticketService.NotFoundError ||
      error instanceof ticketService.ForbiddenError
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
 * Mark ticket as RESOLVED with resolution notes
 * POST /api/tickets/:id/resolve
 */
export const resolveTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const parseResult = resolveTicketSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const updated = await ticketService.resolveTicket(
      ticketId,
      req.user!.id,
      req.user!.role,
      parseResult.data.resolutionNotes
    );

    res.status(200).json({
      success: true,
      message: 'Ticket resolved successfully',
      data: updated,
    });
  } catch (error) {
    if (
      error instanceof ticketService.ValidationError ||
      error instanceof ticketService.NotFoundError ||
      error instanceof ticketService.ForbiddenError
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
 * Start work on an assigned ticket
 * POST /api/tickets/:id/start-work
 */
export const startWork = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const parseResult = startWorkSchema.safeParse(req.body || {});

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const updated = await ticketService.startWork(
      ticketId,
      req.user!.id,
      req.user!.role,
      parseResult.data?.notes
    );

    res.status(200).json({
      success: true,
      message: 'Work started on ticket successfully',
      data: updated,
    });
  } catch (error) {
    if (
      error instanceof ticketService.ValidationError ||
      error instanceof ticketService.NotFoundError ||
      error instanceof ticketService.ForbiddenError
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
 * Update ticket lifecycle status
 * PATCH /api/tickets/:id/status
 */
export const updateTicketStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const parseResult = updateTicketStatusSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Validation failed: ${errorMessages}`,
      });
      return;
    }

    const updated = await ticketService.updateTicketStatus(
      ticketId,
      req.user!.id,
      req.user!.role,
      parseResult.data
    );

    res.status(200).json({
      success: true,
      message: `Ticket status successfully transitioned to ${parseResult.data.status}`,
      data: updated,
    });
  } catch (error) {
    if (
      error instanceof ticketService.ValidationError ||
      error instanceof ticketService.NotFoundError ||
      error instanceof ticketService.ForbiddenError
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
 * Retrieve queue of tickets assigned to the logged-in technician
 * GET /api/tickets/assigned
 */
export const getAssignedTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = assignedTicketQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({
        success: false,
        message: `Invalid query parameters: ${errorMessages}`,
      });
      return;
    }

    const result = await ticketService.getAssignedTickets(
      req.user!.id,
      parseResult.data
    );

    res.status(200).json({
      success: true,
      data: result.tickets,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve technician dashboard summary and workload metrics
 * GET /api/tickets/technician/summary
 */
export const getTechnicianDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const summary = await ticketService.getTechnicianDashboardSummary(req.user!.id);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

