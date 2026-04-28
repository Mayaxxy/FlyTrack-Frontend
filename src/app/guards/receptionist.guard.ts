import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Permite el acceso solo a usuarios con rol RECEPCIONISTA. */
export const receptionistGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isReceptionist()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
