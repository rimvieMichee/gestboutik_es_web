import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaginationMeta } from '../../../core/models/common.model';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (meta && meta.totalPages > 1) {
      <div class="pagination">
        <span>Page {{ meta.page }} / {{ meta.totalPages }} ({{ meta.total }} résultats)</span>
        <button class="btn btn-secondary btn-sm" [disabled]="meta.page <= 1" (click)="pageChange.emit(meta.page - 1)">
          Précédent
        </button>
        <button
          class="btn btn-secondary btn-sm"
          [disabled]="meta.page >= meta.totalPages"
          (click)="pageChange.emit(meta.page + 1)"
        >
          Suivant
        </button>
      </div>
    }
  `,
})
export class PaginationComponent {
  @Input() meta: PaginationMeta | null = null;
  @Output() pageChange = new EventEmitter<number>();
}
