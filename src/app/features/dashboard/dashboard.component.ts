import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardOverview, SalesByEmployee } from '../../core/models/dashboard.model';
import { Sale } from '../../core/models/sale.model';
import { FullNamePipe } from '../../shared/pipes/full-name.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, FullNamePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  readonly overview = signal<DashboardOverview | null>(null);
  readonly salesByEmployee = signal<SalesByEmployee[]>([]);
  readonly recentSales = signal<Sale[]>([]);
  readonly loading = signal(true);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getOverview().subscribe((data) => this.overview.set(data));
    this.dashboardService.getSalesByEmployee().subscribe((data) => this.salesByEmployee.set(data));
    this.dashboardService.getRecentSales(10).subscribe((data) => {
      this.recentSales.set(data);
      this.loading.set(false);
    });
  }
}
