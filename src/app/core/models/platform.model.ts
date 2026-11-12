export interface DayPoint {
  date: string; // YYYY-MM-DD
  nombre: number;
  chiffreAffaires: number;
}

export interface PeriodStat {
  nombre: number;
  chiffreAffaires: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user?: { id?: string; nom: string; prenom: string; username: string; role?: string } | null;
  boutique?: { id: string; nom: string } | null;
}

export interface PlatformOverview {
  boutiques: { total: number; actives: number; inactives: number };
  gestionnaires: { total: number; actifs: number };
  employes: { total: number; actifs: number };
  produits: { actifs: number; enRupture: number; stockBas: number };
  ventes: { jour: PeriodStat; mois: PeriodStat; annee: PeriodStat; total: PeriodStat };
  credits: { nombre: number; montant: number };
  serie: DayPoint[];
  topBoutiques: Array<{ id: string; nom: string; ville?: string | null; nombreVentes: number; chiffreAffaires: number }>;
  sansActivite: Array<{ id: string; nom: string; ville?: string | null; creeLe: string; derniereVente: string | null }>;
  activiteRecente: ActivityLog[];
}
