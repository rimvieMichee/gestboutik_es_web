import { Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#%';

/** Mot de passe aléatoire lisible (sans caractères ambigus : 0/O, 1/l/I). */
export function generatePassword(length = 12): string {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

/** Champ mot de passe : œil pour afficher/masquer, et générateur optionnel. */
@Component({
  selector: 'app-password-field',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  template: `
    <div class="form-field">
      <label [attr.for]="inputId()">{{ label() }}</label>
      <div class="pw-wrapper">
        <input
          [id]="inputId()"
          [type]="visible() ? 'text' : 'password'"
          [formControl]="control()"
          autocomplete="new-password"
        />
        <div class="pw-actions">
          @if (generator()) {
            <button type="button" class="pw-btn" (click)="generate()" title="Générer un mot de passe" aria-label="Générer un mot de passe">
              <app-icon name="shuffle" [size]="17" />
            </button>
          }
          <button
            type="button"
            class="pw-btn"
            (click)="visible.set(!visible())"
            [attr.aria-label]="visible() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
          >
            <app-icon [name]="visible() ? 'eye-off' : 'eye'" [size]="17" />
          </button>
        </div>
      </div>
      @if (control().touched && control().invalid) {
        <span class="field-error">8 caractères minimum.</span>
      }
    </div>
  `,
  styles: [
    `
      .pw-wrapper { position: relative; }
      .pw-wrapper input { width: 100%; padding-right: 5rem; }
      .pw-actions {
        position: absolute;
        top: 50%;
        right: 0.3rem;
        transform: translateY(-50%);
        display: flex;
        gap: 0.1rem;
      }
      .pw-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--color-text-muted);
        cursor: pointer;
      }
      .pw-btn:hover { background: var(--color-bg); color: var(--color-text); }
      .field-error { color: var(--color-danger); font-size: 0.75rem; }
    `,
  ],
})
export class PasswordFieldComponent {
  readonly control = input.required<FormControl<string>>();
  readonly label = input('Mot de passe');
  readonly inputId = input('password');
  readonly generator = input(true);
  readonly visible = signal(false);

  generate(): void {
    this.control().setValue(generatePassword());
    this.control().markAsTouched();
    this.visible.set(true);
  }
}
