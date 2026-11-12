import { Pipe, PipeTransform } from '@angular/core';

const formatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

// 1234567 -> « 1 234 567 FCFA » (espace simple, pas d'espace insécable fin).
@Pipe({ name: 'fcfa', standalone: true })
export class FcfaPipe implements PipeTransform {
  transform(value: number | string | null | undefined, withUnit = true): string {
    const amount = Number(value ?? 0);
    const text = formatter.format(Number.isFinite(amount) ? amount : 0).replace(/[  ]/g, ' ');
    return withUnit ? `${text} FCFA` : text;
  }
}
