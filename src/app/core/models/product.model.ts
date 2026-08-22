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

// La boutique n'est jamais envoyée : c'est toujours celle de l'ADMIN connecté (déduite côté serveur).
export interface CreateProductPayload {
  nom: string;
  description?: string;
  prixVente: number;
  prixAchat?: number;
  quantiteDisponible?: number;
  seuilAlerte?: number;
  sku?: string;
  image?: string;
}

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, 'quantiteDisponible'>>;
