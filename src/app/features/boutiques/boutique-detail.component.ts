import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BoutiqueOverview, BoutiqueUser } from '../../core/models/boutique.model';
import { Gestionnaire } from '../../core/models/user.model';
import { BoutiquesService } from '../../core/services/boutiques.service';
import { errorText } from '../../core/services/http-error.util';
import { RealtimeService } from '../../core/services/realtime.service';
import { onRealtime } from '../../core/services/realtime.util';
import { UsersService } from '../../core/services/users.service';
import { BarChartComponent } from '../../shared/components/bar-chart/bar-chart.component';
import { ConfirmService } from '../../shared/components/confirm-dialog/confirm.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { FcfaPipe } from '../../shared/pipes/fcfa.pipe';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { describeActivity } from '../../shared/utils/activity.util';
import { GestionnaireDrawerComponent } from '../users/gestionnaire-drawer.component';
import { PasswordDrawerComponent } from '../users/password-drawer.component';
import { BoutiqueDrawerComponent } from './boutique-drawer.component';

/** Fiche de suivi d'une boutique : chiffres, équipe, ventes et activité récentes. */
@Component({
  selector: 'app-boutique-detail',
  standalone: true,
  imports: [
    RouterLink, DatePipe, IconComponent, BarChartComponent, FcfaPipe, TimeAgoPipe,
    BoutiqueDrawerComponent, GestionnaireDrawerComponent, PasswordDrawerComponent,
  ],
  template: `
    <p style="margin: 0 0 0.75rem"><a routerLink="/boutiques" class="muted">← Toutes les boutiques</a></p>

    @if (error()) {
      <div class="card error-card">
        <p>{{ error() }}</p>
        <button class="btn" (click)="load()">Réessayer</button>
      </div>
    } @else if (!data()) {
      <div class="skeleton" style="height: 70px; margin-bottom: 1rem"></div>
      <div class="stat-grid">
        @for (i of [1, 2, 3, 4]; track i) { <div class="skeleton" style="height: 92px"></div> }
      </div>
      <div class="skeleton" style="height: 240px"></div>
    } @else {
      @let d = data()!;
      @let b = d.boutique;

      <div class="page-header">
        <div>
          <h1 style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap">
            {{ b.nom }}
            <span class="badge" [class.badge-success]="b.statut === 'ACTIVE'" [class.badge-danger]="b.statut === 'INACTIVE'">
              {{ b.statut === 'ACTIVE' ? 'Active' : 'Désactivée' }}
            </span>
          </h1>
          <p class="page-subtitle">
            {{ [b.ville, b.adresse, b.telephone, b.email].filter(present).join(' · ') || 'Aucune coordonnée renseignée' }}
          </p>
        </div>
        <div class="actions-cell">
          <button class="btn btn-secondary" (click)="boutiqueDrawer.set(true)"><app-icon name="pencil" [size]="16" /> Modifier</button>
          <button class="btn btn-secondary" (click)="openGestionnaire(null)"><app-icon name="plus" [size]="16" /> Gestionnaire</button>
          <button class="btn" [class.btn-danger]="b.statut === 'ACTIVE'" (click)="toggleBoutique()">
            <app-icon name="power" [size]="16" /> {{ b.statut === 'ACTIVE' ? 'Désactiver' : 'Activer' }}
          </button>
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
        <div class="stat-card" [class.tone-warning]="d.credits.nombre > 0">
          <div class="stat-label">Crédits en cours</div>
          <div class="stat-value">{{ d.credits.montant | fcfa }}</div>
          <div class="stat-sub">{{ d.credits.nombre }} vente{{ d.credits.nombre > 1 ? 's' : '' }} non réglée{{ d.credits.nombre > 1 ? 's' : '' }}</div>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">Produits en vente</div>
          <div class="stat-value">{{ d.produits.actifs }}</div>
          <div class="stat-sub">{{ d.produits.archives }} archivé{{ d.produits.archives > 1 ? 's' : '' }}</div>
        </div>
        <div class="stat-card" [class.tone-danger]="d.produits.enRupture > 0">
          <div class="stat-label">En rupture</div>
          <div class="stat-value">{{ d.produits.enRupture }}</div>
        </div>
        <div class="stat-card" [class.tone-warning]="d.produits.stockBas > 0">
          <div class="stat-label">Stock bas</div>
          <div class="stat-value">{{ d.produits.stockBas }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Employés</div>
          <div class="stat-value">{{ d.employes.length }}</div>
          <div class="stat-sub">{{ activeCount(d.employes) }} actif{{ activeCount(d.employes) > 1 ? 's' : '' }}</div>
        </div>
      </div>

      <div class="grid-3-1">
        <div class="card">
          <h3 class="section-title">Chiffre d'affaires, 30 derniers jours</h3>
          <app-bar-chart [points]="chartPoints()" />
        </div>
        <div class="card">
          <h3 class="section-title">Produits les plus vendus <span class="muted" style="font-weight: 500; font-size: 0.78rem">ce mois</span></h3>
          @for (p of d.topProduits; track p.nom; let i = $index) {
            <div class="rank-row">
              <span class="rank-pos">{{ i + 1 }}</span>
              <span class="rank-main">
                <span class="rank-name"><span>{{ p.nom }}</span><span>{{ p.chiffreAffaires | fcfa }}</span></span>
                <span class="rank-bar"><span [style.width.%]="share(p.chiffreAffaires)"></span></span>
                <span class="muted" style="font-size: 0.74rem">{{ p.quantite }} vendu{{ p.quantite > 1 ? 's' : '' }}</span>
              </span>
            </div>
          } @empty {
            <p class="empty-state">Aucune vente ce mois-ci.</p>
          }
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.5rem">
        <h3 class="section-title">
          Gestionnaires
          <button class="btn btn-secondary btn-sm" (click)="openGestionnaire(null)"><app-icon name="plus" [size]="14" /> Ajouter</button>
        </h3>
        <table class="data-table">
          <thead><tr><th>Gestionnaire</th><th>Téléphone</th><th>Dernière connexion</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            @for (g of d.gestionnaires; track g.id) {
              <tr>
                <td>
                  <span class="identity">
                    <span class="avatar">{{ initials(g) }}</span>
                    <span class="identity-text"><strong>{{ g.prenom }} {{ g.nom }}</strong><span class="identity-sub">@{{ g.username }}</span></span>
                  </span>
                </td>
                <td>{{ g.telephone || '—' }}</td>
                <td>{{ g.derniereConnexion | timeAgo: 'Jamais connecté' }}</td>
                <td><span class="badge" [class.badge-success]="g.statut === 'ACTIVE'" [class.badge-danger]="g.statut === 'INACTIVE'">{{ g.statut === 'ACTIVE' ? 'Actif' : 'Désactivé' }}</span></td>
                <td class="actions-cell">
                  <button class="icon-btn" (click)="openGestionnaire(g)" title="Modifier" aria-label="Modifier"><app-icon name="pencil" [size]="16" /></button>
                  <button class="icon-btn" (click)="openPassword(g)" title="Réinitialiser le mot de passe" aria-label="Réinitialiser le mot de passe"><app-icon name="key" [size]="16" /></button>
                  <button class="icon-btn" [class.danger]="g.statut === 'ACTIVE'" (click)="toggleUser(g)" [title]="g.statut === 'ACTIVE' ? 'Désactiver' : 'Activer'" [attr.aria-label]="g.statut === 'ACTIVE' ? 'Désactiver' : 'Activer'"><app-icon name="power" [size]="16" /></button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="empty-state">Aucun gestionnaire : cette boutique ne peut pas être utilisée. Ajoutez-en un.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <div class="card" style="margin-bottom: 1.5rem">
        <h3 class="section-title">Employés <span class="muted" style="font-weight: 500; font-size: 0.78rem">créés par le gestionnaire</span></h3>
        <table class="data-table">
          <thead><tr><th>Employé</th><th>Téléphone</th><th>Dernière connexion</th><th>Statut</th></tr></thead>
          <tbody>
            @for (e of d.employes; track e.id) {
              <tr>
                <td>
                  <span class="identity">
                    <span class="avatar">{{ initials(e) }}</span>
                    <span class="identity-text"><strong>{{ e.prenom }} {{ e.nom }}</strong><span class="identity-sub">@{{ e.username }}</span></span>
                  </span>
                </td>
                <td>{{ e.telephone || '—' }}</td>
                <td>{{ e.derniereConnexion | timeAgo: 'Jamais connecté' }}</td>
                <td><span class="badge" [class.badge-success]="e.statut === 'ACTIVE'" [class.badge-danger]="e.statut === 'INACTIVE'">{{ e.statut === 'ACTIVE' ? 'Actif' : 'Désactivé' }}</span></td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="empty-state">Aucun employé pour le moment.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <div class="grid-2">
        <div class="card">
          <h3 class="section-title">Ventes récentes</h3>
          <table class="data-table" style="min-width: 0">
            <thead><tr><th>Vente</th><th>Montant</th><th>Statut</th></tr></thead>
            <tbody>
              @for (v of d.ventesRecentes; track v.id) {
                <tr>
                  <td>
                    <strong>{{ v.numeroVente }}</strong>
                    <div class="muted" style="font-size: 0.74rem">{{ v.date | date: 'dd/MM HH:mm' }} · {{ v.vendeur }} · {{ v.articles }} art.</div>
                  </td>
                  <td>{{ v.montantTotal | fcfa }}</td>
                  <td>
                    @if (v.isCredit && !v.creditRegleAt) {
                      <span class="badge badge-warning" [title]="'Emprunteur : ' + (v.clientNom || '—')">Crédit · {{ v.clientNom || '—' }}</span>
                    } @else if (v.isCredit) {
                      <span class="badge badge-success">Crédit réglé</span>
                    } @else {
                      <span class="badge badge-success">Payé</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="3" class="empty-state">Aucune vente.</td></tr>
              }
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3 class="section-title">Activité récente</h3>
          <ul class="activity-list">
            @for (log of d.activiteRecente; track log.id) {
              @let a = describe(log);
              <li>
                <span class="activity-icon" [class]="'tone-' + a.tone"><app-icon [name]="a.icon" [size]="17" /></span>
                <div class="activity-body">
                  <div class="activity-title">{{ a.label }}</div>
                  <div class="activity-detail">{{ a.detail }}</div>
                </div>
                <span class="activity-time">{{ log.createdAt | timeAgo }}</span>
              </li>
            } @empty {
              <li class="empty-state" style="display: block">Aucune activité.</li>
            }
          </ul>
        </div>
      </div>

      <app-boutique-drawer [open]="boutiqueDrawer()" [boutique]="b" (closed)="boutiqueDrawer.set(false)" (saved)="load()" />
      <app-gestionnaire-drawer
        [open]="gestionnaireDrawer()"
        [gestionnaire]="editingGestionnaire()"
        [boutiques]="[{ id: b.id, nom: b.nom, ville: b.ville }]"
        [presetBoutiqueId]="b.id"
        (closed)="gestionnaireDrawer.set(false)"
        (saved)="load()"
      />
      <app-password-drawer [open]="passwordDrawer()" [gestionnaire]="passwordTarget()" (closed)="passwordDrawer.set(false)" />
    }
  `,
})
export class BoutiqueDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly boutiquesService = inject(BoutiquesService);
  private readonly usersService = inject(UsersService);
  private readonly confirm = inject(ConfirmService);
  private readonly realtime = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly data = signal<BoutiqueOverview | null>(null);
  readonly error = signal<string | null>(null);
  readonly boutiqueDrawer = signal(false);
  readonly gestionnaireDrawer = signal(false);
  readonly editingGestionnaire = signal<Gestionnaire | null>(null);
  readonly passwordDrawer = signal(false);
  readonly passwordTarget = signal<Gestionnaire | null>(null);
  readonly describe = describeActivity;
  readonly present = (v: string | null | undefined) => !!v;

  private id = '';

  ngOnInit(): void {
    // Tout événement de CETTE boutique (vente, stock, crédit, compte, connexion
    // d'un de ses comptes) actualise la fiche en direct.
    onRealtime(
      this.realtime,
      this.destroyRef,
      (e) => e.data['boutiqueId'] === this.id,
      () => this.load(),
    );
    // Le composant est réutilisé si on passe d'une boutique à une autre.
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id') ?? '';
      this.data.set(null);
      this.load();
    });
  }

  load(): void {
    this.error.set(null);
    this.boutiquesService.overview(this.id).subscribe({
      next: (overview) => this.data.set(overview),
      error: (err) => this.error.set(errorText(err, 'Impossible de charger cette boutique.')),
    });
  }

  chartPoints() {
    return (this.data()?.serie ?? []).map((p) => ({ date: p.date, value: p.chiffreAffaires, count: p.nombre }));
  }

  share(value: number): number {
    const top = this.data()?.topProduits[0]?.chiffreAffaires || 1;
    return Math.max(4, Math.round((value / top) * 100));
  }

  initials(u: BoutiqueUser): string {
    return `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase() || '?';
  }

  activeCount(users: BoutiqueUser[]): number {
    return users.filter((u) => u.statut === 'ACTIVE').length;
  }

  openGestionnaire(g: BoutiqueUser | null): void {
    this.editingGestionnaire.set(g as Gestionnaire | null);
    this.gestionnaireDrawer.set(true);
  }

  openPassword(g: BoutiqueUser): void {
    this.passwordTarget.set(g as Gestionnaire);
    this.passwordDrawer.set(true);
  }

  async toggleBoutique(): Promise<void> {
    const b = this.data()?.boutique;
    if (!b) return;
    const deactivate = b.statut === 'ACTIVE';
    const ok = await this.confirm.ask({
      title: deactivate ? 'Désactiver cette boutique ?' : 'Activer cette boutique ?',
      message: deactivate
        ? `« ${b.nom} » et tous ses comptes ne pourront plus se connecter.`
        : `« ${b.nom} » et ses comptes pourront de nouveau se connecter.`,
      confirmLabel: deactivate ? 'Désactiver' : 'Activer',
      danger: deactivate,
    });
    if (!ok) return;
    this.boutiquesService.changeStatus(b.id, deactivate ? 'INACTIVE' : 'ACTIVE').subscribe(() => this.load());
  }

  async toggleUser(g: BoutiqueUser): Promise<void> {
    const deactivate = g.statut === 'ACTIVE';
    const ok = await this.confirm.ask({
      title: deactivate ? 'Désactiver ce gestionnaire ?' : 'Activer ce gestionnaire ?',
      message: `${g.prenom} ${g.nom} ${deactivate ? 'ne pourra plus se connecter.' : 'pourra de nouveau se connecter.'}`,
      confirmLabel: deactivate ? 'Désactiver' : 'Activer',
      danger: deactivate,
    });
    if (!ok) return;
    this.usersService.changeStatus(g.id, deactivate ? 'INACTIVE' : 'ACTIVE').subscribe(() => this.load());
  }
}
