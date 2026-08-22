import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  readonly navLinks = [
    { path: '/dashboard', label: 'Tableau de bord' },
    { path: '/boutiques', label: 'Boutiques' },
    { path: '/users', label: 'Employés' },
    { path: '/products', label: 'Produits' },
    { path: '/sales', label: 'Ventes' },
  ];

  constructor(
    readonly authService: AuthService,
    private router: Router,
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
