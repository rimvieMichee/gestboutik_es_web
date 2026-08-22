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
  });

  ngOnInit(): void {
    this.boutiqueId = this.route.snapshot.paramMap.get('id');
    if (this.boutiqueId) {
      this.isEdit.set(true);
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
    }
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    const payload = cleanPayload(this.form.getRawValue());

    const request = this.boutiqueId
      ? this.boutiquesService.update(this.boutiqueId, payload)
      : this.boutiquesService.create({ ...payload, nom: payload.nom! });

    request.subscribe({
      next: () => this.router.navigate(['/boutiques']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Une erreur est survenue.');
      },
    });
  }
}
