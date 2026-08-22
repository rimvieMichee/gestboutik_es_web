export type Role = 'SUPER_ADMIN' | 'EMPLOYEE';
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

export interface CreateUserPayload {
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  username: string;
  password: string;
  role: Role;
  boutiqueId?: string;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password' | 'username' | 'role'>>;
