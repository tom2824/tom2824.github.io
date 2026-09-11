/**
 * Client de lecture de l'API Pricing Intel (Supabase Data API, schéma « api »).
 * La clé « publishable » est conçue pour être embarquée dans un navigateur : elle ne donne accès qu'aux vues
 * du schéma api, en lecture seule (voir l'ADR 0005 du projet).
 */

export const API_URL = 'https://fzkmavnbetcwlpdirkwl.supabase.co/rest/v1';
export const API_KEY = 'sb_publishable__-HW-IiylH0WzYb-UFFaGQ_bNvi6IW5';
export const REPO_URL = 'https://github.com/tom2824/pricing-intel';

export type Availability = 'IN_STOCK' | 'OUT_OF_STOCK' | 'PREORDER' | 'UNKNOWN';
export type Quarantine = 'none' | 'suspect' | 'confirmed' | 'rejected';
export type Scope = 'strict' | 'segment';

export interface Source {
  code: string;
  label: string;
  kind: string;
  homepage: string;
}

export interface FamilyAttribute {
  code: string;
  label: string;
  type: 'text' | 'number' | 'enum' | 'boolean';
  unit?: string;
  roles: Array<'identity' | 'equivalence' | 'descriptive'>;
}

export interface Family {
  code: string;
  label: string;
  attribute_schema: FamilyAttribute[];
}

export interface ProductRow {
  id: number;
  family_code: string;
  attributes: Record<string, unknown>;
}

export interface SummaryRow {
  product_id: number;
  product_name: string;
  family_code: string;
  family_label: string;
  brand: string;
  equivalence_key: string;
  current_price: number | null;
  purchase_price: number | null;
  currency: string;
  /** Décision tarifaire la plus récente (ADR 0023). */
  decision_profile_key: string | null;
  decision_changed: boolean | null;
  decision_old_price: number | null;
  decision_date: string | null;
}

/** Une décision quotidienne sur notre prix : la règle tirée au sort et le prix qui en résulte. */
export interface OurPriceDecision {
  product_id: number;
  decision_date: string;
  old_price: number | null;
  new_price: number | null;
  profile_key: string;
  strategy: string;
  changed: boolean;
}

export interface MatrixCell {
  product_id: number;
  product_name: string;
  family_code: string;
  brand: string;
  equivalence_key: string;
  current_price: number | null;
  listing_code: string;
  source_code: string;
  source_label: string;
  url: string;
  price: number;
  list_price: number | null;
  currency: string;
  availability: Availability;
  item_condition: string;
  seller_type: string;
  quarantine: Quarantine;
  observed_at: string;
  observed_date: string;
  is_marketplace: boolean;
  min_in_stock: number | null;
}

export interface HistoryPoint {
  listing_code: string;
  source_code: string;
  observed_date: string;
  price: number;
  availability: Availability;
  quarantine: Quarantine;
}

export interface Failure {
  listing_code: string | null;
  source_code: string | null;
  occurred_at: string;
  reason: string;
}

export interface ExplanationStep {
  stage: string;
  label: string;
  before: number | null;
  after: number | null;
}

export interface RetainedOffer {
  source: string;
  listing: string;
  price: number;
  availability: Availability;
}

export interface RecommendationRow {
  product_id: number;
  scope: Scope;
  profile_key: string;
  is_default: boolean;
  strategy: string;
  fell_back: boolean;
  price: number | null;
  index_vs_median: number | null;
  profile: { strategy: string; description: string; [k: string]: unknown };
  min: string | null;
  median: string | null;
  mean: string | null;
  max: string | null;
  source_count: string | null;
  retained: RetainedOffer[];
  explanation: { text: string; steps: ExplanationStep[] };
  computed_at: string;
}

export interface CollectionRun {
  started_at: string;
  finished_at: string | null;
  attempted: number;
  collected: number;
  failed: number;
}

export class ApiError extends Error {
  constructor(readonly view: string, readonly status: number) {
    super(`API ${view} : HTTP ${status}`);
  }
}

/** `signal` permet d'abandonner une requête devenue inutile (voir l'ouverture de la fenêtre de détail). */
async function get<T>(view: string, query: string, signal?: AbortSignal): Promise<T[]> {
  const response = await fetch(`${API_URL}/${view}?${query}`, {
    headers: { apikey: API_KEY, 'Accept-Profile': 'api' },
    signal,
  });
  if (!response.ok) throw new ApiError(view, response.status);
  return (await response.json()) as T[];
}

const RECOMMENDATION_SELECT = [
  'product_id', 'scope', 'profile_key', 'is_default', 'strategy', 'fell_back', 'price', 'index_vs_median',
  'profile', 'min:market->>min', 'median:market->>median', 'mean:market->>mean', 'max:market->>max',
  'source_count:market->>sourceCount', 'retained:market->retained', 'explanation', 'computed_at',
].join(',');

export const api = {
  sources: () => get<Source>('sources', 'select=code,label,kind,homepage'),
  families: () => get<Family>('families', 'select=code,label,attribute_schema'),
  products: () => get<ProductRow>('products', 'select=id,family_code,attributes&status=eq.active'),
  summary: () =>
    get<SummaryRow>(
      'summary',
      'select=product_id,product_name,family_code,family_label,brand,equivalence_key,current_price,purchase_price,currency,decision_profile_key,decision_changed,decision_old_price,decision_date&order=family_code,product_name',
    ),
  matrix: () => get<MatrixCell>('price_matrix', 'select=*&order=product_id,source_code'),
  recommendations: () =>
    get<RecommendationRow>('recommendations', `select=${RECOMMENDATION_SELECT}&order=product_id,scope,profile_key`),
  lastRun: () =>
    get<CollectionRun>('collection_runs', 'select=started_at,finished_at,attempted,collected,failed&order=started_at.desc&limit=1'),
  history: (productId: number, signal?: AbortSignal) =>
    get<HistoryPoint>(
      'price_history',
      `select=listing_code,source_code,observed_date,price,availability,quarantine&product_id=eq.${productId}&order=observed_date,source_code`,
      signal,
    ),
  ourPriceHistory: (productId: number, signal?: AbortSignal) =>
    get<OurPriceDecision>(
      'our_price_history',
      `select=product_id,decision_date,old_price,new_price,profile_key,strategy,changed&product_id=eq.${productId}&order=decision_date`,
      signal,
    ),
  failures: (productId: number, signal?: AbortSignal) =>
    get<Failure>(
      'collection_failures',
      `select=listing_code,source_code,occurred_at,reason&product_id=eq.${productId}&order=occurred_at.desc&limit=30`,
      signal,
    ),
};
