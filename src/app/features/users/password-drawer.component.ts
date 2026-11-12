import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Gestionnaire } from '../../core/models/user.model';
import { errorText } from '../../core/services/http-error.util';
import { UsersService } from '../../core/services/users.service';
import { CredentialsCardComponent } from '../../shared/components/credentials-card/credentials-card.component';
import { DrawerComponent } from '../../shared/components/drawer/drawer.component';
import { PasswordFieldComponent } from '../../shared/components/password-field/password-field.component';

/** Tiroir de réinitialisation du mot de passe d'un gestionnaire. */
@Component({
  selector: 'app-password-drawer',
  standalone: true,
  imports: [ReactiveFormsModule, DrawerComponent, PasswordFieldComponent, CredentialsCardComponent],
  template: `
    <app-drawer
      [open]="open()"
      [title]="done() ? 'Mot de passe modifié' : 'Réinitialiser le mot de passe'"
      [subtitle]="gestionnaire() ? gestionnaire()!.prenom + ' ' + gestionnaire()!.nom + ' (@' + gestionnaire()!.username + ')' : ''"
      (closed)="close()"
    >
      @if (done(); as d) {
        <app-credentials-card title="Nouveau mot de passe enregistré" [username]="d.username" [password]="d.password" />
      } @else {
        <form id="password-form" [formGroup]="form" (ngSubmit)="submit()">
          <p class="form-hint" style="margin-top: 0">
            Le gestionnaire sera déconnecté de ses appareils et devra utiliser ce nouveau mot de passe.
          </p>
          <app-password-field [control]="form.controls.password" inputId="reset-pass" label="Nouveau mot de passe * (8 caractères minimum)" />
          @if (errorMessage()) {
            <p class="error-text">{{ errorMessage() }}</p>
          }
        </form>
      }

      <div drawerFooter>
        @if (done()) {
          <button type="button" class="btn" (click)="close()">Terminer</button>
        } @else {
          <button type="button" class="btn btn-secondary" (click)="close()">Annuler</button>
          <button class="btn" type="submit" form="password-form" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        }
      </div>
    </app-drawer>
  `,
})
export class PasswordDrawerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);

  readonly open = input.required<boolean>();
  readonly gestionnaire = input<Gestionnaire | null>(null);
  readonly closed = output<void>();

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly done = signal<{ username: string; password: string } | null>(null);

  readonly form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      this.done.set(null);
      this.errorMessage.set(null);
      this.loading.set(false);
      this.form.reset({ password: '' });
    });
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    const g = this.gestionnaire();
    if (!g || this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    const password = this.form.getRawValue().password;
    this.usersService.resetPassword(g.id, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.done.set({ username: g.username, password });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(errorText(err));
      },
    });
  }
}
