import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/layout/layout.component';

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
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'boutiques',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadComponent: () =>
          import('./features/boutiques/boutiques-list.component').then((m) => m.BoutiquesListComponent),
      },
      {
        path: 'boutiques/new',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadComponent: () =>
          import('./features/boutiques/boutique-form.component').then((m) => m.BoutiqueFormComponent),
      },
      {
        path: 'boutiques/:id/edit',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadComponent: () =>
          import('./features/boutiques/boutique-form.component').then((m) => m.BoutiqueFormComponent),
      },
      {
        path: 'users',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/users/users-list.component').then((m) => m.UsersListComponent),
      },
      {
        path: 'users/new',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/users/user-form.component').then((m) => m.UserFormComponent),
      },
      {
        path: 'users/:id/edit',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/users/user-form.component').then((m) => m.UserFormComponent),
      },
      {
        path: 'products',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./features/products/products-list.component').then((m) => m.ProductsListComponent),
      },
      {
        path: 'products/new',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./features/products/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'products/:id/edit',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./features/products/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'sales',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/sales/sales-list.component').then((m) => m.SalesListComponent),
      },
      {
        path: 'sales/:id',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/sales/sale-detail.component').then((m) => m.SaleDetailComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
