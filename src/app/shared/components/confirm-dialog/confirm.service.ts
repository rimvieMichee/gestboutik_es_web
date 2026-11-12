import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (answer: boolean) => void;
}

/** Remplace `window.confirm` par une boîte de dialogue à l'identité de l'application. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly pending = signal<PendingConfirm | null>(null);

  ask(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => this.pending.set({ ...options, resolve }));
  }

  answer(value: boolean): void {
    this.pending()?.resolve(value);
    this.pending.set(null);
  }
}
