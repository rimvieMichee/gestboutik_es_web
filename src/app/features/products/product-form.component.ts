import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductsService } from '../../core/services/products.service';

// Cette page n'est accessible qu'à l'ADMIN d'une boutique (voir roleGuard) :
// le produit créé appartient toujours à SA boutique, déduite côté serveur —
// pas de sélecteur de boutique ici.
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  private productId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    description: [''],
    sku: [''],
    prixVente: [0, [Validators.required, Validators.min(0.01)]],
    prixAchat: [0],
    quantiteDisponible: [0, [Validators.min(0)]],
    seuilAlerte: [0, [Validators.min(0)]],
  });

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEdit.set(true);
      this.form.get('quantiteDisponible')?.disable();
      this.productsService.findOne(this.productId).subscribe((product) => {
        this.form.patchValue({
          nom: product.nom,
          description: product.description ?? '',
          sku: product.sku ?? '',
          prixVente: Number(product.prixVente),
          prixAchat: product.prixAchat ? Number(product.prixAchat) : 0,
          quantiteDisponible: product.quantiteDisponible,
          seuilAlerte: product.seuilAlerte,
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
    const value = this.form.getRawValue();

    const request = this.productId
      ? this.productsService.update(this.productId, {
          nom: value.nom,
          description: value.description || undefined,
          sku: value.sku || undefined,
          prixVente: value.prixVente,
          prixAchat: value.prixAchat || undefined,
          seuilAlerte: value.seuilAlerte,
        })
      : this.productsService.create({
          nom: value.nom,
          description: value.description || undefined,
          sku: value.sku || undefined,
          prixVente: value.prixVente,
          prixAchat: value.prixAchat || undefined,
          quantiteDisponible: value.quantiteDisponible,
          seuilAlerte: value.seuilAlerte,
        });

    request.subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Une erreur est survenue.');
      },
    });
  }
}
