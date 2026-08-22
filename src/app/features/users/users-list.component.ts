import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { AppUser } from '../../core/models/user.model';
import { PaginationMeta } from '../../core/models/common.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [RouterLink, FormsModule, PaginationComponent],
  templateUrl: './users-list.component.html',
})
export class UsersListComponent implements OnInit {
  readonly users = signal<AppUser[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly search = signal('');
  private page = 1;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.usersService.findAll({ page: this.page, limit: 20, search: this.search() }).subscribe((res) => {
      this.users.set(res.data);
      this.meta.set(res.meta);
    });
  }

  onSearch(): void {
    this.page = 1;
    this.load();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.load();
  }

  toggleStatus(user: AppUser): void {
    const next = user.statut === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = next === 'INACTIVE' ? 'désactiver' : 'activer';
    if (!confirm(`Confirmer : ${action} le compte de ${user.prenom} ${user.nom} ?`)) {
      return;
    }
    this.usersService.changeStatus(user.id, next).subscribe(() => this.load());
  }

  resetPassword(user: AppUser): void {
    const password = prompt(`Nouveau mot de passe pour ${user.username} (min. 8 caractères) :`);
    if (!password) {
      return;
    }
    if (password.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    this.usersService.resetPassword(user.id, password).subscribe(() => alert('Mot de passe réinitialisé.'));
  }
}
