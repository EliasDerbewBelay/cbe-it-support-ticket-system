import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { hashPassword } from '../utils/authUtils';
import {
  CreateUserInput,
  UpdateUserInput,
  UserQueryFilters,
} from '../schemas/userSchemas';
import { NotFoundError, ValidationError } from './ticketService';
import { createNotification } from './notificationService';

/**
 * Format user record for API response (guarantees both camelCase and snake_case properties)
 */
export const formatUser = (user: any) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  role: user.role,
  departmentId: user.department_id,
  department_id: user.department_id,
  employeeId: user.employee_id,
  employee_id: user.employee_id,
  phoneNumber: user.phone_number,
  phone_number: user.phone_number,
  isActive: user.is_active,
  is_active: user.is_active,
  department: user.department
    ? {
        id: user.department.id,
        name: user.department.name,
        description: user.department.description,
      }
    : null,
  _count: user._count
    ? {
        submittedTickets: user._count.submitted_tickets,
        technicianAssignments: user._count.technician_assignments,
        submitted_tickets: user._count.submitted_tickets,
        technician_assignments: user._count.technician_assignments,
      }
    : undefined,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

/**
 * List users with administrative filters and pagination
 */
export const listUsers = async (filters: UserQueryFilters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.usersWhereInput = {};

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.departmentId) {
    where.department_id = filters.departmentId;
  }

  if (filters.isActive !== undefined) {
    where.is_active = filters.isActive;
  }

  if (filters.search) {
    where.OR = [
      { first_name: { contains: filters.search, mode: 'insensitive' } },
      { last_name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { employee_id: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.users.count({ where }),
    prisma.users.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        employee_id: true,
        phone_number: true,
        is_active: true,
        department_id: true,
        department: {
          select: { id: true, name: true },
        },
        created_at: true,
        updated_at: true,
      },
    }),
  ]);

  return {
    users: users.map(formatUser),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Create a new user account (Employee, Technician, or Administrator)
 */
export const createUser = async (input: CreateUserInput) => {
  const normalizedEmail = input.email.trim().toLowerCase();

  // Check email collision
  const existingEmail = await prisma.users.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingEmail) {
    throw new ValidationError('A user with this email address already exists.');
  }

  // Check staff ID collision if provided
  if (input.employeeId) {
    const existingEmployeeId = await prisma.users.findUnique({
      where: { employee_id: input.employeeId.trim() },
    });

    if (existingEmployeeId) {
      throw new ValidationError('A user with this Employee / Staff ID already exists.');
    }
  }

  // Verify department exists and is active
  const department = await prisma.departments.findUnique({
    where: { id: input.departmentId },
  });

  if (!department || !department.is_active) {
    throw new ValidationError('The specified department does not exist or is inactive.');
  }

  // Hash password using bcrypt (12 rounds)
  const passwordHash = await hashPassword(input.password);

  const newUser = await prisma.users.create({
    data: {
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role: input.role,
      department_id: input.departmentId,
      employee_id: input.employeeId ? input.employeeId.trim() : null,
      phone_number: input.phoneNumber ? input.phoneNumber.trim() : null,
      is_active: true,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      role: true,
      department_id: true,
      employee_id: true,
      phone_number: true,
      is_active: true,
      department: {
        select: { id: true, name: true },
      },
      created_at: true,
      updated_at: true,
    },
  });

  // Post welcome security notification for newly created user
  await createNotification({
    userId: newUser.id,
    title: 'Welcome to CBE IT Support Portal',
    message: 'Your account has been registered by an administrator. Please keep your login credentials secure.',
    type: 'INFO',
  });

  return formatUser(newUser);
};

/**
 * Get detailed profile of a single user
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      role: true,
      department_id: true,
      employee_id: true,
      phone_number: true,
      is_active: true,
      department: {
        select: { id: true, name: true, description: true },
      },
      _count: {
        select: {
          submitted_tickets: true,
          technician_assignments: true,
        },
      },
      created_at: true,
      updated_at: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return formatUser(user);
};

/**
 * Update user details, email, password, or active status
 */
