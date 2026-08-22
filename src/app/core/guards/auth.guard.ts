import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Cette application n'est destinée qu'au SUPER_ADMIN : on vérifie aussi le rôle ici,
// au cas où un token d'un autre type se retrouverait stocké dans le navigateur.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.hasRole('SUPER_ADMIN')) {
    return true;
  }
  authService.logout();
  return router.createUrlTree(['/login']);
};
