import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlatformService } from '../../core/services/platform.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { isActivityNotLogin, onRealtime } from '../../core/services/realtime.util';
import { PlatformOverview } from '../../core/models/platform.model';
import { BarChartComponent } from '../../shared/components/bar-chart/bar-chart.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { FcfaPipe } from '../../shared/pipes/fcfa.pipe';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { describeActivity } from '../../shared/utils/activity.util';

/** Vue d'ensemble de la plateforme pour le technicien. */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, BarChartComponent, IconComponent, FcfaPipe, TimeAgoPipe],
  template: `
    <div class="page-header">
      <div>
        <h1>Tableau de bord</h1>
        <p class="page-subtitle">Vue d'ensemble de toutes les boutiques</p>
      </div>
      <button class="btn btn-secondary" (click)="load()" [disabled]="loading()">Actualiser</button>
    </div>

    @if (error()) {
      <div class="card error-card">
        <p>{{ error() }}</p>
        <button class="btn" (click)="load()">Réessayer</button>
      </div>
    } @else if (!data()) {
      <div class="stat-grid">
        @for (i of [1, 2, 3, 4]; track i) {
          <div class="skeleton" style="height: 92px"></div>
        }
      </div>
      <div class="skeleton" style="height: 260px; margin-bottom: 1.5rem"></div>
    } @else {
      @let d = data()!;

      <div class="stat-grid">
        <a class="stat-card link" routerLink="/boutiques">
          <div class="stat-label">Boutiques actives</div>
          <div class="stat-value">{{ d.boutiques.actives }}<span class="muted" style="font-size: 1rem"> / {{ d.boutiques.total }}</span></div>
          <div class="stat-sub">{{ d.boutiques.inactives }} désactivée{{ d.boutiques.inactives > 1 ? 's' : '' }}</div>
        </a>
        <a class="stat-card link" routerLink="/gestionnaires">
          <div class="stat-label">Gestionnaires actifs</div>
          <div class="stat-value">{{ d.gestionnaires.actifs }}<span class="muted" style="font-size: 1rem"> / {{ d.gestionnaires.total }}</span></div>
          <div class="stat-sub">{{ d.employes.actifs }} employé{{ d.employes.actifs > 1 ? 's' : '' }} actif{{ d.employes.actifs > 1 ? 's' : '' }}</div>
        </a>
        <div class="stat-card" [class.tone-warning]="d.produits.enRupture > 0">
          <div class="stat-label">Produits en vente</div>
          <div class="stat-value">{{ d.produits.actifs }}</div>
          <div class="stat-sub">{{ d.produits.enRupture }} en rupture · {{ d.produits.stockBas }} stock bas</div>
        </div>
        <div class="stat-card" [class.tone-warning]="d.credits.nombre > 0">
          <div class="stat-label">Crédits en cours</div>
          <div class="stat-value">{{ d.credits.montant | fcfa }}</div>
          <div class="stat-sub">{{ d.credits.nombre }} vente{{ d.credits.nombre > 1 ? 's' : '' }} non réglée{{ d.credits.nombre > 1 ? 's' : '' }}</div>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-card tone-success">
          <div class="stat-label">Ventes aujourd'hui</div>
          <div class="stat-value">{{ d.ventes.jour.chiffreAffaires | fcfa }}</div>
          <div class="stat-sub">{{ d.ventes.jour.nombre }} vente{{ d.ventes.jour.nombre > 1 ? 's' : '' }}</div>
        </div>
        <div class="stat-card tone-success">
          <div class="stat-label">Ce mois</div>
          <div class="stat-value">{{ d.ventes.mois.chiffreAffaires | fcfa }}</div>
          <div class="stat-sub">{{ d.ventes.mois.nombre }} vente{{ d.ventes.mois.nombre > 1 ? 's' : '' }}</div>
        </div>
        <div class="stat-card tone-success">
          <div class="stat-label">Cette année</div>
          <div class="stat-value">{{ d.ventes.annee.chiffreAffaires | fcfa }}</div>
          <div class="stat-sub">{{ d.ventes.annee.nombre }} vente{{ d.ventes.annee.nombre > 1 ? 's' : '' }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Depuis le début</div>
          <div class="stat-value">{{ d.ventes.total.chiffreAffaires | fcfa }}</div>
          <div class="stat-sub">{{ d.ventes.total.nombre }} vente{{ d.ventes.total.nombre > 1 ? 's' : '' }}</div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.5rem">
        <h3 class="section-title">
          Chiffre d'affaires, 30 derniers jours
          <span class="muted" style="font-weight: 500; font-size: 0.8rem">toutes boutiques</span>
        </h3>
        <app-bar-chart [points]="chartPoints()" />
      </div>

      <div class="grid-2">
        <div class="card">
          <h3 class="section-title">Meilleures boutiques du mois</h3>
          @if (d.topBoutiques.length) {
            @for (b of d.topBoutiques; track b.id; let i = $index) {
              <a class="rank-row" [routerLink]="['/boutiques', b.id]" style="color: inherit">
                <span class="rank-pos">{{ i + 1 }}</span>
                <span class="rank-main">
                  <span class="rank-name">
                    <span>{{ b.nom }}</span>
                    <span>{{ b.chiffreAffaires | fcfa }}</span>
                  </span>
                  <span class="rank-bar"><span [style.width.%]="share(b.chiffreAffaires)"></span></span>
                </span>
              </a>
            }
          } @else {
            <p class="empty-state">Aucune vente ce mois-ci.</p>
          }
        </div>

        <div class="card">
          <h3 class="section-title">
            À surveiller
            <span class="badge badge-warning">{{ d.sansActivite.length }}</span>
          </h3>
          <p class="form-hint" style="margin-top: -0.4rem">Boutiques actives sans vente depuis 7 jours.</p>
          @if (d.sansActivite.length) {
            <ul class="activity-list">
              @for (b of d.sansActivite; track b.id) {
                <li>
                  <span class="activity-icon tone-warning"><app-icon name="alert" [size]="17" /></span>
                  <div class="activity-body">
                    <a class="table-link" [routerLink]="['/boutiques', b.id]">{{ b.nom }}</a>
                    <div class="activity-detail">
                      {{ b.ville || 'Ville non renseignée' }} ·
                      {{ b.derniereVente ? 'dernière vente ' + (b.derniereVente | timeAgo) : 'aucune vente enregistrée' }}
                    </div>
                  </div>
                </li>
              }
            </ul>
          } @else {
            <p class="empty-state">Toutes les boutiques actives vendent. 👍</p>
          }
        </div>
      </div>

      <div class="card">
        <h3 class="section-title">
          Activité récente
          <a routerLink="/activite" style="font-size: 0.82rem">Tout voir</a>
        </h3>
        @if (d.activiteRecente.length) {
          <ul class="activity-list">
            @for (log of d.activiteRecente; track log.id) {
              @let a = describe(log);
              <li>
                <span class="activity-icon" [class]="'tone-' + a.tone"><app-icon [name]="a.icon" [size]="17" /></span>
                <div class="activity-body">
                  <div class="activity-title">{{ a.label }}</div>
                  <div class="activity-detail">
                    {{ a.detail }}@if (log.boutique) { · <a [routerLink]="['/boutiques', log.boutique.id]">{{ log.boutique.nom }}</a> }
                  </div>
                </div>
                <span class="activity-time">{{ log.createdAt | timeAgo }}</span>
              </li>
            }
          </ul>
        } @else {
          <p class="empty-state">Aucune activité pour le moment.</p>
        }
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly platform = inject(PlatformService);
  private readonly realtime = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly data = signal<PlatformOverview | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly describe = describeActivity;

  ngOnInit(): void {
    this.load();
    // Chiffres en direct : ventes, crédits, stock, boutiques et comptes.
    onRealtime(
      this.realtime,
      this.destroyRef,
      (e) => ['sale.created', 'credit.settled', 'stock.updated', 'product.changed'].includes(e.type) || isActivityNotLogin(e),
      () => this.load(),
    );
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.platform.overview().subscribe({
      next: (overview) => {
        this.data.set(overview);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set("Impossible de charger le tableau de bord. Vérifiez votre connexion puis réessayez.");
      },
    });
  }

  chartPoints() {
    return (this.data()?.serie ?? []).map((p) => ({ date: p.date, value: p.chiffreAffaires, count: p.nombre }));
  }

  /** Part du chiffre d'affaires de la meilleure boutique (barre de classement). */
  share(value: number): number {
    const top = this.data()?.topBoutiques[0]?.chiffreAffaires || 1;
    return Math.max(4, Math.round((value / top) * 100));
  }
}
