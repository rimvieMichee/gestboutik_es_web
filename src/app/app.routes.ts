import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
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
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'boutiques',
        loadComponent: () =>
          import('./features/boutiques/boutiques-list.component').then((m) => m.BoutiquesListComponent),
      },
      {
        path: 'boutiques/new',
        loadComponent: () =>
          import('./features/boutiques/boutique-form.component').then((m) => m.BoutiqueFormComponent),
      },
      {
        path: 'boutiques/:id/edit',
        loadComponent: () =>
          import('./features/boutiques/boutique-form.component').then((m) => m.BoutiqueFormComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users-list.component').then((m) => m.UsersListComponent),
      },
      {
        path: 'users/new',
        loadComponent: () => import('./features/users/user-form.component').then((m) => m.UserFormComponent),
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./features/users/user-form.component').then((m) => m.UserFormComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/products-list.component').then((m) => m.ProductsListComponent),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/products/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./features/products/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'sales',
        loadComponent: () => import('./features/sales/sales-list.component').then((m) => m.SalesListComponent),
      },
      {
        path: 'sales/:id',
        loadComponent: () => import('./features/sales/sale-detail.component').then((m) => m.SaleDetailComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
