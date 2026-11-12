import { Component, input, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * Récapitulatif des identifiants à transmettre au gestionnaire après la création
 * d'un compte : le mot de passe n'est plus consultable ensuite.
 */
@Component({
  selector: 'app-credentials-card',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="success-banner">
      <app-icon name="check" [size]="20" />
      <div>
        <strong>{{ title() }}</strong>
        <p>Transmettez ces identifiants au gestionnaire : le mot de passe ne sera plus affiché.</p>
      </div>
    </div>
    <dl class="credentials">
      <div><dt>Identifiant</dt><dd>{{ username() }}</dd></div>
      <div><dt>Mot de passe</dt><dd>{{ password() }}</dd></div>
    </dl>
    <button type="button" class="btn btn-secondary" (click)="copy()">
      <app-icon [name]="copied() ? 'check' : 'copy'" [size]="16" />
      {{ copied() ? 'Copié !' : 'Copier les identifiants' }}
    </button>
  `,
  styles: [
    `
      .success-banner {
        display: flex;
        gap: 0.75rem;
        padding: 0.9rem 1rem;
        border-radius: var(--radius);
        background: var(--color-success-light);
        color: #166534;
        margin-bottom: 1.1rem;
      }
      .success-banner p { margin: 0.2rem 0 0; font-size: 0.8rem; }
      .credentials {
        margin: 0 0 1rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius);
        overflow: hidden;
      }
      .credentials div {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.7rem 0.9rem;
      }
      .credentials div + div { border-top: 1px solid var(--color-border); }
      dt { color: var(--color-text-muted); font-size: 0.82rem; }
      dd { margin: 0; font-weight: 700; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; word-break: break-all; text-align: right; }
    `,
  ],
})
export class CredentialsCardComponent {
  readonly title = input('Compte créé');
  readonly username = input.required<string>();
  readonly password = input.required<string>();
  readonly copied = signal(false);

  async copy(): Promise<void> {
    const text = `Identifiant : ${this.username()}\nMot de passe : ${this.password()}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Contexte non sécurisé : repli sur une zone de texte temporaire.
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
