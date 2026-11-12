import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
      [subtitle]="created() ? '' : gestionnaire() ? '@' + gestionnaire()!.username : 'Rattaché à une boutique existante'"
      (closed)="close()"
    >
      @if (created(); as c) {
        <app-credentials-card [title]="c.nom + ' est prêt à se connecter'" [username]="c.username" [password]="c.password" />
      } @else {
        <form id="gestionnaire-form" [formGroup]="form" (ngSubmit)="submit()">
          @if (!gestionnaire()) {
            <div class="form-field">
              <label for="gs-boutique">Boutique *</label>
              <select id="gs-boutique" formControlName="boutiqueId">
                <option value="" disabled>Choisir une boutique…</option>
                @for (b of boutiques(); track b.id) {
                  <option [value]="b.id">{{ b.nom }}{{ b.ville ? ' — ' + b.ville : '' }}</option>
                }
              </select>
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
          <button class="btn" type="submit" form="gestionnaire-form" [disabled]="form.invalid || loading()">
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

  readonly form = this.fb.nonNullable.group({
    boutiqueId: [''],
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
      this.form.reset({
        boutiqueId: this.presetBoutiqueId() ?? '',
        prenom: g?.prenom ?? '',
        nom: g?.nom ?? '',
        telephone: g?.telephone ?? '',
        email: g?.email ?? '',
      });
      const creating = !g;
      this.form.controls.boutiqueId.setValidators(creating ? Validators.required : null);
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

    if (current) {
      this.usersService
        .update(current.id, {
          prenom: v.prenom,
          nom: v.nom,
          ...cleanPayload({ telephone: v.telephone, email: v.email }),
        })
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
        boutiqueId: v.boutiqueId,
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
