import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResult, PaginationQuery } from '../models/common.model';
import { CreateProductPayload, Product, ProductStatus, UpdateProductPayload } from '../models/product.model';
import { toHttpParams } from './http-params.util';

export interface ProductQuery extends PaginationQuery {
  boutiqueId?: string;
  statut?: ProductStatus;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly baseUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  findAll(query: ProductQuery = {}): Observable<PaginatedResult<Product>> {
    return this.http.get<PaginatedResult<Product>>(this.baseUrl, { params: toHttpParams(query) });
  }

  findOne(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateProductPayload): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateProductPayload): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/${id}`, payload);
  }

  changeStatus(id: string, statut: ProductStatus): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/${id}/status`, { statut });
  }

  restock(productId: string, quantite: number, note?: string): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/stock/restock`, { productId, quantite, note });
  }

  adjust(productId: string, quantite: number, note: string): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/stock/adjustment`, { productId, quantite, note });
  }
}
