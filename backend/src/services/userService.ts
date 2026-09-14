import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { hashPassword } from '../utils/authUtils';
import {
  CreateUserInput,
  UpdateUserInput,
  UserQueryFilters,
} from '../schemas/userSchemas';
import { NotFoundError, ValidationError } from './ticketService';

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
    users,
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

  return newUser;
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

  return user;
};

/**
 * Update user details or active status
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

  // If department is updated, verify it exists and is active
  if (input.departmentId) {
    const department = await prisma.departments.findUnique({
      where: { id: input.departmentId },
    });

    if (!department || !department.is_active) {
      throw new ValidationError('The specified department does not exist or is inactive.');
    }
  }

  const updatedUser = await prisma.users.update({
    where: { id: userId },
    data: {
      first_name: input.firstName ? input.firstName.trim() : undefined,
      last_name: input.lastName ? input.lastName.trim() : undefined,
      phone_number: input.phoneNumber !== undefined ? (input.phoneNumber ? input.phoneNumber.trim() : null) : undefined,
      department_id: input.departmentId || undefined,
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

  return updatedUser;
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
