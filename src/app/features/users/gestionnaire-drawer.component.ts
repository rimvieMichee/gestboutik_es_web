import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, switchMap } from 'rxjs';
import { Gestionnaire } from '../../core/models/user.model';
import { cleanPayload } from '../../core/services/clean-payload.util';
import { errorText } from '../../core/services/http-error.util';
import { UsersService } from '../../core/services/users.service';
import { CredentialsCardComponent } from '../../shared/components/credentials-card/credentials-card.component';
import { DrawerComponent } from '../../shared/components/drawer/drawer.component';
import { PasswordFieldComponent } from '../../shared/components/password-field/password-field.component';

export interface BoutiqueOption {
  id: string;
  nom: string;
  ville?: string | null;
}

/** Tiroir de création / modification d'un gestionnaire de boutique. */
@Component({
  selector: 'app-gestionnaire-drawer',
  standalone: true,
  imports: [ReactiveFormsModule, DrawerComponent, PasswordFieldComponent, CredentialsCardComponent],
  template: `
    <app-drawer
      [open]="open()"
      [title]="created() ? 'Gestionnaire créé' : gestionnaire() ? 'Modifier le gestionnaire' : 'Nouveau gestionnaire'"
      [subtitle]="created() ? '' : gestionnaire() ? '@' + gestionnaire()!.username : 'Il peut gérer une ou plusieurs boutiques'"
      (closed)="close()"
    >
      @if (created(); as c) {
        <app-credentials-card [title]="c.nom + ' est prêt à se connecter'" [username]="c.username" [password]="c.password" />
      } @else {
        <form id="gestionnaire-form" [formGroup]="form" (ngSubmit)="submit()">
          @if (boutiques().length > 1 || !gestionnaire()) {
            <div class="form-field">
              <label>Boutiques gérées *</label>
              <div class="check-list">
                @for (b of boutiques(); track b.id) {
                  <label class="check-row">
                    <input type="checkbox" [checked]="isSelected(b.id)" (change)="toggleBoutique(b.id)" />
                    <span>{{ b.nom }}{{ b.ville ? ' — ' + b.ville : '' }}</span>
                  </label>
                }
              </div>
              <span class="form-hint">
                Avec plusieurs boutiques, le gestionnaire passe de l'une à l'autre dans l'application.
              </span>
              @if (!selected().length) {
                <span class="field-error">Choisissez au moins une boutique.</span>
              }
            </div>
          }
          <div class="form-row">
            <div class="form-field">
              <label for="gs-prenom">Prénom *</label>
              <input id="gs-prenom" type="text" formControlName="prenom" />
            </div>
            <div class="form-field">
              <label for="gs-nom">Nom *</label>
              <input id="gs-nom" type="text" formControlName="nom" />
            </div>
          </div>
          <div class="form-field">
            <label for="gs-tel">Téléphone</label>
            <input id="gs-tel" type="text" formControlName="telephone" />
          </div>
          <div class="form-field">
            <label for="gs-email">Email</label>
            <input id="gs-email" type="email" formControlName="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <span class="field-error">Adresse email invalide.</span>
            }
          </div>

          @if (!gestionnaire()) {
            <div class="form-section">Accès à l'application</div>
            <div class="form-field">
              <label for="gs-user">Identifiant de connexion *</label>
              <input id="gs-user" type="text" formControlName="username" autocomplete="off" />
            </div>
            <app-password-field
              [control]="form.controls.password"
              inputId="gs-pass"
              label="Mot de passe * (8 caractères minimum)"
            />
          }

          @if (errorMessage()) {
            <p class="error-text">{{ errorMessage() }}</p>
          }
        </form>
      }

      <div drawerFooter>
        @if (created()) {
          <button type="button" class="btn" (click)="close()">Terminer</button>
        } @else {
          <button type="button" class="btn btn-secondary" (click)="close()">Annuler</button>
          <button class="btn" type="submit" form="gestionnaire-form" [disabled]="form.invalid || loading() || !selected().length">
            {{ loading() ? 'Enregistrement...' : gestionnaire() ? 'Enregistrer' : 'Créer le gestionnaire' }}
          </button>
        }
      </div>
    </app-drawer>
  `,
})
export class GestionnaireDrawerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);

  readonly open = input.required<boolean>();
  readonly gestionnaire = input<Gestionnaire | null>(null);
  readonly boutiques = input<BoutiqueOption[]>([]);
  /** Boutique présélectionnée (ex. depuis la fiche d'une boutique). */
  readonly presetBoutiqueId = input<string | null>(null);
  readonly closed = output<void>();
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly created = signal<{ nom: string; username: string; password: string } | null>(null);

  /** Boutiques cochées (la première est celle qui s'ouvre par défaut). */
  readonly selected = signal<string[]>([]);

  isSelected(id: string): boolean {
    return this.selected().includes(id);
  }

  toggleBoutique(id: string): void {
    this.selected.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  readonly form = this.fb.nonNullable.group({
    prenom: ['', Validators.required],
    nom: ['', Validators.required],
    telephone: [''],
    email: ['', Validators.email],
    username: [''],
    password: [''],
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const g = this.gestionnaire();
      this.created.set(null);
      this.errorMessage.set(null);
      this.loading.set(false);
      const preset = this.presetBoutiqueId();
      this.selected.set(
        g ? (g.boutiques?.length ? g.boutiques.map((b) => b.id) : g.boutiqueId ? [g.boutiqueId] : []) : preset ? [preset] : [],
      );
      this.form.reset({
        prenom: g?.prenom ?? '',
        nom: g?.nom ?? '',
        telephone: g?.telephone ?? '',
        email: g?.email ?? '',
      });
      const creating = !g;
      this.form.controls.username.setValidators(creating ? Validators.required : null);
      this.form.controls.password.setValidators(creating ? [Validators.required, Validators.minLength(8)] : null);
      Object.values(this.form.controls).forEach((c) => c.updateValueAndValidity({ emitEvent: false }));
    });
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    const v = this.form.getRawValue();
    const current = this.gestionnaire();
    const ids = this.selected();

    if (current) {
      const before = (current.boutiques ?? []).map((b) => b.id).sort().join(',');
      const shopsChanged = this.boutiques().length > 1 && ids.slice().sort().join(',') !== before;
      this.usersService
        .update(current.id, {
          prenom: v.prenom,
          nom: v.nom,
          ...cleanPayload({ telephone: v.telephone, email: v.email }),
        })
        .pipe(switchMap(() => (shopsChanged ? this.usersService.setBoutiques(current.id, ids) : of(null))))
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.saved.emit();
            this.close();
          },
          error: (err) => this.fail(err),
        });
      return;
    }

    this.usersService
      .create({
        boutiqueId: ids[0],
        boutiqueIds: ids,
        prenom: v.prenom,
        nom: v.nom,
        username: v.username,
        password: v.password,
        ...cleanPayload({ telephone: v.telephone, email: v.email }),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.created.set({ nom: `${v.prenom} ${v.nom}`.trim(), username: v.username, password: v.password });
          this.saved.emit();
        },
        error: (err) => this.fail(err),
      });
  }

  private fail(err: unknown): void {
    this.loading.set(false);
    this.errorMessage.set(errorText(err));
  }
}
