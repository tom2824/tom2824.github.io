import type { MatrixCell, Scope, Source, SummaryRow } from './api';
import { AVAILABILITY_LABEL, QUARANTINE_LABEL, el, fmt, money } from './format';
import { T } from './i18n';

export interface MatrixOptions {
  hideMarketplace: boolean;
  /** Date du relevé le plus récent de la matrice : une cellule plus ancienne affiche sa propre date. */
  latestDate?: string;
  /** strict : une ligne par produit ; segment : une ligne par groupe de produits équivalents. */
  scope?: Scope;
  /** Libellé lisible du segment de chaque produit (voir main.ts). */
  segmentLabels?: Map<number, string>;
  onSelect: (productId: number, sourceCode: string) => void;
}

interface Group {
  code: string;
  label: string;
  products: SummaryRow[];
}

/** Une ligne de la matrice : un produit, ou un segment regroupant plusieurs produits équivalents. */
interface Row {
  label: string;
  sub?: string;
  products: SummaryRow[];
}

export function groupByFamily(products: SummaryRow[]): Group[] {
  const groups = new Map<string, Group>();
  for (const p of products) {
    let group = groups.get(p.family_code);
    if (!group) {
      group = { code: p.family_code, label: p.family_label, products: [] };
      groups.set(p.family_code, group);
    }
    group.products.push(p);
  }
  return [...groups.values()];
}

function rowsOf(group: Group, scope: Scope, segmentLabels: Map<number, string>): Row[] {
  if (scope === 'strict') {
    return group.products.map((p) => ({ label: p.product_name, products: [p] }));
  }
  const segments = new Map<string, Row>();
  for (const p of group.products) {
    let row = segments.get(p.equivalence_key);
    if (!row) {
      row = { label: segmentLabels.get(p.product_id) ?? p.equivalence_key, products: [] };
      segments.set(p.equivalence_key, row);
    }
    row.products.push(p);
  }
  for (const row of segments.values()) {
    row.sub = row.products.length > 1 ? T.matrix.equivalents(row.products.length) : row.products[0].product_name;
  }
  return [...segments.values()];
}

/** Une offre compte dans le classement si elle est en stock et que son prix n'est pas en quarantaine. */
function usable(cell: MatrixCell): boolean {
  return cell.availability === 'IN_STOCK' && (cell.quarantine === 'none' || cell.quarantine === 'confirmed');
}

/**
 * Une seule cellule par ligne et enseigne. Parmi les annonces candidates (plusieurs produits en mode segment) :
 * les offres en stock d'abord, puis le relevé le plus récent, puis le moins cher.
 */
function pick(cells: MatrixCell[]): MatrixCell | undefined {
  const byRecencyThenPrice = (a: MatrixCell, b: MatrixCell) =>
    b.observed_date.localeCompare(a.observed_date) || a.price - b.price;
  const inStock = cells.filter(usable).sort(byRecencyThenPrice);
  return inStock[0] ?? [...cells].sort(byRecencyThenPrice)[0];
}

/**
 * Ce qui distingue un produit des autres de sa ligne : son nom sans les mots communs à tous
 * (« GeForce RTX 5070 » sur une ligne de RTX 5070, « 32 Go DDR5 6000 MHz CL30 » sur une ligne de kits).
 */
function distinctiveNames(products: SummaryRow[]): Map<number, string> {
  const tokens = products.map((p) => p.product_name.split(/\s+/));
  const common = new Set(tokens.length > 1
    ? tokens[0].filter((t) => tokens.every((list) => list.includes(t)))
    : []);
  return new Map(products.map((p, i) => {
    const kept = tokens[i].filter((t) => !common.has(t)).join(' ').trim() || p.brand;
    return [p.product_id, kept.length > 30 ? `${kept.slice(0, 29).trimEnd()}…` : kept];
  }));
}

/** Vert pour le moins cher, rouge pour le plus cher, dès qu'il y a au moins deux prix distincts. */
function rankTone(rank: number | null, lastRank: number): string {
  if (rank === null || lastRank < 2) return '';
  if (rank === 1) return ' is-good';
  if (rank === lastRank) return ' is-bad';
  return '';
}

