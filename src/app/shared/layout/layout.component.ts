import { Component, computed, signal } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { IconComponent } from '../components/icon/icon.component';
import { FullNamePipe } from '../pipes/full-name.pipe';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';

const SUPER_ADMIN_NAV = [
  { path: '/dashboard', label: 'Tableau de bord', icon: 'grid' },
  { path: '/boutiques', label: 'Boutiques', icon: 'store' },
  { path: '/gestionnaires', label: 'Gestionnaires', icon: 'users' },
  { path: '/activite', label: 'Activité', icon: 'activity' },
];

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, FullNamePipe, ConfirmDialogComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  readonly navLinks = computed(() => SUPER_ADMIN_NAV);

  // Menu burger : masqué par défaut sur mobile, ouvert en tiroir par-dessus le contenu.
  readonly menuOpen = signal(false);

  constructor(
    readonly authService: AuthService,
    readonly realtime: RealtimeService,
    private router: Router,
  ) {
    // Flux en direct tant que la session est ouverte.
    this.realtime.connect();
    // Referme le menu à chaque navigation (clic sur un lien, retour navigateur...).
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.menuOpen.set(false);
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.realtime.disconnect();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
