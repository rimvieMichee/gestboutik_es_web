import { Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';

/** Événement diffusé par le serveur en temps réel. */
export interface RealtimeEvent {
  /** `stock.updated`, `product.changed`, `sale.created`, `credit.settled`, `activity`, ou `resync` (après une coupure). */
  type: string;
  data: Record<string, unknown>;
}

const EVENTS = ['stock.updated', 'product.changed', 'sale.created', 'credit.settled', 'activity'];

/**
 * Connexion temps réel (Socket.IO) au backend. Le technicien reçoit tout ce qui
 * se passe sur la plateforme : ventes, stock, crédits, créations de comptes.
 * La connexion se rétablit seule après une coupure, et les pages se resynchronisent.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly tokenStorage = inject(TokenStorageService);
  private socket: Socket | null = null;
  private hadConnection = false;
  private authRetries = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly subject = new Subject<RealtimeEvent>();

  readonly events$ = this.subject.asObservable();
  /** Vrai quand le flux en direct est actif (pastille « En direct »). */
  readonly connected = signal(false);

  connect(): void {
    if (this.socket || !this.tokenStorage.getAccessToken()) return;
    if (this.retryTimer) clearTimeout(this.retryTimer);

    // L'API est sur /api ; Socket.IO est servi à la racine du même serveur.
    const url = environment.apiUrl.replace(/\/api\/?$/, '');
    const socket = io(url, {
      transports: ['websocket'],
      // Jeton relu à chaque (re)connexion : l'intercepteur HTTP le renouvelle.
      auth: (callback) => callback({ token: this.tokenStorage.getAccessToken() }),
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 15000,
    });
    this.socket = socket;

    socket.on('connect', () => {
      this.connected.set(true);
      this.authRetries = 0;
      // Après une coupure, des événements ont pu être manqués.
      if (this.hadConnection) this.subject.next({ type: 'resync', data: {} });
      this.hadConnection = true;
    });
    socket.on('disconnect', () => this.connected.set(false));
    socket.on('connect_error', () => this.connected.set(false));

    // Jeton refusé (expiré) : on coupe, puis on réessaie quelques fois avec le
    // jeton renouvelé par l'intercepteur HTTP.
    socket.on('unauthorized', () => {
      this.closeSocket();
      if (this.authRetries < 3 && this.tokenStorage.getAccessToken()) {
        this.authRetries++;
        this.retryTimer = setTimeout(() => this.connect(), 30_000);
      }
    });

    for (const type of EVENTS) {
      socket.on(type, (data: Record<string, unknown>) => this.subject.next({ type, data: data ?? {} }));
    }
  }

  private closeSocket(): void {
    this.socket?.close();
    this.socket = null;
    this.connected.set(false);
  }

  /** À appeler à la déconnexion. */
  disconnect(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.authRetries = 0;
    this.hadConnection = false;
    this.closeSocket();
  }
}