/** « #1 · moins cher », « #4 · plus cher », « #2 » : le rang se lit sans légende. */
function rankLabel(rank: number, lastRank: number): string {
  if (lastRank < 2) return `#${rank}`;
  if (rank === 1) return T.matrix.cheapest;
  if (rank === lastRank) return T.matrix.dearest(rank);
  return `#${rank}`;
}

function priceCell(cell: MatrixCell, rank: number | null, lastRank: number, which: string | undefined, options: MatrixOptions): HTMLTableCellElement {
  const inStock = cell.availability === 'IN_STOCK';
  const availability = AVAILABILITY_LABEL[cell.availability] ?? cell.availability;
  const tooltip = [
    cell.product_name,
    `${cell.source_label} · ${T.matrix.observedOn(fmt.long(cell.observed_date))}`,
    availability,
    cell.is_marketplace ? T.matrix.marketplace : null,
    cell.item_condition !== 'NEW' ? T.matrix.condition(cell.item_condition) : null,
    QUARANTINE_LABEL[cell.quarantine] ?? null,
  ].filter(Boolean).join('\n');

  const notes: string[] = [];
  if (rank !== null) notes.push(rankLabel(rank, lastRank));
  if (!inStock) notes.push(availability.toLowerCase());
  if (options.latestDate !== undefined && cell.observed_date < options.latestDate) {
    notes.push(T.matrix.observedOn(fmt.dayMonth(cell.observed_date)));
  }

  const button = el('button', {
    type: 'button',
    class: `pi-price${inStock ? '' : ' is-oos'}${rank === 1 ? ' is-first' : ''}${cell.quarantine === 'suspect' || cell.quarantine === 'rejected' ? ' is-quarantined' : ''}`,
    title: tooltip,
    'aria-label': `${money(cell.price)} ${T.matrix.at} ${cell.source_label}, ${availability}${rank !== null ? `, ${rank === 1 ? T.matrix.cheapestAria : T.matrix.nthAria(rank)}` : ''}. ${T.matrix.seeHistory}`,
  }, [
    el('span', { class: 'pi-amount' }, [
      money(cell.price),
      cell.is_marketplace ? el('span', { class: 'pi-badge', text: 'MP' }) : null,
      cell.quarantine === 'suspect' ? el('span', { class: 'pi-badge is-warn', text: '?' }) : null,
    ]),
    notes.length ? el('span', { class: `pi-sub${rankTone(rank, lastRank)}`, text: notes.join(' · ') }) : null,
    // En mode segment, dire quel produit du segment porte ce prix.
    which ? el('span', { class: 'pi-sub pi-which', text: which }) : null,
  ]);
  button.addEventListener('click', () => options.onSelect(cell.product_id, cell.source_code));
  return el('td', { class: 'pi-cell' }, [button]);
}

