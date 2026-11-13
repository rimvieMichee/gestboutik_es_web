import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Boutique } from '../../core/models/boutique.model';
import { Gestionnaire } from '../../core/models/user.model';
import { BoutiquesService } from '../../core/services/boutiques.service';
import { cleanPayload } from '../../core/services/clean-payload.util';
import { errorText } from '../../core/services/http-error.util';
import { CredentialsCardComponent } from '../../shared/components/credentials-card/credentials-card.component';
import { DrawerComponent } from '../../shared/components/drawer/drawer.component';
import { PasswordFieldComponent } from '../../shared/components/password-field/password-field.component';

/**
 * Tiroir de création / modification d'une boutique. À la création, le compte du
 * gestionnaire est créé en même temps, puis ses identifiants sont affichés une
 * seule fois pour que le technicien puisse les lui transmettre.
 */
@Component({
  selector: 'app-boutique-drawer',
  standalone: true,
  imports: [ReactiveFormsModule, DrawerComponent, PasswordFieldComponent, CredentialsCardComponent],
  template: `
    <app-drawer
      [open]="open()"
      [title]="created() ? 'Boutique créée' : boutique() ? 'Modifier la boutique' : 'Nouvelle boutique'"
      [subtitle]="created() ? '' : boutique() ? boutique()!.nom : 'Renseignez la boutique et son gestionnaire'"
      (closed)="close()"
    >
      @if (created(); as c) {
        @if (c.password) {
          <app-credentials-card
            [title]="'« ' + c.boutique + ' » est prête'"
            [username]="c.username"
            [password]="c.password"
          />
        } @else {
          <div class="form-hint" style="font-size: 0.95rem">
            « {{ c.boutique }} » est créée et rattachée à <strong>{{ c.username }}</strong>. Il la retrouve dans le
            sélecteur de boutiques de son application, avec ses identifiants habituels.
          </div>
        }
      } @else {
        <form id="boutique-form" [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-section" style="margin-top: 0">Boutique</div>
          <div class="form-field">
            <label for="b-nom">Nom *</label>
            <input id="b-nom" type="text" formControlName="nom" />
          </div>
          <div class="form-row">
            <div class="form-field">
              <label for="b-ville">Ville</label>
              <input id="b-ville" type="text" formControlName="ville" />
            </div>
            <div class="form-field">
              <label for="b-tel">Téléphone</label>
              <input id="b-tel" type="text" formControlName="telephone" />
            </div>
          </div>
          <div class="form-field">
            <label for="b-adresse">Adresse</label>
            <input id="b-adresse" type="text" formControlName="adresse" />
          </div>
          <div class="form-field">
            <label for="b-email">Email</label>
            <input id="b-email" type="email" formControlName="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <span class="field-error">Adresse email invalide.</span>
            }
          </div>
          <div class="form-field">
            <label for="b-desc">Description</label>
            <textarea id="b-desc" formControlName="description" rows="2"></textarea>
          </div>

          @if (!boutique()) {
            <div class="form-section">Gestionnaire</div>
            <div class="segmented" role="tablist">
              <button type="button" [class.on]="mode() === 'new'" (click)="setMode('new')">Nouveau gestionnaire</button>
              <button type="button" [class.on]="mode() === 'existing'" (click)="setMode('existing')" [disabled]="!gestionnaires().length">
                Gestionnaire existant
              </button>
            </div>
            @if (mode() === 'existing') {
              <p class="form-hint">
                Il gérera cette boutique en plus des siennes et passera de l'une à l'autre dans son application.
              </p>
              <div class="form-field">
                <label for="g-exist">Gestionnaire *</label>
                <select id="g-exist" formControlName="adminUserId">
                  <option value="" disabled>Choisir un gestionnaire…</option>
                  @for (g of gestionnaires(); track g.id) {
                    <option [value]="g.id">
                      {{ g.prenom }} {{ g.nom }} (@{{ g.username }}){{ g.boutiques?.length ? ' — ' + g.boutiques!.length + ' boutique(s)' : '' }}
                    </option>
                  }
                </select>
              </div>
            } @else {
            <p class="form-hint">
              Il se connecte à l'application mobile et y crée les comptes de ses employés.
            </p>
            <div class="form-row">
              <div class="form-field">
                <label for="g-prenom">Prénom *</label>
                <input id="g-prenom" type="text" formControlName="adminPrenom" />
              </div>
              <div class="form-field">
                <label for="g-nom">Nom *</label>
                <input id="g-nom" type="text" formControlName="adminNom" />
              </div>
            </div>
            <div class="form-field">
              <label for="g-tel">Téléphone du gestionnaire</label>
              <input id="g-tel" type="text" formControlName="adminTelephone" />
            </div>
            <div class="form-field">
              <label for="g-user">Identifiant de connexion *</label>
              <input id="g-user" type="text" formControlName="adminUsername" autocomplete="off" />
            </div>
            <app-password-field
              [control]="form.controls.adminPassword"
              inputId="g-pass"
              label="Mot de passe * (8 caractères minimum)"
            />
            }
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
          <button class="btn" type="submit" form="boutique-form" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Enregistrement...' : boutique() ? 'Enregistrer' : 'Créer la boutique' }}
          </button>
        }
      </div>
    </app-drawer>
  `,
})
export class BoutiqueDrawerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly boutiquesService = inject(BoutiquesService);

  readonly open = input.required<boolean>();
  /** `null` : création ; sinon modification de cette boutique. */
  readonly boutique = input<Boutique | null>(null);
  /** Gestionnaires existants, pour rattacher la boutique à l'un d'eux. */
  readonly gestionnaires = input<Gestionnaire[]>([]);
  readonly closed = output<void>();
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly created = signal<{ boutique: string; username: string; password: string | null } | null>(null);
  readonly mode = signal<'new' | 'existing'>('new');

  readonly form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    description: [''],
    telephone: [''],
    email: ['', Validators.email],
    adresse: [''],
    ville: [''],
    adminNom: [''],
    adminPrenom: [''],
    adminTelephone: [''],
    adminUsername: [''],
    adminPassword: [''],
    adminUserId: [''],
  });

  setMode(mode: 'new' | 'existing'): void {
    this.mode.set(mode);
    this.applyAdminValidators();
  }

  /** Les champs du nouveau gestionnaire, ou le choix d'un existant, sont requis selon le mode. */
  private applyAdminValidators(): void {
    const creating = !this.boutique();
    const isNew = creating && this.mode() === 'new';
    for (const name of ['adminNom', 'adminPrenom', 'adminUsername'] as const) {
      this.form.controls[name].setValidators(isNew ? Validators.required : null);
    }
    this.form.controls.adminPassword.setValidators(isNew ? [Validators.required, Validators.minLength(8)] : null);
    this.form.controls.adminUserId.setValidators(creating && this.mode() === 'existing' ? Validators.required : null);
    Object.values(this.form.controls).forEach((c) => c.updateValueAndValidity({ emitEvent: false }));
  }

  constructor() {
    // À chaque ouverture : formulaire propre, pré-rempli en modification.
    effect(() => {
      if (!this.open()) return;
      const boutique = this.boutique();
      this.created.set(null);
      this.errorMessage.set(null);
      this.loading.set(false);
      this.form.reset({
        nom: boutique?.nom ?? '',
        description: boutique?.description ?? '',
        telephone: boutique?.telephone ?? '',
        email: boutique?.email ?? '',
        adresse: boutique?.adresse ?? '',
        ville: boutique?.ville ?? '',
      });
      this.mode.set('new');
      this.applyAdminValidators();
    });
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();
    const current = this.boutique();

    if (current) {
      this.boutiquesService
        .update(
          current.id,
          cleanPayload({
            nom: value.nom,
            description: value.description,
            telephone: value.telephone,
            email: value.email,
            adresse: value.adresse,
            ville: value.ville,
          }),
        )
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

    const existing = this.mode() === 'existing';
    const { adminUserId, adminNom, adminPrenom, adminUsername, adminPassword, adminTelephone, ...shop } = value;
    this.boutiquesService
      .create({
        ...cleanPayload(shop),
        nom: value.nom,
        ...(existing
          ? { adminUserId }
          : {
              adminNom,
              adminPrenom,
              adminUsername,
              adminPassword,
              adminTelephone: adminTelephone || undefined,
            }),
      })
      .subscribe({
        next: (boutique) => {
          this.loading.set(false);
          const manager = this.gestionnaires().find((g) => g.id === adminUserId);
          this.created.set(
            existing
              ? { boutique: boutique.nom, username: manager ? `${manager.prenom} ${manager.nom}` : '', password: null }
              : { boutique: boutique.nom, username: adminUsername, password: adminPassword },
          );
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
