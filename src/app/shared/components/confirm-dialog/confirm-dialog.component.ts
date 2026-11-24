import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (confirm.pending(); as request) {
      <div class="overlay" (click)="confirm.answer(false)"></div>
      <div class="dialog" role="alertdialog" aria-modal="true" [attr.aria-label]="request.title">
        <h3>{{ request.title }}</h3>
        <p>{{ request.message }}</p>
        @if (request.requireText; as expected) {
          <div class="form-field" style="margin-bottom: 1.1rem">
            <label for="confirm-text">Pour confirmer, saisissez <strong>{{ expected }}</strong></label>
            <input id="confirm-text" type="text" autocomplete="off" [value]="typed()" (input)="typed.set($any($event.target).value)" />
          </div>
        }
        <div class="actions">
          <button type="button" class="btn btn-secondary" (click)="confirm.answer(false)">Annuler</button>
          <button
            type="button"
            class="btn"
            [class.btn-danger]="request.danger"
            [disabled]="!!request.requireText && typed().trim() !== request.requireText.trim()"
            (click)="confirm.answer(true)"
          >
            {{ request.confirmLabel || 'Confirmer' }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .overlay { position: fixed; inset: 0; background: rgba(15, 13, 35, 0.5); z-index: 110; animation: fade 0.15s ease both; }
      .dialog {
        position: fixed; z-index: 111; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: min(420px, calc(100vw - 2rem));
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        padding: 1.4rem;
        animation: pop 0.18s ease both;
      }
      h3 { margin: 0 0 0.4rem; font-size: 1.05rem; }
      p { margin: 0 0 1.25rem; color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.45; }
      .actions { display: flex; justify-content: flex-end; gap: 0.6rem; }
      @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes pop { from { opacity: 0; transform: translate(-50%, -46%); } to { opacity: 1; transform: translate(-50%, -50%); } }
    `,
  ],
})
export class ConfirmDialogComponent {
  readonly confirm = inject(ConfirmService);
  readonly typed = signal('');

  constructor() {
    // Champ de confirmation vide à chaque nouvelle demande.
    effect(() => {
      this.confirm.pending();
      this.typed.set('');
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.confirm.pending()) this.confirm.answer(false);
  }
}
