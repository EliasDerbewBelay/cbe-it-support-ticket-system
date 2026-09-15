import { prisma } from '../config/database';
import { ticket_priority } from '@prisma/client';

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
    criticalPending,
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
    totalTickets,
    openTickets,
    assignedTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    cancelledTickets,
    criticalPending,
    resolutionRatePercent: resolutionRate,
    // Nested for backwards compatibility
    tickets: {
      total: totalTickets,
      active: activeTickets,
      open: openTickets,
      assigned: assignedTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
      cancelled: cancelledTickets,
      criticalActive: criticalPending,
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
 * Breakdown of tickets by category with count and percentage
 */
export const getTicketsByCategory = async () => {
  const totalTickets = await prisma.tickets.count();

  const categories = await prisma.categories.findMany({
    where: { is_active: true },
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
    const count = cat._count.tickets;
    const active = cat.tickets.filter((t) =>
      ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)
    ).length;
    const resolved = cat.tickets.filter((t) => t.status === 'RESOLVED').length;
    const closed = cat.tickets.filter((t) => t.status === 'CLOSED').length;
    const cancelled = cat.tickets.filter((t) => t.status === 'CANCELLED').length;
    const percentage =
      totalTickets > 0 ? Number(((count / totalTickets) * 100).toFixed(1)) : 0;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      count,
      percentage,
      totalTickets: count,
      activeTickets: active,
      resolvedTickets: resolved,
      closedTickets: closed,
      cancelledTickets: cancelled,
      isActive: cat.is_active,
    };
  });
};

/**
 * Breakdown of tickets by requesting department with count and percentage
 */
export const getTicketsByDepartment = async () => {
  const totalTickets = await prisma.tickets.count();

  const departments = await prisma.departments.findMany({
    where: { is_active: true },
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
    const count = dept._count.tickets;
    const active = dept.tickets.filter((t) =>
      ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)
    ).length;
    const resolved = dept.tickets.filter((t) =>
      ['RESOLVED', 'CLOSED'].includes(t.status)
    ).length;
    const percentage =
      totalTickets > 0 ? Number(((count / totalTickets) * 100).toFixed(1)) : 0;

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      count,
      percentage,
      totalTickets: count,
      activeTickets: active,
      resolvedOrClosedTickets: resolved,
      employeeCount: dept._count.users,
      isActive: dept.is_active,
    };
  });
};

/**
 * Technician workload and performance metrics
 */
export const getTechnicianWorkload = async () => {
  const technicians = await prisma.users.findMany({
    where: { role: 'TECHNICIAN', is_active: true },
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
        include: {
          ticket: {
            select: {
              id: true,
              status: true,
              priority: true,
              resolved_by: true,
            },
          },
        },
      },
      resolved_tickets: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  return technicians.map((tech) => {
    const fullName = `${tech.first_name} ${tech.last_name}`;

    const assignedTicketIds = new Set(
      tech.technician_assignments.map((a) => a.ticket.id)
    );
    const assignedCount = assignedTicketIds.size;

    const inProgressCount = tech.technician_assignments.filter(
      (a) => a.is_current && a.ticket.status === 'IN_PROGRESS'
    ).length;

    const activeAssignments = tech.technician_assignments.filter(
      (a) => a.is_current && ['ASSIGNED', 'IN_PROGRESS'].includes(a.ticket.status)
    ).length;

    const resolvedCount = tech.resolved_tickets.length;

    return {
      technicianId: tech.id,
      technicianName: fullName,
      name: fullName,
      assignedCount,
      inProgressCount,
      resolvedCount,
      activeTicketsCount: activeAssignments,
      totalResolvedCount: resolvedCount,
      totalHistoricalAssignments: tech.technician_assignments.length,
      email: tech.email,
      phoneNumber: tech.phone_number,
      isActive: tech.is_active,
      department: tech.department?.name,
    };
  });
};

/**
 * Performance metrics including average resolution times (hours) and SLA compliance
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
  let withinSlaCount = 0;

  const slaTargets: Record<ticket_priority, number> = {
    CRITICAL: 4,
    HIGH: 8,
    MEDIUM: 24,
    LOW: 72,
  };

  for (const t of resolvedTickets) {
    if (t.resolved_at && t.created_at) {
      const diffMs = t.resolved_at.getTime() - t.created_at.getTime();
      const diffHours = Math.max(0, Number((diffMs / (1000 * 60 * 60)).toFixed(2)));
      allTimes.push(diffHours);
      priorityTimes[t.priority].push(diffHours);

      const target = slaTargets[t.priority] || 24;
      if (diffHours <= target) {
        withinSlaCount++;
      }
    }
  }

  const calcAvg = (arr: number[]) =>
    arr.length > 0
      ? Number((arr.reduce((acc, v) => acc + v, 0) / arr.length).toFixed(1))
      : 0;

  const totalResolved = resolvedTickets.length;
  const avgHours = calcAvg(allTimes);
  const withinSlaPercent =
    totalResolved > 0
      ? Number(((withinSlaCount / totalResolved) * 100).toFixed(1))
      : 100;
  const breachedSlaPercent = Number((100 - withinSlaPercent).toFixed(1));

  return {
    avgResolutionHours: avgHours,
    withinSlaPercent,
    breachedSlaPercent,
    totalResolvedCount: totalResolved,
    totalResolvedSample: totalResolved,
    overallAverageResolutionHours: avgHours,
    averageResolutionHoursByPriority: {
      LOW: calcAvg(priorityTimes.LOW),
      MEDIUM: calcAvg(priorityTimes.MEDIUM),
      HIGH: calcAvg(priorityTimes.HIGH),
      CRITICAL: calcAvg(priorityTimes.CRITICAL),
    },
  };
};
