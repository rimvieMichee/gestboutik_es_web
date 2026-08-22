import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../models/auth.model';
import { AppUser } from '../models/user.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly currentUserSignal = signal<AppUser | null>(this.tokenStorage.getUser());

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap((res) => {
        this.tokenStorage.setSession(res.accessToken, res.refreshToken, res.user);
        this.currentUserSignal.set(res.user);
      }),
    );
  }

  logout(): void {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (refreshToken) {
      // Best-effort : on révoque le refresh token côté serveur mais on ne bloque pas la déconnexion locale dessus.
      this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).subscribe({ error: () => undefined });
    }
    this.tokenStorage.clear();
    this.currentUserSignal.set(null);
  }

  refreshSession(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    return this.http
      .post<{ accessToken: string; refreshToken: string }>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((res) => {
          this.tokenStorage.setAccessToken(res.accessToken);
          this.tokenStorage.setRefreshToken(res.refreshToken);
        }),
      );
  }

  hasRole(role: string): boolean {
    return this.currentUserSignal()?.role === role;
  }
}
