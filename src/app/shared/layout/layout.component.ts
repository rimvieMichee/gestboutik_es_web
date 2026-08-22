import { Component, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../components/icon/icon.component';
import { FullNamePipe } from '../pipes/full-name.pipe';

const SUPER_ADMIN_NAV = [{ path: '/boutiques', label: 'Boutiques', icon: 'store' }];

const ADMIN_NAV = [
  { path: '/dashboard', label: 'Tableau de bord', icon: 'grid' },
  { path: '/users', label: 'Employés', icon: 'users' },
  { path: '/products', label: 'Produits', icon: 'box' },
  { path: '/sales', label: 'Ventes', icon: 'receipt' },
];

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, FullNamePipe],
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
