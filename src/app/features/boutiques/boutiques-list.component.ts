import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BoutiquesService } from '../../core/services/boutiques.service';
import { Boutique } from '../../core/models/boutique.model';
import { PaginationMeta } from '../../core/models/common.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-boutiques-list',
  standalone: true,
  imports: [RouterLink, FormsModule, PaginationComponent],
  templateUrl: './boutiques-list.component.html',
})
export class BoutiquesListComponent implements OnInit {
  readonly boutiques = signal<Boutique[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly search = signal('');
  private page = 1;

  constructor(private boutiquesService: BoutiquesService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.boutiquesService.findAll({ page: this.page, limit: 20, search: this.search() }).subscribe((res) => {
      this.boutiques.set(res.data);
      this.meta.set(res.meta);
    });
  }

  onSearch(): void {
    this.page = 1;
    this.load();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.load();
  }

  toggleStatus(boutique: Boutique): void {
    const next = boutique.statut === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = next === 'INACTIVE' ? 'désactiver' : 'activer';
    if (!confirm(`Confirmer : ${action} la boutique "${boutique.nom}" ?`)) {
      return;
    }
    this.boutiquesService.changeStatus(boutique.id, next).subscribe(() => this.load());
  }
}
