export interface SalesAggregate {
  nombreVentes: number;
  chiffreAffaires: string;
}

export interface DashboardOverview {
  totalBoutiques: number;
  activeBoutiques: number;
  totalEmployees: number;
  totalSales: number;
  chiffreAffaires: string;
  ventesDuJour: SalesAggregate;
  ventesSemaine: SalesAggregate;
  ventesMois: SalesAggregate;
}

export interface SalesByBoutique {
  boutiqueId: string;
  boutiqueNom: string;
  nombreVentes: number;
  chiffreAffaires: string;
}

export interface SalesByEmployee {
  userId: string;
  nomComplet: string;
  boutique: { id: string; nom: string } | null;
  nombreVentes: number;
  chiffreAffaires: string;
}
