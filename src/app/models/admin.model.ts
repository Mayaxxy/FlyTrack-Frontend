export type Role = 'ADMIN' | 'RECEPCIONISTA' | 'PASSENGER';
export type AuditAction = 'CREATE' | 'UPDATE' | 'ROLE_CHANGE' | 'DEACTIVATE' | 'REACTIVATE' | 'DELETE';

export interface AdminUser {
  id: number;
  documentId: string;
  documentType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCreateUserRequest {
  documentType: string;
  documentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}

export interface AdminUpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  documentId?: string;
  documentType?: string;
}

export interface AdminChangeRoleRequest {
  role: Role;
}

export interface AdminResetPasswordRequest {
  newPassword: string;
}

export interface AuditLog {
  id: number;
  adminId: number;
  targetId: number | null;
  targetEmail: string;
  action: AuditAction;
  description: string;
  createdAt: string;
}
