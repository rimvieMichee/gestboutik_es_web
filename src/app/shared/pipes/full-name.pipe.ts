import { Pipe, PipeTransform } from '@angular/core';

// Un compte créé rapidement (username + mot de passe uniquement) n'a pas de
// prénom : évite un nom affiché avec une espace en trop ("  Dupont").
@Pipe({ name: 'fullName', standalone: true })
export class FullNamePipe implements PipeTransform {
  transform(user: { nom?: string | null; prenom?: string | null } | null | undefined): string {
    if (!user) {
      return '—';
    }
    return user.prenom ? `${user.prenom} ${user.nom ?? ''}`.trim() : (user.nom ?? '—');
  }
}
