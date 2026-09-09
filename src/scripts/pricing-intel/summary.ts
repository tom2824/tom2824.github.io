import type { RecommendationRow, Scope, SummaryRow } from './api';
import { el, index, money, percent, profileLabel } from './format';
import { T } from './i18n';
import { groupByFamily } from './matrix';

function num(value: string | null): number | null {
  return value === null || value === '' ? null : Number(value);
}

function explanationPanel(rec: RecommendationRow, product: SummaryRow): HTMLElement {
  const steps = el('ol', { class: 'pi-steps' }, rec.explanation.steps.map((step) => {
    const changed = step.before !== null && step.after !== null && step.before !== step.after;
    return el('li', { class: `pi-step is-${step.stage === 'règle' ? 'rule' : step.stage === 'stratégie' ? 'strategy' : 'market'}` }, [
      el('span', { class: 'pi-step-stage', text: T.summary.stages[step.stage] ?? step.stage }),
      el('span', { class: 'pi-step-label', text: step.label }),
      step.after !== null
        ? el('span', { class: `pi-step-result${changed ? ' is-changed' : ''}` }, [
          changed ? el('s', { text: money(step.before) }) : null,
          changed ? ' ' : null,
          money(step.after),
        ])
        : null,
    ]);
  }));

  const context = [
    T.summary.profile(profileLabel(rec.profile_key, rec.profile.description)),
    rec.fell_back ? T.summary.fellBack : null,
    product.purchase_price !== null ? T.summary.purchase(money(product.purchase_price)) : null,
    rec.scope === 'segment' ? T.summary.segmentMarket : T.summary.strictMarket,
  ].filter(Boolean).join(' · ');

  return el('div', { class: 'pi-explanation' }, [
    el('p', { class: 'pi-explanation-context', text: context }),
    steps,
  ]);
}

