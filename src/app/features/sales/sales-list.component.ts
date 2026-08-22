import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SalesService } from '../../core/services/sales.service';
import { Sale } from '../../core/models/sale.model';
import { PaginationMeta } from '../../core/models/common.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { FullNamePipe } from '../../shared/pipes/full-name.pipe';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, PaginationComponent, FullNamePipe],
  templateUrl: './sales-list.component.html',
})
export class SalesListComponent implements OnInit {
  readonly sales = signal<Sale[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
  private page = 1;

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.salesService
      .findAll({
        page: this.page,
        limit: 20,
        dateFrom: this.dateFrom() || undefined,
        dateTo: this.dateTo() || undefined,
      })
      .subscribe((res) => {
        this.sales.set(res.data);
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
}
