export interface SalesAggregate {
  nombreVentes: number;
  chiffreAffaires: string;
}

// Tableau de bord de l'ADMIN, toujours scopé à SA boutique.
export interface DashboardOverview {
  totalEmployees: number;
  totalProducts: number;
  totalSales: number;
  chiffreAffaires: string;
  ventesDuJour: SalesAggregate;
  ventesSemaine: SalesAggregate;
  ventesMois: SalesAggregate;
}

export interface SalesByEmployee {
  userId: string;
  nomComplet: string;
  nombreVentes: number;
  chiffreAffaires: string;
}
