export interface SaleItem {
  id: string;
  quantite: number;
  prixUnitaire: string;
  sousTotal: string;
  product: { id: string; nom: string; sku?: string | null };
}

export interface Sale {
  id: string;
  numeroVente: string;
  date: string;
  montantTotal: string;
  statut: 'COMPLETED' | 'CANCELLED';
  boutiqueId: string;
  boutique?: { id: string; nom: string };
  userId: string;
  user?: { id: string; nom: string; prenom: string };
  items: SaleItem[];
  createdAt: string;
}
