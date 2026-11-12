import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Cette interface web est réservée au technicien (SUPER_ADMIN) : création des
// boutiques et de leur compte gestionnaire. Les gestionnaires (ADMIN) et leurs
// employés travaillent exclusivement depuis l'application mobile ; si un de
// leurs tokens se retrouve stocké dans le navigateur, on le rejette ici.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.hasRole('SUPER_ADMIN')) {
    return true;
  }
  authService.logout();
  return router.createUrlTree(['/login']);
};

export function roleGuard(allowedRoles: Array<'SUPER_ADMIN'>): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const role = authService.currentUser()?.role;
    if (role && allowedRoles.includes(role as 'SUPER_ADMIN')) {
      return true;
    }
    return router.createUrlTree(['/login']);
  };
}
