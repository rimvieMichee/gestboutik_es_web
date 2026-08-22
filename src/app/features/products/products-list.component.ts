import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models/product.model';
import { PaginationMeta } from '../../core/models/common.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [RouterLink, FormsModule, PaginationComponent],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit {
  readonly products = signal<Product[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly search = signal('');
  private page = 1;

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.productsService.findAll({ page: this.page, limit: 20, search: this.search() }).subscribe((res) => {
      this.products.set(res.data);
      this.meta.set(res.meta);
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.load();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.load();
  }

  toggleStatus(product: Product): void {
    const next = product.statut === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = next === 'INACTIVE' ? 'désactiver' : 'activer';
    if (!confirm(`Confirmer : ${action} le produit "${product.nom}" ?`)) {
      return;
    }
    this.productsService.changeStatus(product.id, next).subscribe(() => this.load());
  }

  restock(product: Product): void {
    const raw = prompt(`Quantité à ajouter au stock de "${product.nom}" (actuel : ${product.quantiteDisponible}) :`);
    const quantite = Number(raw);
    if (!raw || !Number.isInteger(quantite) || quantite <= 0) {
      return;
    }
    this.productsService.restock(product.id, quantite).subscribe(() => this.load());
  }

  adjust(product: Product): void {
    const raw = prompt(
      `Correction de stock pour "${product.nom}" (actuel : ${product.quantiteDisponible}).\nEntrer un delta signé (ex: -2 pour une casse) :`,
    );
    const delta = Number(raw);
    if (!raw || !Number.isInteger(delta) || delta === 0) {
      return;
    }
    const note = prompt('Motif de la correction (obligatoire) :');
    if (!note) {
      return;
    }
    this.productsService.adjust(product.id, delta, note).subscribe(() => this.load());
  }
}
