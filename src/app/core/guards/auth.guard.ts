import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Cette application est destinée au SUPER_ADMIN (gestion des boutiques) et à
// l'ADMIN de boutique (gestion de ses employés/produits/ventes) : on vérifie
// aussi le rôle ici, au cas où un token d'un autre type (ex: EMPLOYEE) se
// retrouverait stocké dans le navigateur.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (
    authService.isAuthenticated() &&
    (authService.hasRole('SUPER_ADMIN') || authService.hasRole('ADMIN'))
  ) {
    return true;
  }
  authService.logout();
  return router.createUrlTree(['/login']);
};

// Restreint une route à un sous-ensemble de rôles, en renvoyant l'utilisateur
// vers la page d'accueil de SON rôle plutôt que de simplement bloquer l'accès.
export function roleGuard(allowedRoles: Array<'SUPER_ADMIN' | 'ADMIN'>): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const role = authService.currentUser()?.role;
    if (role && allowedRoles.includes(role as 'SUPER_ADMIN' | 'ADMIN')) {
      return true;
    }
    return router.createUrlTree([role === 'SUPER_ADMIN' ? '/boutiques' : '/dashboard']);
  };
}
