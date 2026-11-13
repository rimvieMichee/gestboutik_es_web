import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BoutiqueWithStats } from '../../core/models/boutique.model';
import { PaginationMeta } from '../../core/models/common.model';
import { Gestionnaire, UserStatus } from '../../core/models/user.model';
import { BoutiquesService } from '../../core/services/boutiques.service';
import { errorText } from '../../core/services/http-error.util';
import { RealtimeService } from '../../core/services/realtime.service';
import { onRealtime } from '../../core/services/realtime.util';
import { UsersService } from '../../core/services/users.service';
import { ConfirmService } from '../../shared/components/confirm-dialog/confirm.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { GestionnaireDrawerComponent } from './gestionnaire-drawer.component';
import { PasswordDrawerComponent } from './password-drawer.component';

/** Suivi des gestionnaires de toutes les boutiques. */
@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    FormsModule, RouterLink, DatePipe, IconComponent, PaginationComponent, TimeAgoPipe,
    GestionnaireDrawerComponent, PasswordDrawerComponent,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Gestionnaires</h1>
        <p class="page-subtitle">Comptes qui dirigent chaque boutique depuis l'application mobile</p>
      </div>
      <button class="btn" (click)="openEdit(null)"><app-icon name="plus" [size]="16" /> Nouveau gestionnaire</button>
    </div>

    <div class="toolbar">
      <input
        type="text"
        placeholder="Rechercher par nom ou identifiant..."
        [ngModel]="search()"
        (ngModelChange)="search.set($event)"
        (keyup.enter)="onFilter()"
      />
      <select [ngModel]="boutiqueId()" (ngModelChange)="boutiqueId.set($event); onFilter()" aria-label="Filtrer par boutique">
        <option value="">Toutes les boutiques</option>
        @for (b of boutiques(); track b.id) {
          <option [value]="b.id">{{ b.nom }}</option>
        }
      </select>
      <select [ngModel]="status()" (ngModelChange)="status.set($event); onFilter()" aria-label="Filtrer par statut">
        <option value="">Tous les statuts</option>
        <option value="ACTIVE">Actifs</option>
        <option value="INACTIVE">Désactivés</option>
      </select>
      <button class="btn btn-secondary btn-sm" (click)="onFilter()">Rechercher</button>
    </div>

    <div class="card">
      @if (errorMessage()) {
        <p class="error-text">{{ errorMessage() }}</p>
      }
      <table class="data-table">
        <thead>
          <tr>
            <th>Gestionnaire</th>
            <th>Boutiques</th>
            <th>Téléphone</th>
            <th>Dernière connexion</th>
            <th>Créé le</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @if (loading() && !users().length) {
            @for (i of [1, 2, 3, 4]; track i) {
              <tr><td colspan="7"><div class="skeleton" style="height: 22px"></div></td></tr>
            }
          }
          @for (user of users(); track user.id) {
            <tr>
              <td>
                <span class="identity">
                  <span class="avatar">{{ initials(user) }}</span>
                  <span class="identity-text">
                    <strong>{{ user.prenom }} {{ user.nom }}</strong>
                    <span class="identity-sub">@{{ user.username }}</span>
                  </span>
                </span>
              </td>
              <td>
                @for (b of shopsOf(user); track b.id; let last = $last) {
                  <a class="table-link" [routerLink]="['/boutiques', b.id]">{{ b.nom }}</a>{{ last ? '' : ', ' }}
                } @empty {
                  <span class="muted">—</span>
                }
              </td>
              <td>{{ user.telephone || '—' }}</td>
              <td>
                @if (user.derniereConnexion) {
                  <span [title]="user.derniereConnexion | date: 'dd/MM/yyyy HH:mm'">{{ user.derniereConnexion | timeAgo }}</span>
                } @else {
                  <span class="muted">Jamais connecté</span>
                }
              </td>
              <td>{{ user.createdAt | date: 'dd/MM/yyyy' }}</td>
              <td>
                <span class="badge" [class.badge-success]="user.statut === 'ACTIVE'" [class.badge-danger]="user.statut === 'INACTIVE'">
                  {{ user.statut === 'ACTIVE' ? 'Actif' : 'Désactivé' }}
                </span>
              </td>
              <td class="actions-cell">
                <button class="icon-btn" (click)="openEdit(user)" title="Modifier" aria-label="Modifier"><app-icon name="pencil" [size]="16" /></button>
                <button class="icon-btn" (click)="openPassword(user)" title="Réinitialiser le mot de passe" aria-label="Réinitialiser le mot de passe"><app-icon name="key" [size]="16" /></button>
                <button class="icon-btn" [class.danger]="user.statut === 'ACTIVE'" (click)="toggleStatus(user)" [title]="user.statut === 'ACTIVE' ? 'Désactiver' : 'Activer'" [attr.aria-label]="user.statut === 'ACTIVE' ? 'Désactiver' : 'Activer'">
                  <app-icon name="power" [size]="16" />
                </button>
              </td>
            </tr>
          }
          @if (!loading() && !users().length) {
            <tr><td colspan="7" class="empty-state">Aucun gestionnaire{{ search() || boutiqueId() || status() ? ' pour ce filtre' : '' }}.</td></tr>
          }
        </tbody>
      </table>
      <app-pagination [meta]="meta()" (pageChange)="onPageChange($event)" />
    </div>

    <app-gestionnaire-drawer
      [open]="drawerOpen()"
      [gestionnaire]="editing()"
      [boutiques]="boutiques()"
      (closed)="drawerOpen.set(false)"
      (saved)="load()"
    />
    <app-password-drawer [open]="passwordOpen()" [gestionnaire]="passwordTarget()" (closed)="passwordOpen.set(false)" />
  `,
})
export class UsersListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly boutiquesService = inject(BoutiquesService);
  private readonly confirm = inject(ConfirmService);
  private readonly realtime = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = signal<Gestionnaire[]>([]);
  readonly boutiques = signal<BoutiqueWithStats[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly search = signal('');
  readonly boutiqueId = signal('');
  readonly status = signal<'' | UserStatus>('');
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly drawerOpen = signal(false);
  readonly editing = signal<Gestionnaire | null>(null);
  readonly passwordOpen = signal(false);
  readonly passwordTarget = signal<Gestionnaire | null>(null);
  private page = 1;

  ngOnInit(): void {
    this.boutiquesService.findAll({ limit: 100, sortBy: 'nom', sortOrder: 'asc' }).subscribe((res) => this.boutiques.set(res.data));
    this.load();
    // Création, désactivation ou connexion d'un compte : la liste suit en direct.
    onRealtime(this.realtime, this.destroyRef, (e) => e.type === 'activity', () => this.load(), 1200);
  }

  load(): void {
    this.loading.set(true);
    this.usersService
      .findAll({
        page: this.page,
        limit: 20,
        search: this.search(),
        boutiqueId: this.boutiqueId() || undefined,
        statut: this.status() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.users.set(res.data);
          this.meta.set(res.meta);
          this.loading.set(false);
          this.errorMessage.set(null);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(errorText(err, 'Impossible de charger les gestionnaires.'));
        },
      });
  }

  onFilter(): void {
    this.page = 1;
    this.load();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.load();
  }

  /** Toutes les boutiques d'un gestionnaire (à défaut, sa boutique unique). */
  shopsOf(u: Gestionnaire): Array<{ id: string; nom: string }> {
    if (u.boutiques?.length) return u.boutiques;
    return u.boutique ? [u.boutique] : [];
  }

  initials(u: Gestionnaire): string {
    return `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase() || '?';
  }

  openEdit(user: Gestionnaire | null): void {
    this.editing.set(user);
    this.drawerOpen.set(true);
  }

  openPassword(user: Gestionnaire): void {
    this.passwordTarget.set(user);
    this.passwordOpen.set(true);
  }

  async toggleStatus(user: Gestionnaire): Promise<void> {
    const deactivate = user.statut === 'ACTIVE';
    const ok = await this.confirm.ask({
      title: deactivate ? 'Désactiver ce gestionnaire ?' : 'Activer ce gestionnaire ?',
      message: `${user.prenom} ${user.nom} ${deactivate ? 'ne pourra plus se connecter.' : 'pourra de nouveau se connecter.'}`,
      confirmLabel: deactivate ? 'Désactiver' : 'Activer',
      danger: deactivate,
    });
    if (!ok) return;
    this.usersService
      .changeStatus(user.id, deactivate ? 'INACTIVE' : 'ACTIVE')
      .subscribe({ next: () => this.load(), error: (err) => this.errorMessage.set(errorText(err)) });
  }
}
