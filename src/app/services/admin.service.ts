import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminUser,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  AdminChangeRoleRequest,
  AdminResetPasswordRequest,
  AuditLog,
  AuditAction,
  Role
} from '../models/admin.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  // ── Usuarios ──────────────────────────────────────────────────────────────

  createUser(request: AdminCreateUserRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.base}/users`, request);
  }

  getUsers(role?: Role, active?: boolean): Observable<AdminUser[]> {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    if (active !== undefined) params = params.set('active', String(active));
    return this.http.get<AdminUser[]>(`${this.base}/users`, { params });
  }

  getUserById(id: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.base}/users/${id}`);
  }

  updateUser(id: number, request: AdminUpdateUserRequest): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.base}/users/${id}`, request);
  }

  changeRole(id: number, request: AdminChangeRoleRequest): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.base}/users/${id}/role`, request);
  }

  deactivateUser(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/users/${id}/deactivate`, {});
  }

  reactivateUser(id: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.base}/users/${id}/reactivate`, {});
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/${id}`);
  }

  resetPassword(id: number, request: AdminResetPasswordRequest): Observable<void> {
    return this.http.patch<void>(`${this.base}/users/${id}/reset-password`, request);
  }

  // ── Auditoría ─────────────────────────────────────────────────────────────

  getAuditLogs(targetId?: number, action?: AuditAction): Observable<AuditLog[]> {
    let params = new HttpParams();
    if (targetId) params = params.set('targetId', String(targetId));
    if (action) params = params.set('action', action);
    return this.http.get<AuditLog[]>(`${this.base}/audit-logs`, { params });
  }
}
