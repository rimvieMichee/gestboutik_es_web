import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResult, PaginationQuery } from '../models/common.model';
import { AppUser, CreateUserPayload, Role, UpdateUserPayload, UserStatus } from '../models/user.model';
import { toHttpParams } from './http-params.util';

export interface UserQuery extends PaginationQuery {
  boutiqueId?: string;
  role?: Role;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  findAll(query: UserQuery = {}): Observable<PaginatedResult<AppUser>> {
    return this.http.get<PaginatedResult<AppUser>>(this.baseUrl, { params: toHttpParams(query) });
  }

  findOne(id: string): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateUserPayload): Observable<AppUser> {
    return this.http.post<AppUser>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateUserPayload): Observable<AppUser> {
    return this.http.patch<AppUser>(`${this.baseUrl}/${id}`, payload);
  }

  changeStatus(id: string, statut: UserStatus): Observable<AppUser> {
    return this.http.patch<AppUser>(`${this.baseUrl}/${id}/status`, { statut });
  }

  resetPassword(id: string, password: string): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(`${this.baseUrl}/${id}/password`, { password });
  }
}
