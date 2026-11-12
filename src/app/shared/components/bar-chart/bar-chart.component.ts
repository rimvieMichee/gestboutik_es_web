import { Component, computed, input } from '@angular/core';

export interface BarPoint {
  date: string; // YYYY-MM-DD
  value: number;
  count?: number;
}

/** Histogramme SVG léger (chiffre d'affaires par jour), sans dépendance. */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `
    @if (bars().length && hasData()) {
      <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="chart" role="img" [attr.aria-label]="ariaLabel()">
        @for (tick of ticks(); track tick.y) {
          <line [attr.x1]="left" [attr.x2]="width" [attr.y1]="tick.y" [attr.y2]="tick.y" class="grid" />
          <text [attr.x]="left - 6" [attr.y]="tick.y + 3" class="axis" text-anchor="end">{{ tick.label }}</text>
        }
        @for (bar of bars(); track bar.date) {
          <g class="bar-group">
            <rect [attr.x]="bar.x" [attr.y]="bar.y" [attr.width]="bar.w" [attr.height]="bar.h" rx="3" class="bar" [class.zero]="bar.value === 0" />
            <rect [attr.x]="bar.x - 1" y="0" [attr.width]="bar.w + 2" [attr.height]="height - bottom" class="hit">
              <title>{{ bar.tooltip }}</title>
            </rect>
          </g>
        }
        @for (label of xLabels(); track label.x) {
          <text [attr.x]="label.x" [attr.y]="height - 6" class="axis" text-anchor="middle">{{ label.text }}</text>
        }
      </svg>
    } @else {
      <p class="empty-state">Aucune vente sur cette période.</p>
    }
  `,
  styles: [
    `
      .chart { width: 100%; height: auto; display: block; }
      .grid { stroke: var(--color-border); stroke-width: 1; stroke-dasharray: 3 3; }
      .axis { fill: var(--color-text-muted); font-size: 10px; }
      .bar { fill: var(--color-primary); transition: fill 0.15s; }
      .bar.zero { fill: var(--color-border); }
      .hit { fill: transparent; }
      .bar-group:hover .bar { fill: var(--color-primary-hover); }
    `,
  ],
})
export class BarChartComponent {
  readonly points = input.required<BarPoint[]>();
  readonly unit = input('FCFA');

  readonly width = 640;
  readonly height = 190;
  readonly left = 44;
  readonly bottom = 20;
  private readonly top = 8;

  private readonly max = computed(() => {
    const peak = Math.max(0, ...this.points().map((p) => p.value));
    if (peak === 0) return 1;
    // Arrondit le haut de l'axe à un « beau » nombre.
    const pow = Math.pow(10, Math.floor(Math.log10(peak)));
    return Math.ceil(peak / pow) * pow;
  });

  readonly hasData = computed(() => this.points().some((p) => p.value > 0));

  readonly bars = computed(() => {
    const pts = this.points();
    const innerW = this.width - this.left;
    const innerH = this.height - this.bottom - this.top;
    const slot = innerW / (pts.length || 1);
    const w = Math.max(3, slot * 0.68);
    return pts.map((p, i) => {
      const h = p.value === 0 ? 2 : Math.max(2, (p.value / this.max()) * innerH);
      return {
        date: p.date,
        value: p.value,
        x: this.left + i * slot + (slot - w) / 2,
        y: this.top + innerH - h,
        w,
        h,
        tooltip: `${this.formatDay(p.date)} : ${this.formatMoney(p.value)}${p.count !== undefined ? ` (${p.count} vente${p.count > 1 ? 's' : ''})` : ''}`,
      };
    });
  });

  readonly ticks = computed(() => {
    const innerH = this.height - this.bottom - this.top;
    return [0, 0.5, 1].map((r) => ({
      y: this.top + innerH - r * innerH,
      label: this.compact(this.max() * r),
    }));
  });

  readonly xLabels = computed(() => {
    const bars = this.bars();
    if (!bars.length) return [];
    const idx = [0, Math.floor(bars.length / 2), bars.length - 1];
    return idx.map((i) => ({ x: bars[i].x + bars[i].w / 2, text: this.formatDay(bars[i].date, true) }));
  });

  readonly ariaLabel = computed(() => `Histogramme du chiffre d'affaires sur ${this.points().length} jours`);

  private formatDay(iso: string, short = false): string {
    const d = new Date(`${iso}T00:00:00Z`);
    return d.toLocaleDateString('fr-FR', short ? { day: '2-digit', month: '2-digit', timeZone: 'UTC' } : { day: 'numeric', month: 'long', timeZone: 'UTC' });
  }

  private formatMoney(v: number): string {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v).replace(/[  ]/g, ' ')} ${this.unit()}`;
  }

  private compact(v: number): string {
    if (v >= 1_000_000) return `${+(v / 1_000_000).toFixed(1)} M`;
    if (v >= 1_000) return `${+(v / 1_000).toFixed(1)} k`;
    return `${Math.round(v)}`;
  }
}
