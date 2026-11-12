import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/layout/layout.component';

// Espace du technicien (SUPER_ADMIN) : suivi des boutiques et des gestionnaires.
// La création et la modification se font dans des tiroirs (drawers) à droite,
// sans changer de page.
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'boutiques',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadComponent: () =>
          import('./features/boutiques/boutiques-list.component').then((m) => m.BoutiquesListComponent),
      },
      {
        path: 'boutiques/:id',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadComponent: () =>
          import('./features/boutiques/boutique-detail.component').then((m) => m.BoutiqueDetailComponent),
      },
      {
        path: 'gestionnaires',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadComponent: () => import('./features/users/users-list.component').then((m) => m.UsersListComponent),
      },
      {
        path: 'activite',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadComponent: () => import('./features/activity/activity.component').then((m) => m.ActivityComponent),
      },
      // Anciennes adresses.
      { path: 'users', redirectTo: 'gestionnaires', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
