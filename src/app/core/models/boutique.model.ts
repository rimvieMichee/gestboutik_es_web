export type BoutiqueStatus = 'ACTIVE' | 'INACTIVE';

export interface Boutique {
  id: string;
  nom: string;
  description?: string | null;
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  ville?: string | null;
  statut: BoutiqueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoutiquePayload {
  nom: string;
  description?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  ville?: string;
}

export type UpdateBoutiquePayload = Partial<CreateBoutiquePayload>;
