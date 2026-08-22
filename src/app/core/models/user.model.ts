export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface AppUser {
  id: string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  email?: string | null;
  username: string;
  role: Role;
  statut: UserStatus;
  boutiqueId?: string | null;
  boutique?: { id: string; nom: string; statut: string } | null;
  createdAt: string;
  updatedAt: string;
}

// Le rôle créé n'est jamais envoyé au serveur : il est déduit du rôle de
// l'appelant (SUPER_ADMIN crée un ADMIN, ADMIN crée un EMPLOYEE de sa boutique).
export interface CreateUserPayload {
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  username: string;
  password: string;
  // Utile uniquement quand un SUPER_ADMIN crée un ADMIN.
  boutiqueId?: string;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password' | 'username' | 'boutiqueId'>>;
