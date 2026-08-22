export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface Product {
  id: string;
  nom: string;
  description?: string | null;
  prixVente: string;
  prixAchat?: string | null;
  quantiteDisponible: number;
  seuilAlerte: number;
  sku?: string | null;
  image?: string | null;
  statut: ProductStatus;
  boutiqueId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  nom: string;
  description?: string;
  prixVente: number;
  prixAchat?: number;
  quantiteDisponible?: number;
  seuilAlerte?: number;
  sku?: string;
  image?: string;
  boutiqueId: string;
}

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, 'boutiqueId' | 'quantiteDisponible'>>;
