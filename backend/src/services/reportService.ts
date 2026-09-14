import { prisma } from '../config/database';
import { ticket_priority, user_role } from '@prisma/client';

/**
 * Summary KPI cards for executive dashboard
 */
export const getSummaryMetrics = async () => {
  const [
    totalTickets,
    openTickets,
    assignedTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    cancelledTickets,
    criticalActiveTickets,
    totalUsers,
    totalTechnicians,
    totalEmployees,
    totalAdmins,
    totalDepartments,
    totalCategories,
  ] = await Promise.all([
    prisma.tickets.count(),
    prisma.tickets.count({ where: { status: 'OPEN' } }),
    prisma.tickets.count({ where: { status: 'ASSIGNED' } }),
    prisma.tickets.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.tickets.count({ where: { status: 'RESOLVED' } }),
    prisma.tickets.count({ where: { status: 'CLOSED' } }),
    prisma.tickets.count({ where: { status: 'CANCELLED' } }),
    prisma.tickets.count({
      where: {
        priority: 'CRITICAL',
        status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
      },
    }),
    prisma.users.count({ where: { is_active: true } }),
    prisma.users.count({ where: { role: 'TECHNICIAN', is_active: true } }),
    prisma.users.count({ where: { role: 'EMPLOYEE', is_active: true } }),
    prisma.users.count({ where: { role: 'ADMINISTRATOR', is_active: true } }),
    prisma.departments.count({ where: { is_active: true } }),
    prisma.categories.count({ where: { is_active: true } }),
  ]);

  const activeTickets = openTickets + assignedTickets + inProgressTickets;
  const resolutionRate =
    totalTickets > 0
      ? Number((((resolvedTickets + closedTickets) / totalTickets) * 100).toFixed(1))
      : 0;

  return {
    tickets: {
      total: totalTickets,
      active: activeTickets,
      open: openTickets,
      assigned: assignedTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
      cancelled: cancelledTickets,
      criticalActive: criticalActiveTickets,
      resolutionRatePercentage: resolutionRate,
    },
    users: {
      totalActive: totalUsers,
      technicians: totalTechnicians,
      employees: totalEmployees,
      administrators: totalAdmins,
    },
    organizational: {
      departmentsCount: totalDepartments,
      categoriesCount: totalCategories,
    },
  };
};

/**
 * Breakdown of tickets by category
 */
export const getTicketsByCategory = async () => {
  const categories = await prisma.categories.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { tickets: true },
      },
      tickets: {
        select: { status: true, priority: true },
      },
    },
  });

  return categories.map((cat) => {
    const total = cat._count.tickets;
    const active = cat.tickets.filter((t) =>
      ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)
    ).length;
    const resolved = cat.tickets.filter((t) => t.status === 'RESOLVED').length;
    const closed = cat.tickets.filter((t) => t.status === 'CLOSED').length;
    const cancelled = cat.tickets.filter((t) => t.status === 'CANCELLED').length;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      isActive: cat.is_active,
      totalTickets: total,
      activeTickets: active,
      resolvedTickets: resolved,
      closedTickets: closed,
      cancelledTickets: cancelled,
    };
  });
};

/**
 * Breakdown of tickets by requesting department
 */
export const getTicketsByDepartment = async () => {
  const departments = await prisma.departments.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { tickets: true, users: true },
      },
      tickets: {
        select: { status: true, priority: true },
      },
    },
  });

  return departments.map((dept) => {
    const total = dept._count.tickets;
    const active = dept.tickets.filter((t) =>
      ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)
    ).length;
    const resolved = dept.tickets.filter((t) =>
      ['RESOLVED', 'CLOSED'].includes(t.status)
    ).length;

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      isActive: dept.is_active,
      employeeCount: dept._count.users,
      totalTickets: total,
      activeTickets: active,
      resolvedOrClosedTickets: resolved,
    };
  });
};

/**
 * Technician workload and performance metrics
 */
export const getTechnicianWorkload = async () => {
  const technicians = await prisma.users.findMany({
    where: { role: 'TECHNICIAN' },
    orderBy: { first_name: 'asc' },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone_number: true,
      is_active: true,
      department: {
        select: { name: true },
      },
      technician_assignments: {
        select: {
          id: true,
          is_current: true,
          ticket: {
            select: {
              status: true,
            },
          },
        },
      },
      resolved_tickets: {
        select: {
          id: true,
        },
      },
    },
  });

  return technicians.map((tech) => {
    const activeAssignments = tech.technician_assignments.filter(
      (a) =>
        a.is_current &&
        ['ASSIGNED', 'IN_PROGRESS'].includes(a.ticket.status)
    ).length;

    const totalHistoricalAssigned = tech.technician_assignments.length;
    const totalResolved = tech.resolved_tickets.length;

    return {
      technicianId: tech.id,
      name: `${tech.first_name} ${tech.last_name}`,
      email: tech.email,
      phoneNumber: tech.phone_number,
      isActive: tech.is_active,
      department: tech.department?.name,
      activeTicketsCount: activeAssignments,
      totalResolvedCount: totalResolved,
      totalHistoricalAssignments: totalHistoricalAssigned,
    };
  });
};

/**
 * Performance metrics including average resolution times (hours) by priority
 */
export const getPerformanceMetrics = async () => {
  const resolvedTickets = await prisma.tickets.findMany({
    where: {
      resolved_at: { not: null },
    },
    select: {
      priority: true,
      created_at: true,
      resolved_at: true,
    },
  });

  const priorityTimes: Record<ticket_priority, number[]> = {
    LOW: [],
    MEDIUM: [],
    HIGH: [],
    CRITICAL: [],
  };

  const allTimes: number[] = [];

  for (const t of resolvedTickets) {
    if (t.resolved_at && t.created_at) {
      const diffMs = t.resolved_at.getTime() - t.created_at.getTime();
      const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));
      allTimes.push(diffHours);
      priorityTimes[t.priority].push(diffHours);
    }
  }

  const calcAvg = (arr: number[]) =>
    arr.length > 0
      ? Number((arr.reduce((acc, v) => acc + v, 0) / arr.length).toFixed(2))
      : 0;

  return {
    totalResolvedSample: resolvedTickets.length,
    overallAverageResolutionHours: calcAvg(allTimes),
    averageResolutionHoursByPriority: {
      LOW: calcAvg(priorityTimes.LOW),
      MEDIUM: calcAvg(priorityTimes.MEDIUM),
      HIGH: calcAvg(priorityTimes.HIGH),
      CRITICAL: calcAvg(priorityTimes.CRITICAL),
    },
  };
};
