import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent), canActivate: [authGuard] },
  { path: 'checkin/:flightCode', loadComponent: () => import('./components/checkin/checkin.component').then(m => m.CheckInComponent), canActivate: [authGuard] },
  { path: 'boarding-pass/:checkInId', loadComponent: () => import('./components/boarding-pass/boarding-pass.component').then(m => m.BoardingPassComponent), canActivate: [authGuard] },
  { path: 'notifications', loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent), canActivate: [authGuard] },
  { path: 'baggage', loadComponent: () => import('./components/baggage/baggage.component').then(m => m.BaggageComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];
