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

export interface BoutiqueUser {
  id: string;
  nom: string;
  prenom: string;
  username: string;
  telephone?: string | null;
  email?: string | null;
  role: 'ADMIN' | 'EMPLOYEE';
  statut: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  derniereConnexion?: string | null;
}

/** Boutique de la liste, avec ses indicateurs de suivi. */
export interface BoutiqueWithStats extends Boutique {
  gestionnaires: BoutiqueUser[];
  stats: {
    employes: number;
    produits: number;
    ventesMois: { nombre: number; chiffreAffaires: number };
    creditEnCours: { nombre: number; montant: number };
    derniereVente: string | null;
  };
}

/** Fiche de suivi complète d'une boutique. */
export interface BoutiqueOverview {
  boutique: Boutique;
  gestionnaires: BoutiqueUser[];
  employes: BoutiqueUser[];
  produits: { actifs: number; archives: number; enRupture: number; stockBas: number };
  ventes: {
    jour: { nombre: number; chiffreAffaires: number };
    mois: { nombre: number; chiffreAffaires: number };
    annee: { nombre: number; chiffreAffaires: number };
    total: { nombre: number; chiffreAffaires: number };
  };
  credits: { nombre: number; montant: number };
  serie: Array<{ date: string; nombre: number; chiffreAffaires: number }>;
  topProduits: Array<{ nom: string; quantite: number; chiffreAffaires: number }>;
  ventesRecentes: Array<{
    id: string;
    numeroVente: string;
    date: string;
    montantTotal: number;
    isCredit: boolean;
    clientNom?: string | null;
    creditRegleAt?: string | null;
    vendeur: string;
    articles: number;
  }>;
  activiteRecente: import('./platform.model').ActivityLog[];
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
  adminTelephone?: string;
  adminUsername: string;
  adminPassword: string;
}

export type UpdateBoutiquePayload = Partial<
  Omit<
    CreateBoutiquePayload,
    'adminNom' | 'adminPrenom' | 'adminUsername' | 'adminPassword' | 'adminTelephone'
  >
>;

export interface BoutiqueWithAdmin extends Boutique {
  admin: { id: string; nom: string; prenom: string; username: string };
}
