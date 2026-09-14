import { Router } from 'express';
import {
  createTicket,
  getMyTickets,
  getMyDashboardSummary,
  getTicketById,
  cancelTicket,
  addComment,
  getComments,
  getAllTickets,
  assignTicket,
  resolveTicket,
  closeTicket,
  startWork,
  updateTicketStatus,
  getAssignedTickets,
  getTechnicianDashboardSummary,
} from '../controllers/ticketController';
import {
  getTicketHistory,
  getTicketLifecycleAnalytics,
  getAllowedTransitions,
  transitionTicket,
} from '../controllers/lifecycleController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// ============================================================================
// 1. TICKET CREATION & GLOBAL/SCOPED LISTING
// ============================================================================

// Submit a new ticket (Employee or Administrator)
router.post(
  '/',
  authenticate,
  authorize('EMPLOYEE', 'ADMINISTRATOR'),
  createTicket
);

// Multi-role ticket listing (Admin gets global, Tech gets assigned queue, Employee gets own)
router.get(
  '/',
  authenticate,
  getAllTickets
);

// ============================================================================
// 2. ROLE-SPECIFIC QUEUES & DASHBOARDS (Must precede /:id routes)
// ============================================================================

// Employee Dashboard Summary metrics
router.get(
  '/my/summary',
  authenticate,
  getMyDashboardSummary
);

// Employee's own submitted tickets
router.get(
  '/my',
  authenticate,
  getMyTickets
);

// Technician Dashboard Summary metrics
router.get(
  '/technician/summary',
  authenticate,
  authorize('TECHNICIAN', 'ADMINISTRATOR'),
  getTechnicianDashboardSummary
);

// Technician's assigned tickets queue
router.get(
  '/assigned',
  authenticate,
  authorize('TECHNICIAN', 'ADMINISTRATOR'),
  getAssignedTickets
);

// Technician dashboard summary alias (/assigned/summary)
router.get(
  '/assigned/summary',
  authenticate,
  authorize('TECHNICIAN', 'ADMINISTRATOR'),
  getTechnicianDashboardSummary
);

// ============================================================================
// 3. SINGLE TICKET VIEW & LIFECYCLE STATE ACTIONS
// ============================================================================

// View single ticket details (Enforces ownership / technician assignment check)
router.get(
  '/:id',
  authenticate,
  getTicketById
);

// View chronological status history audit timeline
router.get(
  '/:id/history',
  authenticate,
  getTicketHistory
);

// View comprehensive lifecycle metrics and SLA stage analytics
router.get(
  '/:id/lifecycle',
  authenticate,
  getTicketLifecycleAnalytics
);

// Retrieve permitted next states from current status based on user role
router.get(
  '/:id/allowed-transitions',
  authenticate,
  getAllowedTransitions
);

// Execute a formal FSM status transition on a ticket
router.post(
  '/:id/transition',
  authenticate,
  transitionTicket
);

// Start work on assigned ticket: transitions ASSIGNED -> IN_PROGRESS
router.post(
  '/:id/start-work',
  authenticate,
  authorize('TECHNICIAN', 'ADMINISTRATOR'),
  startWork
);

// Transition ticket lifecycle status (PATCH /status with IN_PROGRESS or RESOLVED)
router.patch(
  '/:id/status',
  authenticate,
  authorize('TECHNICIAN', 'ADMINISTRATOR'),
  updateTicketStatus
);

// Assign or Reassign technician (Administrator exclusive)
router.post(
  '/:id/assign',
  authenticate,
  authorize('ADMINISTRATOR'),
  assignTicket
);

// Mark ticket as RESOLVED with mandatory resolution notes (Technician or Administrator)
router.post(
  '/:id/resolve',
  authenticate,
  authorize('TECHNICIAN', 'ADMINISTRATOR'),
  resolveTicket
);

// Formally close a resolved ticket (Administrator exclusive)
router.post(
  '/:id/close',
  authenticate,
  authorize('ADMINISTRATOR'),
  closeTicket
);

// Cancel an open ticket (Employee can cancel while in OPEN; Administrator at OPEN/ASSIGNED)
router.post(
  '/:id/cancel',
  authenticate,
  authorize('EMPLOYEE', 'ADMINISTRATOR'),
  cancelTicket
);

// ============================================================================
// 4. COMMENTS & TROUBLESHOOTING NOTES
// ============================================================================

// Add a communication comment or internal diagnostic note
router.post(
  '/:id/comments',
  authenticate,
  addComment
);

// View comments list (Internal notes stripped for employees)
router.get(
  '/:id/comments',
  authenticate,
  getComments
);

export default router;
