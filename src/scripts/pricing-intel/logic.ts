/**
 * La logique de la démo, sans DOM : choix des relevés, classements, échelles, dates, profils.
 * Tout ce qui se teste sans navigateur vit ici ; les vues (matrix, summary, chart, main) s'en servent.
 */
import type { Family, MatrixCell, OurPriceDecision, ProductRow, RecommendationRow, SummaryRow } from './api';
import { T } from './i18n';

// ---------------------------------------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------------------------------------

/** Une date ISO « AAAA-MM-JJ » lue sans passer par le fuseau local. Une entrée douteuse donne une date invalide. */
export function isoDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** La même date décalée de `delta` jours, en UTC. */
export function shiftDay(date: string, delta: number): string {
  const d = isoDate(date);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Tous les jours de `from` à `to` inclus, sans trou : l'axe du graphique ne saute pas les jours sans relevé. */
export function eachDay(from: string, to: string): string[] {
  const days: string[] = [];
  const cursor = isoDate(from);
  const end = isoDate(to).getTime();
  while (cursor.getTime() <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

// ---------------------------------------------------------------------------------------------------------
// Choix des relevés
// ---------------------------------------------------------------------------------------------------------

/** Une offre compte dans le classement si elle est en stock et que son prix n'est pas en quarantaine. */
export function usable(cell: MatrixCell): boolean {
  return cell.availability === 'IN_STOCK' && (cell.quarantine === 'none' || cell.quarantine === 'confirmed');
}

/**
 * Une seule cellule par ligne et enseigne. Parmi les annonces candidates (plusieurs produits en mode segment) :
 * les offres en stock d'abord, puis le relevé le plus récent, puis le moins cher.
 */
export function pick(cells: MatrixCell[]): MatrixCell | undefined {
  const byRecencyThenPrice = (a: MatrixCell, b: MatrixCell) =>
    b.observed_date.localeCompare(a.observed_date) || a.price - b.price;
  const inStock = cells.filter(usable).sort(byRecencyThenPrice);
  return inStock[0] ?? [...cells].sort(byRecencyThenPrice)[0];
}

/**
 * Ce qui distingue un produit des autres de sa ligne : son nom sans les mots communs à tous
 * (« GeForce RTX 5070 » sur une ligne de RTX 5070, « 32 Go DDR5 6000 MHz CL30 » sur une ligne de kits).
 */
export function distinctiveNames(products: SummaryRow[]): Map<number, string> {
  const tokens = products.map((p) => p.product_name.split(/\s+/));
  const common = new Set(tokens.length > 1
    ? tokens[0].filter((t) => tokens.every((list) => list.includes(t)))
    : []);
  return new Map(products.map((p, i) => {
    const kept = tokens[i].filter((t) => !common.has(t)).join(' ').trim() || p.brand;
    return [p.product_id, kept.length > 30 ? `${kept.slice(0, 29).trimEnd()}…` : kept];
  }));
}

// ---------------------------------------------------------------------------------------------------------
// Classement des prix
// ---------------------------------------------------------------------------------------------------------

/** L'échelle des prix comparables, dédoublonnée et croissante, notre prix inséré s'il y a un marché. */
export function priceLadder(marketPrices: number[], ourPrice: number | null): number[] {
  return [...new Set(ourPrice !== null && marketPrices.length ? [...marketPrices, ourPrice] : marketPrices)]
    .sort((a, b) => a - b);
}

/** Le rang d'un prix dans l'échelle : 1 pour le moins cher, 0 s'il n'y figure pas. À prix égal, même rang. */
export function rankOf(ladder: number[], price: number): number {
  return ladder.indexOf(price) + 1;
}

/** Vert pour le moins cher, rouge pour le plus cher, dès qu'il y a au moins deux prix distincts. */
export function rankTone(rank: number | null, lastRank: number): string {
  if (rank === null || lastRank < 2) return '';
  if (rank === 1) return ' is-good';
  if (rank === lastRank) return ' is-bad';
  return '';
}

/** « #1 · moins cher », « #4 · plus cher », « #2 » : le rang se lit sans légende. */
export function rankLabel(rank: number, lastRank: number): string {
  if (lastRank < 2) return `#${rank}`;
  if (rank === 1) return T.matrix.cheapest;
  if (rank === lastRank) return T.matrix.dearest(rank);
  return `#${rank}`;
}

// ---------------------------------------------------------------------------------------------------------
// Notre prix au fil des jours (ADR 0023)
// ---------------------------------------------------------------------------------------------------------

/** Les décisions triées par date croissante, sans toucher au tableau d'origine. */
export function sortDecisions(decisions: OurPriceDecision[]): OurPriceDecision[] {
  return [...decisions].sort((a, b) => a.decision_date.localeCompare(b.decision_date));
}

/**
 * Notre prix un jour donné : la dernière décision à cette date ou avant, sinon l'ancien prix de la première
 * décision connue. Sans aucune décision, `fallback` (notre prix actuel).
 */
export function ourPriceAt(
  decisions: OurPriceDecision[],
  day: string,
  fallback: number | null = null,
): number | null {
  if (decisions.length === 0) return fallback;
  const sorted = sortDecisions(decisions);
  let price: number | null = sorted[0].old_price ?? sorted[0].new_price;
  for (const d of sorted) {
    if (d.decision_date > day) break;
    if (d.new_price !== null) price = d.new_price;
  }
  return price;
}

/**
 * Notre prix pour chaque jour d'une série croissante, en une seule passe : le graphique interroge une Map
 * au lieu de reparcourir les décisions à chaque jour.
 */
export function ourPriceByDay(
  decisions: OurPriceDecision[],
  days: string[],
  fallback: number | null = null,
): Map<string, number | null> {
  const byDay = new Map<string, number | null>();
  if (decisions.length === 0) {
    for (const day of days) byDay.set(day, fallback);
    return byDay;
  }
  const sorted = sortDecisions(decisions);
  let price: number | null = sorted[0].old_price ?? sorted[0].new_price;
  let i = 0;
  for (const day of days) {
    for (; i < sorted.length && sorted[i].decision_date <= day; i += 1) {
      const next = sorted[i].new_price;
      if (next !== null) price = next;
    }
    byDay.set(day, price);
  }
  return byDay;
}

// ---------------------------------------------------------------------------------------------------------
// Profils tarifaires
// ---------------------------------------------------------------------------------------------------------

const STRATEGY_ORDER = ['index', 'align', 'undercut', 'cost-plus', 'follow', 'hold'];

/** « index-98 » → stratégie « index » et paramètre « 98 ». Sans paramètre, la clé entière est la stratégie. */
export function parseProfileKey(key: string): { strategy: string; param: string } {
  const match = key.match(/^(.*?)(?:-(\d+))?$/);
  return { strategy: match?.[1] ?? key, param: match?.[2] ?? '' };
}

/** Un libellé lisible pour une clé de profil précalculé (« index-98 », « undercut-1 », « align »…). */
export function profileLabel(key: string, description?: string): string {
  const { strategy, param } = parseProfileKey(key);
  switch (strategy) {
    case 'index': return T.profile.index(param);
    case 'undercut': return T.profile.undercut(param);
    case 'cost-plus': return T.profile.costPlus(param);
    case 'align': return T.profile.align;
    case 'follow': return T.profile.follow;
    case 'hold': return T.profile.hold;
    default: return description ?? key;
  }
}

/** Une clé de tri : famille de stratégie d'abord (les inconnues en fin), paramètre croissant ensuite. */
export function profileRank(key: string): [number, number] {
  const { strategy, param } = parseProfileKey(key);
  const order = STRATEGY_ORDER.indexOf(strategy);
  return [order === -1 ? STRATEGY_ORDER.length : order, Number(param || 0)];
}

export interface Profile {
  key: string;
  label: string;
  isDefault: boolean;
}

/** Les profils disponibles, dédoublonnés, regroupés par famille de stratégie puis par paramètre croissant. */
export function availableProfiles(recommendations: RecommendationRow[]): Profile[] {
  const seen = new Map<string, Profile>();
  for (const r of recommendations) {
    if (!seen.has(r.profile_key)) {
      seen.set(r.profile_key, { key: r.profile_key, label: profileLabel(r.profile_key, r.profile.description), isDefault: r.is_default });
    }
  }
  return [...seen.values()].sort((a, b) => {
    const [sa, pa] = profileRank(a.key);
    const [sb, pb] = profileRank(b.key);
    return sa - sb || pa - pb;
  });
}

// ---------------------------------------------------------------------------------------------------------
// Segments
// ---------------------------------------------------------------------------------------------------------

/** « RTX 5070 · 12 Go », « 850 W · 80+ Gold · modulaire » : la clé d'équivalence, mais pour un humain. */
export function segmentLabels(families: Family[], products: ProductRow[]): Map<number, string> {
  const schemas = new Map(families.map((f) => [f.code, f.attribute_schema]));
  const labels = new Map<number, string>();
  for (const p of products) {
    const parts: string[] = [];
    for (const attribute of schemas.get(p.family_code) ?? []) {
      if (!attribute.roles.includes('equivalence')) continue;
      const value = p.attributes[attribute.code];
      if (value === undefined || value === null || value === '') continue;
      if (attribute.type === 'boolean') {
        if (value === true) parts.push(attribute.label);
      } else if (attribute.type === 'number') {
        parts.push(attribute.unit ? `${value} ${attribute.unit}` : `${attribute.label} ${value}`);
      } else {
        parts.push(String(value));
      }
    }
    if (parts.length) labels.set(p.id, parts.join(' · '));
  }
  return labels;
}

// ---------------------------------------------------------------------------------------------------------
// Échelles
// ---------------------------------------------------------------------------------------------------------

/** Un pas de graduation « rond » (1, 2, 2,5, 5, 10 × une puissance de dix) pour une amplitude donnée. */
export function niceStep(range: number): number {
  const rough = range / 4;
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(rough, 0.01)));
  for (const candidate of [1, 2, 2.5, 5, 10]) {
    if (candidate * magnitude >= rough) return candidate * magnitude;
  }
  return 10 * magnitude;
}
