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

// Le SUPER_ADMIN crée la boutique et son administrateur en une seule étape :
// c'est ce compte Admin qui gérera ensuite les employés de la boutique.
export interface CreateBoutiquePayload {
  nom: string;
  description?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  ville?: string;
  adminNom: string;
  adminPrenom: string;
  adminUsername: string;
  adminPassword: string;
}

export type UpdateBoutiquePayload = Partial<
  Omit<CreateBoutiquePayload, 'adminNom' | 'adminPrenom' | 'adminUsername' | 'adminPassword'>
>;

export interface BoutiqueWithAdmin extends Boutique {
  admin: { id: string; nom: string; prenom: string; username: string };
}
