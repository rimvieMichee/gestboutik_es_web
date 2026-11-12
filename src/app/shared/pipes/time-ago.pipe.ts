import { Pipe, PipeTransform } from '@angular/core';

// « il y a 5 min », « hier », « il y a 3 j »... ; au-delà d'un mois, la date.
@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, never = 'Jamais'): string {
    if (!value) {
      return never;
    }
    const date = value instanceof Date ? value : new Date(value);
    const seconds = Math.round((Date.now() - date.getTime()) / 1000);
    if (seconds < 45) return "à l'instant";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `il y a ${hours} h`;
    const days = Math.round(hours / 24);
    if (days === 1) return 'hier';
    if (days < 30) return `il y a ${days} j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