export const updateUser = async (
  userId: string,
  adminId: string,
  input: UpdateUserInput
) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Enforce BR-12: Users cannot modify their own role or active status
  if (userId === adminId) {
    if (input.role && input.role !== user.role) {
      throw new ValidationError('Administrators cannot modify their own role.');
    }
    if (input.isActive !== undefined && input.isActive !== user.is_active) {
      throw new ValidationError('Administrators cannot deactivate their own account.');
    }
  }

  // If email is updated, verify format and check uniqueness against other users
  let normalizedEmail: string | undefined = undefined;
  if (input.email) {
    normalizedEmail = input.email.trim().toLowerCase();
    if (normalizedEmail !== user.email) {
      const existingEmail = await prisma.users.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingEmail && existingEmail.id !== userId) {
        throw new ValidationError('A user with this email address already exists.');
      }
    }
  }

  // If staff/employee ID is updated, check uniqueness
  let trimmedEmployeeId: string | null | undefined = undefined;
  if (input.employeeId !== undefined) {
    trimmedEmployeeId = input.employeeId && input.employeeId.trim() !== '' ? input.employeeId.trim() : null;
    if (trimmedEmployeeId && trimmedEmployeeId !== user.employee_id) {
      const existingEmployee = await prisma.users.findUnique({
        where: { employee_id: trimmedEmployeeId },
      });
      if (existingEmployee && existingEmployee.id !== userId) {
        throw new ValidationError('A user with this Employee / Staff ID already exists.');
      }
    }
  }

  // If password is provided, validate length and hash
  let passwordHash: string | undefined = undefined;
  if (input.password && input.password.trim().length > 0) {
    if (input.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long.');
    }
    passwordHash = await hashPassword(input.password);
  }

  // If department is updated, verify it exists and is active
  if (input.departmentId) {
    const department = await prisma.departments.findUnique({
      where: { id: input.departmentId },
    });

    if (!department || !department.is_active) {
      throw new ValidationError('The specified department does not exist or is inactive.');
    }
  }

  const trimmedPhone = input.phoneNumber !== undefined
    ? (input.phoneNumber && input.phoneNumber.trim() !== '' ? input.phoneNumber.trim() : null)
    : undefined;

  const updatedUser = await prisma.users.update({
    where: { id: userId },
    data: {
      first_name: input.firstName ? input.firstName.trim() : undefined,
      last_name: input.lastName ? input.lastName.trim() : undefined,
      email: normalizedEmail,
      password_hash: passwordHash,
      phone_number: trimmedPhone,
      department_id: input.departmentId || undefined,
      employee_id: trimmedEmployeeId,
      role: input.role || undefined,
      is_active: input.isActive !== undefined ? input.isActive : undefined,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      role: true,
      department_id: true,
      employee_id: true,
      phone_number: true,
      is_active: true,
      department: {
        select: { id: true, name: true },
      },
      created_at: true,
      updated_at: true,
    },
  });

  // Post notifications if credentials or security details were updated
  if (passwordHash) {
    await createNotification({
      userId,
      title: 'Security Alert: Password Updated',
      message: 'Your account password has been updated by an administrator. Please log in with your new credentials.',
      type: 'INFO',
    });
  }

  if (normalizedEmail && normalizedEmail !== user.email) {
    await createNotification({
      userId,
      title: 'Account Update: Email Changed',
      message: `Your account login email was updated from ${user.email} to ${normalizedEmail} by an administrator.`,
      type: 'INFO',
    });
  }

  return formatUser(updatedUser);
};

/**
 * Reset password of a user account directly by an administrator
 */
export const resetUserPassword = async (
  userId: string,
  _adminId: string,
  newPassword: string
) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const trimmed = newPassword ? newPassword.trim() : '';
  if (trimmed.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long.');
  }

  const passwordHash = await hashPassword(trimmed);

  await prisma.users.update({
    where: { id: userId },
    data: {
      password_hash: passwordHash,
    },
  });

  await createNotification({
    userId,
    title: 'Security Notice: Password Reset',
    message: 'Your account password has been reset by an administrator. Please log in using your new credentials.',
    type: 'INFO',
  });

  return { success: true };
};

/**
 * Fetch list of active technicians with active workload count
 */
export const getActiveTechnicians = async () => {
  const technicians = await prisma.users.findMany({
    where: {
      role: 'TECHNICIAN',
      is_active: true,
    },
    orderBy: { first_name: 'asc' },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      phone_number: true,
      department: {
        select: { name: true },
      },
      technician_assignments: {
        where: { is_current: true },
        select: { id: true },
      },
    },
  });

  return technicians.map((tech) => ({
    id: tech.id,
    firstName: tech.first_name,
    lastName: tech.last_name,
    email: tech.email,
    phoneNumber: tech.phone_number,
    departmentName: tech.department?.name,
    activeTicketCount: tech.technician_assignments.length,
  }));
};
