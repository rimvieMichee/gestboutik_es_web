import { Component, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

const SUPER_ADMIN_NAV = [{ path: '/boutiques', label: 'Boutiques' }];

const ADMIN_NAV = [
  { path: '/dashboard', label: 'Tableau de bord' },
  { path: '/users', label: 'Employés' },
  { path: '/products', label: 'Produits' },
  { path: '/sales', label: 'Ventes' },
];

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  readonly navLinks = computed(() =>
    this.authService.currentUser()?.role === 'SUPER_ADMIN' ? SUPER_ADMIN_NAV : ADMIN_NAV,
  );

  constructor(
    readonly authService: AuthService,
    private router: Router,
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