export function renderSummary(
  products: SummaryRow[],
  recommendations: RecommendationRow[],
  scope: Scope,
  profileKey: string,
  segmentLabels: Map<number, string> = new Map(),
): HTMLElement {
  const byProduct = new Map<number, RecommendationRow>();
  for (const r of recommendations) {
    if (r.scope === scope && r.profile_key === profileKey) byProduct.set(r.product_id, r);
  }

  const columnCount = 7;
  const head = el('tr', {}, [
    el('th', { scope: 'col', class: 'pi-col-product', text: T.summary.product }),
    el('th', { scope: 'col', class: 'pi-col-num', text: T.summary.sources }),
    el('th', { scope: 'col', class: 'pi-col-num' }, [
      el('span', { class: 'is-bad', text: T.summary.max }), ' / ', el('span', { class: 'is-good', text: T.summary.min }),
    ]),
    el('th', { scope: 'col', class: 'pi-col-num', text: T.summary.medianMean }),
    el('th', { scope: 'col', class: 'pi-col-num', text: T.summary.ourPrice }),
    el('th', { scope: 'col', class: 'pi-col-num', text: T.summary.recommended }),
    el('th', { scope: 'col', class: 'pi-col-toggle' }, [el('span', { class: 'sr-only', text: T.summary.explanation })]),
  ]);

  const body = el('tbody');
  for (const group of groupByFamily(products)) {
    body.append(el('tr', { class: 'pi-group' }, [
      el('td', { colspan: String(columnCount) }, [
        el('span', { class: 'pi-group-label', text: group.label }),
        el('span', { class: 'pi-group-count', text: T.matrix.products(group.products.length) }),
      ]),
    ]));

    for (const product of group.products) {
      const rec = byProduct.get(product.product_id);
      const median = rec ? num(rec.median) : null;
      const sourceCount = rec ? Number(rec.source_count ?? 0) : 0;
      const current = product.current_price;
      const currentIndex = current !== null && median ? (current / median) * 100 : null;
      const delta = rec?.price != null && current ? ((rec.price - current) / current) * 100 : null;

      // En marché segment, la ligne parle du segment (« RTX 5070 · 12 Go ») et le produit passe en sous-titre.
      const segment = scope === 'segment' ? segmentLabels.get(product.product_id) : undefined;
      const row = el('tr', { class: 'pi-row is-expandable', tabindex: '0', 'aria-expanded': 'false' }, [
        el('th', { scope: 'row', class: 'pi-col-product' }, segment
          ? [
            el('span', { class: 'pi-product-name', text: segment }),
            el('span', { class: 'pi-sub', text: product.product_name }),
          ]
          : [el('span', { class: 'pi-product-name', text: product.product_name })]),
        el('td', { class: 'pi-cell', text: rec ? String(sourceCount) : '—' }),
        rec?.min
          ? el('td', { class: 'pi-cell pi-stack' }, [
            el('span', { class: 'is-bad', text: money(rec.max) }),
            el('span', { class: 'is-good', text: money(rec.min) }),
          ])
          : el('td', { class: 'pi-cell pi-empty', text: '—' }),
        rec?.median
          ? el('td', { class: 'pi-cell pi-stack' }, [
            el('span', { text: money(rec.median) }),
            el('span', { class: 'pi-sub', text: `${T.summary.mean} ${money(rec.mean)}` }),
          ])
          : el('td', { class: 'pi-cell pi-empty', text: '—' }),
        el('td', { class: 'pi-cell pi-ours' }, [
          el('span', { class: 'pi-amount', text: money(current) }),
          // L'index suffit : sous 100 on est sous la médiane du marché (vert), au-dessus on est cher (rouge).
          currentIndex !== null
            ? el('span', {
              class: `pi-sub ${currentIndex < 99.95 ? 'is-good' : currentIndex > 100.05 ? 'is-bad' : ''}`,
              text: `${T.summary.index} ${index(currentIndex)}`,
            })
            : null,
        ]),
        el('td', { class: 'pi-cell pi-reco' }, [
          el('span', { class: `pi-amount${rec?.fell_back ? ' is-hold' : ''}`, text: money(rec?.price) }),
          rec
            ? el('span', { class: 'pi-sub' }, [
              rec.fell_back ? el('span', { class: 'pi-badge is-warn', text: T.summary.hold }) : null,
              rec.fell_back ? ' ' : null,
              delta !== null
                ? `${percent(delta)} · ${T.summary.index} ${index(rec.index_vs_median)}`
                : `${T.summary.index} ${index(rec.index_vs_median)}`,
            ])
            : el('span', { class: 'pi-sub', text: T.summary.noProfile }),
        ]),
        el('td', { class: 'pi-cell pi-col-toggle' }, [
          el('span', { class: 'pi-chevron', 'aria-hidden': 'true' }),
        ]),
      ]);

      const detail = el('tr', { class: 'pi-detail', hidden: true }, [
        el('td', { colspan: String(columnCount) }, [
          rec ? explanationPanel(rec, product) : el('p', { class: 'pi-muted', text: T.summary.none }),
        ]),
      ]);

      const toggle = () => {
        const open = detail.hidden;
        detail.hidden = !open;
        row.classList.toggle('is-open', open);
        row.setAttribute('aria-expanded', String(open));
      };
      row.addEventListener('click', toggle);
      row.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      });
      body.append(row, detail);
    }
  }

  const table = el('table', { class: 'pi-table pi-summary' }, [el('thead', {}, [head]), body]);
  return el('div', {}, [table]);
}

const STRATEGY_ORDER = ['index', 'align', 'undercut', 'cost-plus', 'follow', 'hold'];

function profileRank(key: string): [number, number] {
  const match = key.match(/^(.*?)(?:-(\d+))?$/);
  const strategy = match?.[1] ?? key;
  const order = STRATEGY_ORDER.indexOf(strategy);
  return [order === -1 ? STRATEGY_ORDER.length : order, Number(match?.[2] ?? 0)];
}

/** Les profils disponibles, regroupés par famille de stratégie puis par paramètre croissant. */
export function availableProfiles(recommendations: RecommendationRow[]): Array<{ key: string; label: string; isDefault: boolean }> {
  const seen = new Map<string, { key: string; label: string; isDefault: boolean }>();
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
