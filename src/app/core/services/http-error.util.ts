import { HttpErrorResponse } from '@angular/common/http';

/** Message lisible d'une erreur de l'API (chaîne, ou liste d'erreurs de validation). */
export function errorText(err: unknown, fallback = 'Une erreur est survenue.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Impossible de joindre le serveur. Vérifiez votre connexion.';
    }
    const message = err.error?.message;
    if (Array.isArray(message)) return message.join(' ');
    if (typeof message === 'string') return message;
  }
  return fallback;
}
