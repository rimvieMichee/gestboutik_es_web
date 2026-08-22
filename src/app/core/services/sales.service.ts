import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResult, PaginationQuery } from '../models/common.model';
import { Sale } from '../models/sale.model';
import { toHttpParams } from './http-params.util';

export interface SaleQuery extends PaginationQuery {
  boutiqueId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly baseUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  findAll(query: SaleQuery = {}): Observable<PaginatedResult<Sale>> {
    return this.http.get<PaginatedResult<Sale>>(this.baseUrl, { params: toHttpParams(query) });
  }

  findOne(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.baseUrl}/${id}`);
  }
}
