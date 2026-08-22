import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UsersService } from '../../core/services/users.service';

// Cette page n'est accessible qu'à l'ADMIN d'une boutique (voir roleGuard) :
// elle crée/modifie toujours un EMPLOYEE de SA boutique — jamais de sélecteur
// de rôle ou de boutique, ces deux valeurs sont déduites côté serveur.
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  private userId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    telephone: [''],
    email: ['', Validators.email],
    username: ['', Validators.required],
    password: ['', Validators.minLength(8)],
  });

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEdit.set(true);
      this.form.get('password')?.clearValidators();
      this.form.get('username')?.disable();
      this.usersService.findOne(this.userId).subscribe((user) => {
        this.form.patchValue({
          nom: user.nom,
          prenom: user.prenom,
          telephone: user.telephone ?? '',
          email: user.email ?? '',
          username: user.username,
        });
      });
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();

    const request = this.userId
      ? this.usersService.update(this.userId, {
          nom: value.nom,
          prenom: value.prenom,
          telephone: value.telephone || undefined,
          email: value.email || undefined,
        })
      : this.usersService.create({
          nom: value.nom,
          prenom: value.prenom,
          telephone: value.telephone || undefined,
          email: value.email || undefined,
          username: value.username,
          password: value.password,
        });

    request.subscribe({
      next: () => this.router.navigate(['/users']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Une erreur est survenue.');
      },
    });
  }
}
