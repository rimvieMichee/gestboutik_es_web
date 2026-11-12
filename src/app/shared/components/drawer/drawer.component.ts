import { Component, HostListener, OnDestroy, effect, input, output, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * Panneau latéral droit (« drawer ») : fond assombri, glissement depuis la
 * droite, fermeture par la croix, un clic à côté ou la touche Échap. Le contenu
 * (formulaire) est projeté ; les boutons d'action vont dans `<div drawerFooter>`.
 */
@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (rendered()) {
      <div class="drawer-backdrop" [class.closing]="closing()" (click)="close()"></div>
      <aside
        class="drawer"
        [class.closing]="closing()"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
      >
        <header class="drawer-header">
          <div class="drawer-titles">
            <h2>{{ title() }}</h2>
            @if (subtitle()) {
              <p>{{ subtitle() }}</p>
            }
          </div>
          <button type="button" class="drawer-close" (click)="close()" aria-label="Fermer">
            <app-icon name="close" [size]="20" />
          </button>
        </header>
        <div class="drawer-body">
          <ng-content />
        </div>
        <footer class="drawer-footer">
          <ng-content select="[drawerFooter]" />
        </footer>
      </aside>
    }
  `,
  styles: [
    `
      .drawer-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 13, 35, 0.5);
        backdrop-filter: blur(1px);
        z-index: 90;
        animation: fade-in 0.2s ease both;
      }
      .drawer-backdrop.closing {
        animation: fade-out 0.2s ease both;
      }
      .drawer {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: min(460px, 100vw);
        background: var(--color-surface);
        z-index: 91;
        display: flex;
        flex-direction: column;
        box-shadow: -12px 0 40px rgba(15, 13, 35, 0.18);
        animation: slide-in 0.24s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .drawer.closing {
        animation: slide-out 0.2s ease-in both;
      }
      .drawer-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.25rem 1.5rem 1rem;
        border-bottom: 1px solid var(--color-border);
      }
      .drawer-titles h2 {
        margin: 0;
        font-size: 1.15rem;
      }
      .drawer-titles p {
        margin: 0.2rem 0 0;
        font-size: 0.82rem;
        color: var(--color-text-muted);
      }
      .drawer-close {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--color-text-muted);
        cursor: pointer;
      }
      .drawer-close:hover {
        background: var(--color-bg);
        color: var(--color-text);
      }
      .drawer-body {
        flex: 1;
        overflow-y: auto;
        padding: 1.25rem 1.5rem;
      }
      .drawer-footer {
        display: flex;
        gap: 0.6rem;
        justify-content: flex-end;
        padding: 0.9rem 1.5rem;
        border-top: 1px solid var(--color-border);
        background: var(--color-surface);
      }
      @keyframes slide-in {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      @keyframes slide-out {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
      }
      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
      @media (prefers-reduced-motion: reduce) {
        .drawer, .drawer-backdrop { animation-duration: 0.01ms !important; }
      }
    `,
  ],
})
export class DrawerComponent implements OnDestroy {
  readonly open = input.required<boolean>();
  readonly title = input('');
  readonly subtitle = input('');
  readonly closed = output<void>();

  readonly rendered = signal(false);
  readonly closing = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        if (this.timer) clearTimeout(this.timer);
        this.rendered.set(true);
        this.closing.set(false);
        document.body.style.overflow = 'hidden';
      } else if (this.rendered()) {
        // Laisse jouer l'animation de sortie avant de retirer le panneau.
        this.closing.set(true);
        this.timer = setTimeout(() => {
          this.rendered.set(false);
          this.closing.set(false);
          document.body.style.overflow = '';
        }, 200);
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
  }

  close(): void {
    this.closed.emit();
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
    document.body.style.overflow = '';
  }
}
