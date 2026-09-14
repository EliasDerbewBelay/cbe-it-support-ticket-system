import { user_role } from '@prisma/client';

export interface UserPayload {
  id: string;
  email: string;
  role: user_role;
  departmentId: string;
  firstName: string;
  lastName: string;
}

export interface JwtTokenPayload {
  sub: string;
  email: string;
  role: user_role;
  departmentId: string;
}

export interface SanitizedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: user_role;
  departmentId: string;
  employeeId: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  department?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  token: string;
  user: SanitizedUser;
}
