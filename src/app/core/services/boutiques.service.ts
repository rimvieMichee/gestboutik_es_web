import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResult, PaginationQuery } from '../models/common.model';
import {
  Boutique,
  BoutiqueOverview,
  BoutiqueStatus,
  BoutiqueWithStats,
  BoutiqueWithAdmin,
  CreateBoutiquePayload,
  UpdateBoutiquePayload,
} from '../models/boutique.model';
import { toHttpParams } from './http-params.util';

export interface BoutiqueQuery extends PaginationQuery {
  statut?: BoutiqueStatus;
}

export interface DeleteBoutiqueResult {
  id: string;
  deleted: boolean;
  ventes: number;
  produits: number;
  employes: number;
  gestionnairesSupprimes: number;
}

@Injectable({ providedIn: 'root' })
export class BoutiquesService {
  private readonly baseUrl = `${environment.apiUrl}/boutiques`;

  constructor(private http: HttpClient) {}

  findAll(query: BoutiqueQuery = {}): Observable<PaginatedResult<BoutiqueWithStats>> {
    return this.http.get<PaginatedResult<BoutiqueWithStats>>(this.baseUrl, { params: toHttpParams(query) });
  }

  overview(id: string): Observable<BoutiqueOverview> {
    return this.http.get<BoutiqueOverview>(`${this.baseUrl}/${id}/overview`);
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

  /** Suppression définitive : le nom exact de la boutique est exigé par le serveur. */
  remove(id: string, confirmNom: string): Observable<DeleteBoutiqueResult> {
    return this.http.delete<DeleteBoutiqueResult>(`${this.baseUrl}/${id}`, { params: { confirmNom } });
  }

  changeStatus(id: string, statut: BoutiqueStatus): Observable<Boutique> {
    return this.http.patch<Boutique>(`${this.baseUrl}/${id}/status`, { statut });
  }
}
