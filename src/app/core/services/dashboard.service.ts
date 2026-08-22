import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardOverview, SalesByBoutique, SalesByEmployee } from '../models/dashboard.model';
import { Sale } from '../models/sale.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${this.baseUrl}/overview`);
  }

  getSalesByBoutique(): Observable<SalesByBoutique[]> {
    return this.http.get<SalesByBoutique[]>(`${this.baseUrl}/sales-by-boutique`);
  }

  getSalesByEmployee(): Observable<SalesByEmployee[]> {
    return this.http.get<SalesByEmployee[]>(`${this.baseUrl}/sales-by-employee`);
  }

  getRecentSales(limit = 10): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.baseUrl}/recent-sales`, { params: { limit } });
  }
}
