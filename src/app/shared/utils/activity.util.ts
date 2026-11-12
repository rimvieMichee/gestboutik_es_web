import { ActivityLog } from '../../core/models/platform.model';

export type ActivityTone = 'success' | 'info' | 'warning' | 'danger' | 'muted';

export interface ActivityDescription {
  label: string;
  detail: string;
  tone: ActivityTone;
  icon: string;
}

/** Types d'événements filtrables dans le journal d'activité. */
export const ACTIVITY_ACTIONS: Array<{ value: string; label: string }> = [
  { value: 'SALE_CREATED', label: 'Ventes' },
  { value: 'CREDIT_SETTLED', label: 'Crédits réglés' },
  { value: 'BOUTIQUE_CREATED', label: 'Boutiques créées' },
  { value: 'BOUTIQUE_UPDATED', label: 'Boutiques modifiées' },
  { value: 'BOUTIQUE_STATUS_CHANGED', label: 'Boutiques activées / désactivées' },
  { value: 'USER_CREATED', label: 'Comptes créés' },
  { value: 'USER_STATUS_CHANGED', label: 'Comptes activés / désactivés' },
  { value: 'USER_PASSWORD_RESET', label: 'Mots de passe réinitialisés' },
  { value: 'USER_LOGIN', label: 'Connexions' },
];

const money = (v: unknown) =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(v ?? 0)).replace(/[  ]/g, ' ')} FCFA`;

/** Traduit une ligne d'audit en phrase lisible pour le technicien. */
export function describeActivity(log: ActivityLog): ActivityDescription {
  const m = (log.metadata ?? {}) as Record<string, unknown>;
  const actor = log.user ? `${log.user.prenom} ${log.user.nom}`.trim() || log.user.username : 'Système';

  switch (log.action) {
    case 'SALE_CREATED':
      return {
        label: 'Vente enregistrée',
        detail: `${m['numeroVente'] ?? ''} · ${money(m['montantTotal'])}${m['credit'] ? ` · à crédit (${m['clientNom'] ?? '—'})` : ''} · ${actor}`,
        tone: m['credit'] ? 'warning' : 'success',
        icon: 'receipt',
      };
    case 'CREDIT_SETTLED':
      return {
        label: 'Crédit réglé',
        detail: `${m['numeroVente'] ?? ''} · ${m['clientNom'] ?? '—'} · ${money(m['montantTotal'])}`,
        tone: 'success',
        icon: 'check',
      };
    case 'BOUTIQUE_CREATED':
      return { label: 'Boutique créée', detail: `${m['nom'] ?? ''}`, tone: 'info', icon: 'store' };
    case 'BOUTIQUE_UPDATED':
      return { label: 'Boutique modifiée', detail: `${m['nom'] ?? ''}`, tone: 'muted', icon: 'pencil' };
    case 'BOUTIQUE_STATUS_CHANGED':
      return {
        label: m['statut'] === 'INACTIVE' ? 'Boutique désactivée' : 'Boutique activée',
        detail: actor,
        tone: m['statut'] === 'INACTIVE' ? 'danger' : 'success',
        icon: 'power',
      };
    case 'USER_CREATED':
      return {
        label: m['role'] === 'ADMIN' ? 'Gestionnaire créé' : 'Employé créé',
        detail: `@${m['username'] ?? ''} · par ${actor}`,
        tone: 'info',
        icon: 'users',
      };
    case 'USER_STATUS_CHANGED':
      return {
        label: m['statut'] === 'INACTIVE' ? 'Compte désactivé' : 'Compte activé',
        detail: actor,
        tone: m['statut'] === 'INACTIVE' ? 'danger' : 'success',
        icon: 'power',
      };
    case 'USER_PASSWORD_RESET':
      return {
        label: 'Mot de passe réinitialisé',
        detail: `@${m['username'] ?? ''} · par ${actor}`,
        tone: 'warning',
        icon: 'key',
      };
    case 'USER_LOGIN':
      return { label: 'Connexion', detail: actor, tone: 'muted', icon: 'activity' };
    default:
      return { label: log.action, detail: actor, tone: 'muted', icon: 'activity' };
  }
}
