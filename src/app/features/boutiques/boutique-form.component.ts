import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BoutiquesService } from '../../core/services/boutiques.service';
import { cleanPayload } from '../../core/services/clean-payload.util';

@Component({
  selector: 'app-boutique-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './boutique-form.component.html',
})
export class BoutiqueFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly boutiquesService = inject(BoutiquesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  private boutiqueId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    description: [''],
    telephone: [''],
    email: ['', Validators.email],
    adresse: [''],
    ville: [''],
    adminNom: [''],
    adminPrenom: [''],
    adminUsername: [''],
    adminPassword: [''],
  });

  ngOnInit(): void {
    this.boutiqueId = this.route.snapshot.paramMap.get('id');
    if (this.boutiqueId) {
      this.isEdit.set(true);
      // Le compte Admin ne se crée qu'à la création de la boutique, pas à sa
      // modification : les champs restent dans le groupe (typage strict des
      // formulaires réactifs) mais sans validateur, masqués côté template,
      // et ignorés par cleanPayload/UpdateBoutiquePayload à l'envoi.
      this.boutiquesService.findOne(this.boutiqueId).subscribe((boutique) => {
        this.form.patchValue({
          nom: boutique.nom,
          description: boutique.description ?? '',
          telephone: boutique.telephone ?? '',
          email: boutique.email ?? '',
          adresse: boutique.adresse ?? '',
          ville: boutique.ville ?? '',
        });
      });
    } else {
      this.form.get('adminNom')?.setValidators(Validators.required);
      this.form.get('adminPrenom')?.setValidators(Validators.required);
      this.form.get('adminUsername')?.setValidators(Validators.required);
      this.form.get('adminPassword')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();

    const request = this.boutiqueId
      ? this.boutiquesService.update(this.boutiqueId, cleanPayload(value))
      : this.boutiquesService.create({
          ...cleanPayload(value),
          nom: value.nom,
          adminNom: value.adminNom!,
          adminPrenom: value.adminPrenom!,
          adminUsername: value.adminUsername!,
          adminPassword: value.adminPassword!,
        });

    request.subscribe({
      next: () => this.router.navigate(['/boutiques']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Une erreur est survenue.');
      },
    });
  }
}
