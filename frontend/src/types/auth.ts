export type UserRole = 'EMPLOYEE' | 'TECHNICIAN' | 'ADMINISTRATOR';

export interface DepartmentInfo {
  id: string;
  name: string;
  description?: string | null;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  departmentId: string;
  employeeId?: string | null;
  phoneNumber?: string | null;
  isActive: boolean;
  department?: DepartmentInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
