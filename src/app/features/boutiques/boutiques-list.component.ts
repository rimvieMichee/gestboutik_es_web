import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Boutique, BoutiqueStatus, BoutiqueWithStats } from '../../core/models/boutique.model';
import { PaginationMeta } from '../../core/models/common.model';
import { BoutiquesService } from '../../core/services/boutiques.service';
import { errorText } from '../../core/services/http-error.util';
import { RealtimeService } from '../../core/services/realtime.service';
import { isActivityNotLogin, onRealtime } from '../../core/services/realtime.util';
import { ConfirmService } from '../../shared/components/confirm-dialog/confirm.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { FcfaPipe } from '../../shared/pipes/fcfa.pipe';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { BoutiqueDrawerComponent } from './boutique-drawer.component';

const SEVEN_DAYS = 7 * 24 * 3600 * 1000;

/** Liste des boutiques avec leurs indicateurs de suivi. */
@Component({
  selector: 'app-boutiques-list',
  standalone: true,
  imports: [RouterLink, FormsModule, PaginationComponent, IconComponent, FcfaPipe, TimeAgoPipe, BoutiqueDrawerComponent],
  template: `
    <div class="page-header">
      <div>
        <h1>Boutiques</h1>
        <p class="page-subtitle">Suivez l'activité de chaque boutique et de son gestionnaire</p>
      </div>
      <button class="btn" (click)="openCreate()"><app-icon name="plus" [size]="16" /> Nouvelle boutique</button>
    </div>

    <div class="toolbar">
      <input
        type="text"
        placeholder="Rechercher par nom ou ville..."
        [ngModel]="search()"
        (ngModelChange)="search.set($event)"
        (keyup.enter)="onFilter()"
      />
      <select [ngModel]="status()" (ngModelChange)="status.set($event); onFilter()" aria-label="Filtrer par statut">
        <option value="">Tous les statuts</option>
        <option value="ACTIVE">Actives</option>
        <option value="INACTIVE">Désactivées</option>
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
            <th>Boutique</th>
            <th>Gestionnaire</th>
            <th>Équipe &amp; stock</th>
            <th>Ventes du mois</th>
            <th>Dernière vente</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @if (loading() && !boutiques().length) {
            @for (i of [1, 2, 3, 4]; track i) {
              <tr><td colspan="7"><div class="skeleton" style="height: 22px"></div></td></tr>
            }
          }
          @for (b of boutiques(); track b.id) {
            <tr>
              <td>
                <a class="table-link" [routerLink]="['/boutiques', b.id]">{{ b.nom }}</a>
                <div class="identity-sub muted" style="font-size: 0.76rem">{{ b.ville || 'Ville non renseignée' }}{{ b.telephone ? ' · ' + b.telephone : '' }}</div>
              </td>
              <td>
                @if (b.gestionnaires.length) {
                  {{ b.gestionnaires[0].prenom }} {{ b.gestionnaires[0].nom }}
                  @if (b.gestionnaires.length > 1) {
                    <span class="badge badge-muted">+{{ b.gestionnaires.length - 1 }}</span>
                  }
                } @else {
                  <span class="badge badge-warning">Aucun</span>
                }
              </td>
              <td>
                {{ b.stats.employes }} employé{{ b.stats.employes > 1 ? 's' : '' }}
                <div class="muted" style="font-size: 0.76rem">{{ b.stats.produits }} produit{{ b.stats.produits > 1 ? 's' : '' }}</div>
              </td>
              <td>
                <strong>{{ b.stats.ventesMois.chiffreAffaires | fcfa }}</strong>
                <div class="muted" style="font-size: 0.76rem; white-space: normal; max-width: 170px">
                  {{ b.stats.ventesMois.nombre }} vente{{ b.stats.ventesMois.nombre > 1 ? 's' : '' }}
                  @if (b.stats.creditEnCours.montant > 0) {
                    · <span class="badge badge-warning" [title]="'Crédits non réglés : ' + (b.stats.creditEnCours.montant | fcfa)">{{ b.stats.creditEnCours.montant | fcfa }} à crédit</span>
                  }
                </div>
              </td>
              <td>
                {{ b.stats.derniereVente | timeAgo: 'Aucune vente' }}
                @if (isStale(b)) {
                  <div><span class="badge badge-warning" title="Aucune vente depuis plus de 7 jours">À relancer</span></div>
                }
              </td>
              <td>
                <span class="badge" [class.badge-success]="b.statut === 'ACTIVE'" [class.badge-danger]="b.statut === 'INACTIVE'">
                  {{ b.statut === 'ACTIVE' ? 'Active' : 'Désactivée' }}
                </span>
              </td>
              <td class="actions-cell">
                <a class="icon-btn" [routerLink]="['/boutiques', b.id]" title="Voir le suivi" aria-label="Voir le suivi"><app-icon name="chevron-right" [size]="16" /></a>
                <button class="icon-btn" (click)="openEdit(b)" title="Modifier" aria-label="Modifier"><app-icon name="pencil" [size]="16" /></button>
                <button class="icon-btn" [class.danger]="b.statut === 'ACTIVE'" (click)="toggleStatus(b)" [title]="b.statut === 'ACTIVE' ? 'Désactiver' : 'Activer'" [attr.aria-label]="b.statut === 'ACTIVE' ? 'Désactiver' : 'Activer'">
                  <app-icon name="power" [size]="16" />
                </button>
              </td>
            </tr>
          }
          @if (!loading() && !boutiques().length) {
            <tr><td colspan="7" class="empty-state">Aucune boutique{{ search() || status() ? ' pour ce filtre' : '. Créez la première avec « Nouvelle boutique »' }}.</td></tr>
          }
        </tbody>
      </table>
      <app-pagination [meta]="meta()" (pageChange)="onPageChange($event)" />
    </div>

    <app-boutique-drawer
      [open]="drawerOpen()"
      [boutique]="editing()"
      (closed)="drawerOpen.set(false)"
      (saved)="load()"
    />
  `,
})
export class BoutiquesListComponent implements OnInit {
  private readonly boutiquesService = inject(BoutiquesService);
  private readonly confirm = inject(ConfirmService);
  private readonly realtime = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly boutiques = signal<BoutiqueWithStats[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly search = signal('');
  readonly status = signal<'' | BoutiqueStatus>('');
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly drawerOpen = signal(false);
  readonly editing = signal<Boutique | null>(null);
  private page = 1;

  ngOnInit(): void {
    this.load();
    // Ventes, crédits, produits et comptes : les indicateurs de chaque boutique bougent en direct.
    onRealtime(
      this.realtime,
      this.destroyRef,
      (e) => ['sale.created', 'credit.settled', 'product.changed'].includes(e.type) || isActivityNotLogin(e),
      () => this.load(),
    );
  }

  load(): void {
    this.loading.set(true);
    this.boutiquesService
      .findAll({ page: this.page, limit: 20, search: this.search(), statut: this.status() || undefined })
      .subscribe({
        next: (res) => {
          this.boutiques.set(res.data);
          this.meta.set(res.meta);
          this.loading.set(false);
          this.errorMessage.set(null);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(errorText(err, 'Impossible de charger les boutiques.'));
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

  openCreate(): void {
    this.editing.set(null);
    this.drawerOpen.set(true);
  }

  openEdit(boutique: Boutique): void {
    this.editing.set(boutique);
    this.drawerOpen.set(true);
  }

  /** Boutique active sans vente depuis plus de 7 jours (ou jamais). */
  isStale(b: BoutiqueWithStats): boolean {
    if (b.statut !== 'ACTIVE') return false;
    const last = b.stats.derniereVente;
    return !last || Date.now() - new Date(last).getTime() > SEVEN_DAYS;
  }

  async toggleStatus(boutique: Boutique): Promise<void> {
    const deactivate = boutique.statut === 'ACTIVE';
    const ok = await this.confirm.ask({
      title: deactivate ? 'Désactiver cette boutique ?' : 'Activer cette boutique ?',
      message: deactivate
        ? `« ${boutique.nom} » et tous ses comptes (gestionnaire, employés) ne pourront plus se connecter.`
        : `« ${boutique.nom} » et ses comptes pourront de nouveau se connecter.`,
      confirmLabel: deactivate ? 'Désactiver' : 'Activer',
      danger: deactivate,
    });
    if (!ok) return;
    this.boutiquesService
      .changeStatus(boutique.id, deactivate ? 'INACTIVE' : 'ACTIVE')
      .subscribe({ next: () => this.load(), error: (err) => this.errorMessage.set(errorText(err)) });
  }
}
