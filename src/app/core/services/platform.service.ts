import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResult, PaginationQuery } from '../models/common.model';
import { ActivityLog, PlatformOverview } from '../models/platform.model';
import { toHttpParams } from './http-params.util';

export interface ActivityQuery extends PaginationQuery {
  boutiqueId?: string;
  action?: string;
}

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private readonly baseUrl = `${environment.apiUrl}/platform`;

  constructor(private http: HttpClient) {}

  overview(): Observable<PlatformOverview> {
    return this.http.get<PlatformOverview>(`${this.baseUrl}/overview`);
  }

  activity(query: ActivityQuery = {}): Observable<PaginatedResult<ActivityLog>> {
    return this.http.get<PaginatedResult<ActivityLog>>(`${this.baseUrl}/activity`, {
      params: toHttpParams(query),
    });
  }
}
