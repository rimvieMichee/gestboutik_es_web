import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResult, PaginationQuery } from '../models/common.model';
import {
  Boutique,
  BoutiqueStatus,
  BoutiqueWithAdmin,
  CreateBoutiquePayload,
  UpdateBoutiquePayload,
} from '../models/boutique.model';
import { toHttpParams } from './http-params.util';

@Injectable({ providedIn: 'root' })
export class BoutiquesService {
  private readonly baseUrl = `${environment.apiUrl}/boutiques`;

  constructor(private http: HttpClient) {}

  findAll(query: PaginationQuery = {}): Observable<PaginatedResult<Boutique>> {
    return this.http.get<PaginatedResult<Boutique>>(this.baseUrl, { params: toHttpParams(query) });
  }

  findOne(id: string): Observable<Boutique> {
    return this.http.get<Boutique>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateBoutiquePayload): Observable<BoutiqueWithAdmin> {
    return this.http.post<BoutiqueWithAdmin>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateBoutiquePayload): Observable<Boutique> {
    return this.http.patch<Boutique>(`${this.baseUrl}/${id}`, payload);
  }

  changeStatus(id: string, statut: BoutiqueStatus): Observable<Boutique> {
    return this.http.patch<Boutique>(`${this.baseUrl}/${id}/status`, { statut });
  }
}
