import { prisma } from '../config/database';
import { LoginInput } from '../schemas/authSchemas';
import { LoginResponse, SanitizedUser, JwtTokenPayload } from '../types/auth';
import { comparePassword, generateToken } from '../utils/authUtils';

export class AuthenticationError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = statusCode;
  }
}

export class AuthorizationError extends Error {
  statusCode: number;
  constructor(message: string = 'Forbidden: Access is denied', statusCode: number = 403) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = statusCode;
  }
}

/**
 * Authenticate user credentials and return JWT token with sanitized profile
 */
export const login = async (input: LoginInput): Promise<LoginResponse> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  // Find user by unique email with associated department
  const user = await prisma.users.findUnique({
    where: { email: normalizedEmail },
    include: {
      department: true,
    },
  });

  if (!user) {
    throw new AuthenticationError('Invalid email or password', 401);
  }

  // Check account activation status
  if (!user.is_active) {
    throw new AuthenticationError('Account has been deactivated. Please contact an IT administrator.', 403);
  }

  // Verify password hash
  const isPasswordValid = await comparePassword(input.password, user.password_hash);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password', 401);
  }

  // Generate cryptographically signed JWT token
  const tokenPayload: JwtTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    departmentId: user.department_id,
  };

  const token = generateToken(tokenPayload);

  // Return sanitized user profile (never expose password_hash)
  const sanitizedUser: SanitizedUser = {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    departmentId: user.department_id,
    employeeId: user.employee_id,
    phoneNumber: user.phone_number,
    isActive: user.is_active,
    department: user.department
      ? {
          id: user.department.id,
          name: user.department.name,
          description: user.department.description,
        }
      : null,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };

  return {
    token,
    user: sanitizedUser,
  };
};

/**
 * Retrieve user by ID for session hydration
 */
export const getUserById = async (userId: string): Promise<SanitizedUser | null> => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      department: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    departmentId: user.department_id,
    employeeId: user.employee_id,
    phoneNumber: user.phone_number,
    isActive: user.is_active,
    department: user.department
      ? {
          id: user.department.id,
          name: user.department.name,
          description: user.department.description,
        }
      : null,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};
