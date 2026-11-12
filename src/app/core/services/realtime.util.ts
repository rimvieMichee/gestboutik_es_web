import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, filter } from 'rxjs';
import { RealtimeEvent, RealtimeService } from './realtime.service';

/**
 * Exécute [handler] quand un événement temps réel concerne la page.
 *
 * Les rafales sont regroupées (une seule actualisation par [debounce] ms), les
 * resynchronisations après coupure réseau sont toujours transmises, et
 * l'abonnement s'arrête tout seul à la destruction du composant.
 */
export function onRealtime(
  realtime: RealtimeService,
  destroyRef: DestroyRef,
  matches: (event: RealtimeEvent) => boolean,
  handler: () => void,
  debounce = 700,
): void {
  realtime.events$
    .pipe(
      filter((event) => event.type === 'resync' || matches(event)),
      debounceTime(debounce),
      takeUntilDestroyed(destroyRef),
    )
    .subscribe(() => handler());
}

/** Toute activité sauf les simples connexions (trop fréquentes pour déclencher un rechargement). */
export const isActivityNotLogin = (event: RealtimeEvent): boolean =>
  event.type === 'activity' && event.data['action'] !== 'USER_LOGIN';
