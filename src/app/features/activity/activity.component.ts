import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BoutiqueWithStats } from '../../core/models/boutique.model';
import { PaginationMeta } from '../../core/models/common.model';
import { ActivityLog } from '../../core/models/platform.model';
import { BoutiquesService } from '../../core/services/boutiques.service';
import { errorText } from '../../core/services/http-error.util';
import { RealtimeService } from '../../core/services/realtime.service';
import { onRealtime } from '../../core/services/realtime.util';
import { PlatformService } from '../../core/services/platform.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { ACTIVITY_ACTIONS, describeActivity } from '../../shared/utils/activity.util';

/** Journal d'activité : tout ce qui se passe dans les boutiques, filtrable. */
@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, IconComponent, PaginationComponent, TimeAgoPipe],
  template: `
    <div class="page-header">
      <div>
        <h1>Activité</h1>
        <p class="page-subtitle">Ventes, comptes et modifications, du plus récent au plus ancien</p>
      </div>
      <button class="btn btn-secondary" (click)="load()" [disabled]="loading()">Actualiser</button>
    </div>

    <div class="toolbar">
      <select [ngModel]="boutiqueId()" (ngModelChange)="boutiqueId.set($event); onFilter()" aria-label="Filtrer par boutique">
        <option value="">Toutes les boutiques</option>
        @for (b of boutiques(); track b.id) {
          <option [value]="b.id">{{ b.nom }}</option>
        }
      </select>
      <select [ngModel]="action()" (ngModelChange)="action.set($event); onFilter()" aria-label="Filtrer par type">
        <option value="">Tous les événements (hors connexions)</option>
        @for (a of actions; track a.value) {
          <option [value]="a.value">{{ a.label }}</option>
        }
      </select>
    </div>

    <div class="card">
      @if (errorMessage()) {
        <p class="error-text">{{ errorMessage() }}</p>
      }
      @if (loading() && !logs().length) {
        @for (i of [1, 2, 3, 4, 5]; track i) {
          <div class="skeleton" style="height: 44px; margin-bottom: 0.6rem"></div>
        }
      } @else {
        <ul class="activity-list">
          @for (log of logs(); track log.id) {
            @let a = describe(log);
            <li>
              <span class="activity-icon" [class]="'tone-' + a.tone"><app-icon [name]="a.icon" [size]="17" /></span>
              <div class="activity-body">
                <div class="activity-title">{{ a.label }}</div>
                <div class="activity-detail">
                  {{ a.detail }}@if (log.boutique) { · <a [routerLink]="['/boutiques', log.boutique.id]">{{ log.boutique.nom }}</a> }
                </div>
              </div>
              <span class="activity-time" [title]="log.createdAt | date: 'dd/MM/yyyy HH:mm:ss'">
                {{ log.createdAt | timeAgo }}<br />
                <span style="font-size: 0.7rem">{{ log.createdAt | date: 'dd/MM HH:mm' }}</span>
              </span>
            </li>
          } @empty {
            <li class="empty-state" style="display: block">Aucun événement pour ce filtre.</li>
          }
        </ul>
      }
      <app-pagination [meta]="meta()" (pageChange)="onPageChange($event)" />
    </div>
  `,
})
export class ActivityComponent implements OnInit {
  private readonly platform = inject(PlatformService);
  private readonly boutiquesService = inject(BoutiquesService);
  private readonly realtime = inject(RealtimeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly logs = signal<ActivityLog[]>([]);
  readonly boutiques = signal<BoutiqueWithStats[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly boutiqueId = signal('');
  readonly action = signal('');
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly actions = ACTIVITY_ACTIONS;
  readonly describe = describeActivity;
  private page = 1;

  ngOnInit(): void {
    this.boutiquesService.findAll({ limit: 100, sortBy: 'nom', sortOrder: 'asc' }).subscribe((res) => this.boutiques.set(res.data));
    this.load();
    // Nouveaux événements en tête de liste, sans changer de page ni de filtre.
    onRealtime(
      this.realtime,
      this.destroyRef,
      (e) => ['sale.created', 'credit.settled', 'activity'].includes(e.type),
      () => {
        if (this.page === 1) this.load();
      },
      900,
    );
  }

  load(): void {
    this.loading.set(true);
    this.platform
      .activity({
        page: this.page,
        limit: 25,
        boutiqueId: this.boutiqueId() || undefined,
        action: this.action() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.logs.set(res.data);
          this.meta.set(res.meta);
          this.loading.set(false);
          this.errorMessage.set(null);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(errorText(err, "Impossible de charger l'activité."));
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
}
