import { ticket_status, user_role } from '@prisma/client';

export interface TransitionRule {
  from: ticket_status;
  to: ticket_status;
  authorizedRoles: user_role[];
  requiresReason?: boolean;
  requiresResolutionNotes?: boolean;
  requiresTechnician?: boolean;
  description: string;
}

/**
 * Enterprise ITIL / CBE Finite State Machine Definitions
 */
export const FSM_TRANSITIONS: TransitionRule[] = [
  // 1. Dispatching: OPEN -> ASSIGNED (Administrator exclusive)
  {
    from: 'OPEN',
    to: 'ASSIGNED',
    authorizedRoles: ['ADMINISTRATOR'],
    requiresTechnician: true,
    description: 'Administrator dispatches ticket to an active technician',
  },
  // 2. Cancellation: OPEN -> CANCELLED (Employee owner or Administrator)
  {
    from: 'OPEN',
    to: 'CANCELLED',
    authorizedRoles: ['EMPLOYEE', 'ADMINISTRATOR'],
    requiresReason: true,
    description: 'Ticket cancelled prior to dispatch with mandatory reason',
  },
  // 3. Troubleshooting commenced: ASSIGNED -> IN_PROGRESS (Technician or Administrator)
  {
    from: 'ASSIGNED',
    to: 'IN_PROGRESS',
    authorizedRoles: ['TECHNICIAN', 'ADMINISTRATOR'],
    description: 'Technician begins active diagnosis and troubleshooting',
  },
  // 4. Reassignment: ASSIGNED -> ASSIGNED (Administrator exclusive)
  {
    from: 'ASSIGNED',
    to: 'ASSIGNED',
    authorizedRoles: ['ADMINISTRATOR'],
    requiresTechnician: true,
    description: 'Administrator reassigns ticket to a different technician',
  },
  // 5. Cancellation while assigned: ASSIGNED -> CANCELLED (Administrator exclusive)
  {
    from: 'ASSIGNED',
    to: 'CANCELLED',
    authorizedRoles: ['ADMINISTRATOR'],
    requiresReason: true,
    description: 'Administrator cancels ticket after assignment with reason',
  },
  // 6. Resolution: IN_PROGRESS -> RESOLVED (Technician or Administrator)
  {
    from: 'IN_PROGRESS',
    to: 'RESOLVED',
    authorizedRoles: ['TECHNICIAN', 'ADMINISTRATOR'],
    requiresResolutionNotes: true,
    description: 'Technician marks ticket resolved with mandatory resolution notes',
  },
  // 7. Quick fix resolution: ASSIGNED -> RESOLVED (Technician or Administrator)
  {
    from: 'ASSIGNED',
    to: 'RESOLVED',
    authorizedRoles: ['TECHNICIAN', 'ADMINISTRATOR'],
    requiresResolutionNotes: true,
    description: 'Technician immediately resolves incident with resolution notes',
  },
  // 8. Operational Closure: RESOLVED -> CLOSED (Administrator exclusive, BR-08)
  {
    from: 'RESOLVED',
    to: 'CLOSED',
    authorizedRoles: ['ADMINISTRATOR'],
    description: 'Administrator verifies service restoration and formally closes ticket',
  },
  // 9. Reopen / Rework: RESOLVED -> IN_PROGRESS (Administrator or Technician)
  {
    from: 'RESOLVED',
    to: 'IN_PROGRESS',
    authorizedRoles: ['TECHNICIAN', 'ADMINISTRATOR'],
    requiresReason: true,
    description: 'Ticket reopened for further troubleshooting before closure',
  },
];

/**
 * Terminal statuses that represent irreversible endpoints (BR-08)
 */
export const TERMINAL_STATES: ReadonlySet<ticket_status> = new Set(['CLOSED', 'CANCELLED']);

/**
 * Check if a given status is a terminal state
 */
export const isTerminalState = (status: ticket_status): boolean => {
  return TERMINAL_STATES.has(status);
};

/**
 * Find matching transition rule for a requested transition and user role
 */
export const getValidTransitionRule = (
  from: ticket_status,
  to: ticket_status,
  role: user_role
): TransitionRule | undefined => {
  return FSM_TRANSITIONS.find(
    (t) => t.from === from && t.to === to && t.authorizedRoles.includes(role)
  );
};

/**
 * Retrieve all legal next states from the current status for a given role
 */
export const getAllowedTransitions = (
  currentStatus: ticket_status,
  role: user_role
): Array<{ targetStatus: ticket_status; description: string }> => {
  if (isTerminalState(currentStatus)) {
    return [];
  }
  return FSM_TRANSITIONS.filter(
    (t) => t.from === currentStatus && t.authorizedRoles.includes(role)
  ).map((t) => ({
    targetStatus: t.to,
    description: t.description,
  }));
};