export function renderMatrix(
  products: SummaryRow[],
  allCells: MatrixCell[],
  sources: Source[],
  options: MatrixOptions,
): HTMLElement {
  const scope = options.scope ?? 'strict';
  const segmentLabels = options.segmentLabels ?? new Map<number, string>();
  const cells = options.hideMarketplace ? allCells.filter((c) => !c.is_marketplace) : allCells;
  const hidden = allCells.length - cells.length;

  const columns = sources.filter((s) => cells.some((c) => c.source_code === s.code));
  const byProduct = new Map<number, MatrixCell[]>();
  for (const c of cells) {
    const list = byProduct.get(c.product_id) ?? [];
    list.push(c);
    byProduct.set(c.product_id, list);
  }

  const head = el('tr', {}, [
    el('th', { scope: 'col', class: 'pi-col-product', text: scope === 'segment' ? T.matrix.segment : T.matrix.product }),
    el('th', { scope: 'col', class: 'pi-col-num', text: T.matrix.ourPrice }),
    ...columns.map((s) => el('th', { scope: 'col', class: 'pi-col-num' }, [
      el('a', { href: s.homepage, target: '_blank', rel: 'noopener', text: s.label }),
    ])),
  ]);

  const body = el('tbody');
  for (const group of groupByFamily(products)) {
    const rows = rowsOf(group, scope, segmentLabels);
    body.append(el('tr', { class: 'pi-group' }, [
      el('td', { colspan: String(columns.length + 2) }, [
        el('span', { class: 'pi-group-label', text: group.label }),
        el('span', { class: 'pi-group-count', text: scope === 'segment'
          ? `${T.matrix.segments(rows.length)} · ${T.matrix.products(group.products.length)}`
          : T.matrix.products(group.products.length) }),
      ]),
    ]));

    for (const row of rows) {
      const multi = row.products.length > 1;
      const names = multi ? distinctiveNames(row.products) : new Map<number, string>();
      const own = row.products.flatMap((p) => byProduct.get(p.product_id) ?? []);
      const shown = columns.map((s) => pick(own.filter((c) => c.source_code === s.code)));

      // Notre prix : en mode segment, le moins cher de nos produits équivalents.
      const ours = row.products
        .filter((p) => p.current_price !== null)
        .sort((a, b) => (a.current_price ?? 0) - (b.current_price ?? 0))[0];
      const ourPrice = ours?.current_price ?? null;

      // Classement recalculé sur les cellules affichées, notre prix compris ; à prix égal, même rang.
      const marketPrices = shown.filter((c): c is MatrixCell => c !== undefined && usable(c)).map((c) => c.price);
      const ladder = [...new Set(ourPrice !== null && marketPrices.length ? [...marketPrices, ourPrice] : marketPrices)]
        .sort((a, b) => a - b);
      const rankOf = (price: number) => ladder.indexOf(price) + 1;

      body.append(el('tr', { class: 'pi-row' }, [
        el('th', { scope: 'row', class: 'pi-col-product' }, [
          el('span', { class: 'pi-product-name', text: row.label }),
          row.sub ? el('span', { class: 'pi-sub', text: row.sub }) : null,
        ]),
        // Notre prix se clique comme les autres : l'historique montre ses décisions quotidiennes (ADR 0023).
        el('td', { class: 'pi-cell pi-ours' }, [
          ours
            ? (() => {
              const button = el('button', {
                type: 'button', class: 'pi-price pi-price-ours', title: `${ours.product_name}\n${T.matrix.ourTooltip}`,
                'aria-label': T.matrix.ourAria(money(ourPrice)),
              }, [
                el('span', { class: 'pi-amount', text: money(ourPrice) }),
                ourPrice !== null && marketPrices.length
                  ? el('span', { class: `pi-sub${rankTone(rankOf(ourPrice), ladder.length)}`, text: rankLabel(rankOf(ourPrice), ladder.length) })
                  : null,
                multi ? el('span', { class: 'pi-sub pi-which', text: names.get(ours.product_id) }) : null,
              ]);
              button.addEventListener('click', () => options.onSelect(ours.product_id, ''));
              return button;
            })()
            : el('span', { class: 'pi-amount', text: '—' }),
        ]),
        ...shown.map((cell) => cell
          ? priceCell(cell, usable(cell) ? rankOf(cell.price) : null, ladder.length, names.get(cell.product_id), options)
          : el('td', { class: 'pi-cell pi-empty', title: T.matrix.noListing }, ['—'])),
      ]));
    }
  }

  const table = el('table', { class: 'pi-table pi-matrix' }, [el('thead', {}, [head]), body]);
  // Pas de légende permanente : les rangs se lisent seuls. Seuls les repères rares sont expliqués, quand ils sont là.
  const legendItems = [
    allCells.some((c) => c.is_marketplace)
      ? el('span', {}, [el('span', { class: 'pi-badge', text: 'MP' }), T.matrix.thirdParty])
      : null,
    cells.some((c) => c.quarantine === 'suspect')
      ? el('span', {}, [el('span', { class: 'pi-badge is-warn', text: '?' }), T.matrix.suspect])
      : null,
    hidden > 0 ? el('span', { class: 'pi-muted', text: T.matrix.hidden(hidden) }) : null,
  ].filter((item): item is HTMLElement => item !== null);
  return el('div', {}, [table, legendItems.length ? el('div', { class: 'pi-legend' }, legendItems) : null]);
}
