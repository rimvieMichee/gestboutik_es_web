import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SalesService } from '../../core/services/sales.service';
import { Sale } from '../../core/models/sale.model';

@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './sale-detail.component.html',
})
export class SaleDetailComponent implements OnInit {
  readonly sale = signal<Sale | null>(null);

  constructor(
    private salesService: SalesService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.salesService.findOne(id).subscribe((sale) => this.sale.set(sale));
  }
}
