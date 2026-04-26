import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, Passenger } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private currentUserSubject = new BehaviorSubject<Passenger | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private getUserFromStorage(): Passenger | null {
    const user = localStorage.getItem('currentUser');
    if (!user || user === 'undefined' || user === 'null') {
      return null;
    }
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('currentUser');
      return null;
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): Passenger | null {
    return this.currentUserSubject.value;
  }

  getProfile(): Observable<Passenger> {
    return this.http.get<Passenger>(`${environment.apiUrl}/auth/profile`);
  }

  updateProfile(payload: any): Observable<Passenger> {
    return this.http.put<Passenger>(`${environment.apiUrl}/auth/profile`, payload)
      .pipe(tap(updated => this.updateCurrentUser(updated)));
  }

  updateCurrentUser(user: Passenger): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'ADMIN';
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('currentUser', JSON.stringify(response.passenger));
    this.currentUserSubject.next(response.passenger);
  }
}
