import {
  api, REPO_URL, type MatrixCell, type RecommendationRow, type Scope, type Source, type SummaryRow,
} from './api';
import { historyChart, SERIES_COLORS, type Series } from './chart';
import { AVAILABILITY_LABEL, clear, el, fmt, money } from './format';
import { T } from './i18n';
import { availableProfiles, profileLabel, segmentLabels } from './logic';
import { renderMatrix } from './matrix';
import { renderSummary } from './summary';

function byId<E extends HTMLElement>(id: string): E {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Élément #${id} introuvable`);
  return node as E;
}

/** Le message d'une erreur, quelle que soit la valeur jetée. */
function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const statusEl = byId<HTMLDivElement>('pi-status');
const errorEl = byId<HTMLDivElement>('pi-error');
const matrixEl = byId<HTMLDivElement>('pi-matrix');
const summaryEl = byId<HTMLDivElement>('pi-summary');
const hideMarketplace = byId<HTMLInputElement>('pi-hide-marketplace');
const profileSelect = byId<HTMLSelectElement>('pi-profile');
const dialog = byId<HTMLDialogElement>('pi-dialog');
const dialogTitle = byId<HTMLElement>('pi-dialog-title');
const dialogBody = byId<HTMLDivElement>('pi-dialog-body');
const announceEl = byId<HTMLParagraphElement>('pi-announce');
const tablist = document.querySelector<HTMLElement>('.pi-tabs');
const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.pi-tab'));
const views = Array.from(document.querySelectorAll<HTMLElement>('.pi-view'));

interface Data {
  sources: Source[];
  products: SummaryRow[];
  cells: MatrixCell[];
  recommendations: RecommendationRow[];
  /** Libellé lisible du segment de chaque produit : les caractéristiques d'équivalence de sa famille. */
  segmentLabels: Map<number, string>;
  /** Date du relevé le plus récent de la matrice, calculée une fois au chargement. */
  latestDate: string | undefined;
}

let data: Data | undefined;

// ---------------------------------------------------------------------------------------------------------
// Onglets
// ---------------------------------------------------------------------------------------------------------
/**
 * Affiche l'onglet demandé : sélection ARIA, panneaux, et tabindex roving (seul l'onglet actif est
 * atteignable au Tab, les autres se rejoignent aux flèches). `focusTab` sert la navigation au clavier.
 */
function showView(name: string, focusTab = false) {
  tabs.forEach((tab) => {
    const active = tab.dataset.view === name;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focusTab) tab.focus();
  });
  views.forEach((view) => { view.hidden = view.dataset.view !== name; });
  const hashes: Record<string, string> = { matrix: 'matrice', summary: 'synthese', how: 'fonctionnement' };
  if (history.replaceState) history.replaceState(null, '', `#${hashes[name] ?? 'matrice'}`);
}
tabs.forEach((tab) => tab.addEventListener('click', () => showView(tab.dataset.view ?? 'matrix')));

// Pattern ARIA Tabs : flèches (avec bouclage), Début et Fin ; activation automatique, le focus suit.
tablist?.addEventListener('keydown', (event) => {
  const current = tabs.findIndex((tab) => tab === document.activeElement);
  if (current === -1) return;
  const target = event.key === 'ArrowRight' ? (current + 1) % tabs.length
    : event.key === 'ArrowLeft' ? (current - 1 + tabs.length) % tabs.length
      : event.key === 'Home' ? 0
        : event.key === 'End' ? tabs.length - 1
          : -1;
  if (target === -1) return;
  event.preventDefault();
  showView(tabs[target].dataset.view ?? 'matrix', true);
});

showView(location.hash === '#synthese' ? 'summary' : location.hash === '#fonctionnement' ? 'how' : 'matrix');

// ---------------------------------------------------------------------------------------------------------
// Rendu des vues
// ---------------------------------------------------------------------------------------------------------
/** L'étendue de marché cochée dans un groupe de boutons radio (la matrice et la synthèse ont chacun le sien). */
function scopeOf(radioName: string): Scope {
  const checked = document.querySelector<HTMLInputElement>(`input[name="${radioName}"]:checked`);
  return checked?.value === 'segment' ? 'segment' : 'strict';
}

/**
 * Le résumé lu par les lecteurs d'écran après un rendu. Les tableaux ne sont pas des régions live : les
 * relire en entier à chaque changement de filtre serait illisible, une phrase suffit. La vue masquée se tait.
 */
function announce(host: HTMLElement, text: string): void {
  if (host.closest<HTMLElement>('.pi-view')?.hidden) return;
  announceEl.textContent = text;
}

function drawMatrix() {
  if (!data) return;
  clear(matrixEl);
  matrixEl.append(renderMatrix(data.products, data.cells, data.sources, {
    hideMarketplace: hideMarketplace.checked,
    latestDate: data.latestDate,
    scope: scopeOf('pi-matrix-scope'),
    segmentLabels: data.segmentLabels,
    onSelect: openDetail,
  }));
  fitTable(matrixEl);
  // Deux colonnes ne sont pas des enseignes : le produit et notre prix.
  const sourceCount = Math.max(0, matrixEl.querySelectorAll('thead th').length - 2);
  const rowCount = matrixEl.querySelectorAll('tbody tr.pi-row').length;
  // En mode segment une ligne est un segment, pas un produit : le résumé le dit avec le bon mot.
  const rows = scopeOf('pi-matrix-scope') === 'segment' ? T.matrix.segments(rowCount) : T.matrix.products(rowCount);
  announce(matrixEl, T.main.announceMatrix(rows, sourceCount));
}
document.querySelectorAll<HTMLInputElement>('input[name="pi-matrix-scope"]').forEach((radio) => radio.addEventListener('change', drawMatrix));

function drawSummary() {
  if (!data) return;
  clear(summaryEl);
  summaryEl.append(renderSummary(data.products, data.recommendations, scopeOf('pi-scope'), profileSelect.value, data.segmentLabels));
  fitTable(summaryEl);
  announce(summaryEl, T.main.announceSummary(summaryEl.querySelectorAll('tbody tr.pi-row').length, profileLabel(profileSelect.value)));
}

// Un tableau plus large que son cadre défile horizontalement (au prix de l'en-tête collant) ;
// sinon le cadre reste clippé, ce qui garde l'en-tête collant au défilement vertical de la page.
function fitTable(wrap: HTMLElement) {
  const table = wrap.querySelector('table');
  wrap.classList.toggle('pi-scroll', table !== null && table.scrollWidth > wrap.clientWidth + 1);
}
let fitPending = false;
window.addEventListener('resize', () => {
  if (fitPending) return;
  fitPending = true;
  requestAnimationFrame(() => {
    fitPending = false;
    fitTable(matrixEl);
    fitTable(summaryEl);
  });
});

hideMarketplace.addEventListener('change', drawMatrix);
profileSelect.addEventListener('change', drawSummary);
document.querySelectorAll<HTMLInputElement>('input[name="pi-scope"]').forEach((radio) => radio.addEventListener('change', drawSummary));

// ---------------------------------------------------------------------------------------------------------
// Fenêtre de détail : historique d'un produit, enseigne cliquée mise en avant
// ---------------------------------------------------------------------------------------------------------
function seriesFor(sources: Source[], codes: Set<string>): Series[] {
  return sources
    .map((s, i) => ({ code: s.code, label: s.label, color: SERIES_COLORS[i % SERIES_COLORS.length] }))
    .filter((s) => codes.has(s.code));
}

/**
 * L'ouverture en cours. Cliquer vite sur deux produits afficherait sinon l'historique du premier sous le titre
 * du second : chaque ouverture, et la fermeture de la fenêtre, annulent la précédente.
 */
let detailRequest: AbortController | undefined;

async function openDetail(productId: number, sourceCode: string) {
  if (!data) return;
  detailRequest?.abort();
  const request = new AbortController();
  detailRequest = request;

  const product = data.products.find((p) => p.product_id === productId);
  dialogTitle.textContent = product?.product_name ?? T.main.product(productId);
  clear(dialogBody);
  dialogBody.append(el('p', { class: 'pi-muted', text: T.main.loadingHistory }));
  if (!dialog.open) dialog.showModal();

  try {
    const [history, failures, ourPriceHistory] = await Promise.all([
      api.history(productId, request.signal),
      api.failures(productId, request.signal),
      api.ourPriceHistory(productId, request.signal),
    ]);
    if (detailRequest !== request) return;
    const codes = new Set(history.map((h) => h.source_code));
    const series = seriesFor(data.sources, codes);
    let highlighted: string | undefined = codes.has(sourceCode) ? sourceCode : undefined;
    let windowDays: number | undefined = 7;

    const chartHost = el('div', { class: 'pi-chart-host' });
    const draw = () => {
      clear(chartHost);
      chartHost.append(historyChart(history, series, {
        highlight: highlighted, ourPrice: product?.current_price ?? null, ourPriceHistory, windowDays,
      }));
    };
    draw();

    const ranges: Array<{ label: string; days: number | undefined }> = [
      { label: T.main.ranges.d7, days: 7 }, { label: T.main.ranges.d30, days: 30 }, { label: T.main.ranges.d90, days: 90 }, { label: T.main.ranges.all, days: undefined },
    ];
    const rangeBar = el('div', { class: 'pi-range', role: 'group', 'aria-label': T.main.period }, ranges.map((r) => {
      const button = el('button', { type: 'button', class: `pi-range-btn${r.days === windowDays ? ' active' : ''}`, text: r.label });
      button.addEventListener('click', () => {
        windowDays = r.days;
        rangeBar.querySelectorAll('.pi-range-btn').forEach((b) => b.classList.toggle('active', b === button));
        draw();
      });
      return button;
    }));

    const latestCells = data.cells.filter((c) => c.product_id === productId);
    const legend = el('ul', { class: 'pi-series-legend' }, series.map((s) => {
      const cell = latestCells.find((c) => c.source_code === s.code);
      const item = el('li', { class: `pi-series-item${s.code === highlighted ? ' is-active' : ''}` }, [
        el('button', { type: 'button', class: 'pi-series-toggle', 'aria-pressed': String(s.code === highlighted) }, [
          el('span', { class: 'pi-swatch', style: `background:${s.color}` }),
          el('span', { class: 'pi-series-label', text: s.label }),
        ]),
        cell
          ? el('span', { class: 'pi-series-last' }, [
            el('strong', { text: money(cell.price) }),
            ` · ${AVAILABILITY_LABEL[cell.availability] ?? cell.availability} · ${fmt.dayMonth(cell.observed_date)}`,
            ' · ',
            el('a', { href: cell.url, target: '_blank', rel: 'noopener', text: T.main.seeListing }),
          ])
          : el('span', { class: 'pi-series-last pi-muted', text: T.main.inactive }),
      ]);
      item.querySelector('button')?.addEventListener('click', () => {
        highlighted = highlighted === s.code ? undefined : s.code;
        legend.querySelectorAll<HTMLElement>('.pi-series-item').forEach((li) => {
          const active = li === item && highlighted !== undefined;
          li.classList.toggle('is-active', active);
          li.querySelector('button')?.setAttribute('aria-pressed', String(active));
        });
        draw();
      });
      return item;
    }));

    clear(dialogBody);
    dialogBody.append(rangeBar, chartHost, legend);

    // Les décisions quotidiennes sur notre prix : la règle tirée au sort et son effet, jour par jour (ADR 0023).
    if (ourPriceHistory.length > 0) {
      const decisions = [...ourPriceHistory].sort((a, b) => b.decision_date.localeCompare(a.decision_date));
      const list = el('ul', { class: 'pi-decisions' }, decisions.slice(0, 30).map((d) => el('li', {}, [
        el('span', { class: 'pi-failure-when', text: fmt.long(d.decision_date) }),
        ' · ',
        el('span', { class: 'pi-failure-source', text: profileLabel(d.profile_key) }),
        ' · ',
        d.changed && d.old_price !== null
          ? el('span', { class: 'pi-decision-move' }, [`${money(d.old_price)} → `, el('strong', { text: money(d.new_price) })])
          : el('span', { class: 'pi-muted', text: T.main.unchangedAt(money(d.new_price ?? d.old_price)) }),
      ])));
      dialogBody.append(el('details', { class: 'pi-failures-box', open: sourceCode === '' }, [
        el('summary', { text: T.main.decisions(decisions.length) }),
        list,
      ]));
    }

    if (failures.length > 0) {
      const list = el('ul', { class: 'pi-failures' }, failures.slice(0, 8).map((f) => el('li', {}, [
        el('span', { class: 'pi-failure-when', text: fmt.dateTime(f.occurred_at) }),
        ' ',
        el('span', { class: 'pi-failure-source', text: data?.sources.find((s) => s.code === f.source_code)?.label ?? f.source_code ?? '' }),
        ' — ',
        el('span', { class: 'pi-failure-reason', text: f.reason.length > 140 ? `${f.reason.slice(0, 140)}…` : f.reason }),
      ])));
      dialogBody.append(el('details', { class: 'pi-failures-box' }, [
        el('summary', { text: T.main.failures(`${failures.length}${failures.length >= 30 ? '+' : ''}`) }),
        list,
      ]));
    }
  } catch (error) {
    if (detailRequest !== request) return;
    clear(dialogBody);
    dialogBody.append(el('p', { class: 'pi-error', text: T.main.historyError(messageOf(error)) }));
  }
}

dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener('close', () => {
  detailRequest?.abort();
  detailRequest = undefined;
});
byId<HTMLButtonElement>('pi-dialog-close').addEventListener('click', () => dialog.close());

// ---------------------------------------------------------------------------------------------------------
// Chargement
// ---------------------------------------------------------------------------------------------------------
function showLoadError(error: unknown): void {
  statusEl.textContent = '';
  errorEl.hidden = false;
  clear(errorEl);
  errorEl.append(
    el('p', {}, [
      el('strong', { text: T.main.unavailable }),
      T.main.apiSaid(messageOf(error)),
      T.main.stillOn,
      el('a', { href: REPO_URL, target: '_blank', rel: 'noopener', text: 'GitHub' }),
      '.',
    ]),
  );
}

async function load() {
  // allSettled plutôt que all : une vue accessoire qui tombe ne doit pas emporter toute la page.
  const [sourcesR, productsR, cellsR, recommendationsR, runsR, familiesR, productRowsR] = await Promise.allSettled([
    api.sources(), api.summary(), api.matrix(), api.recommendations(), api.lastRun(), api.families(), api.products(),
  ]);

  // Sans l'une de ces quatre vues il n'y a rien à montrer : écran d'erreur.
  if (sourcesR.status === 'rejected') return showLoadError(sourcesR.reason);
  if (productsR.status === 'rejected') return showLoadError(productsR.reason);
  if (cellsR.status === 'rejected') return showLoadError(cellsR.reason);
  if (recommendationsR.status === 'rejected') return showLoadError(recommendationsR.reason);

  const { value: sources } = sourcesR;
  const { value: products } = productsR;
  const { value: cells } = cellsR;
  const { value: recommendations } = recommendationsR;
  // Accessoires : sans familles ni attributs, la matrice se rabat sur la clé d'équivalence (voir matrix.ts).
  const families = familiesR.status === 'fulfilled' ? familiesR.value : [];
  const productRows = productRowsR.status === 'fulfilled' ? productRowsR.value : [];

  try {
    data = {
      sources,
      products,
      cells,
      recommendations,
      segmentLabels: segmentLabels(families, productRows),
      latestDate: cells.map((c) => c.observed_date).sort().at(-1),
    };

    clear(statusEl);
    const run = runsR.status === 'fulfilled' ? runsR.value[0] : undefined;
    if (run) {
      const sourceCount = new Set(cells.map((c) => c.source_code)).size;
      statusEl.append(
        el('span', { class: 'pi-status-dot', 'aria-hidden': 'true' }),
        el('span', {}, [
          T.main.lastCollect,
          el('strong', { text: fmt.dateTime(run.finished_at ?? run.started_at) }),
          T.main.status(run.collected, run.attempted, products.length, sourceCount),
        ]),
      );
    } else if (runsR.status === 'fulfilled') {
      statusEl.append(T.main.noRun);
    }
    // Si la vue des collectes n'a pas répondu, pas de ligne de statut du tout : mieux vaut rien qu'une contrevérité.

    // La case « masquer les vendeurs tiers » n'a de sens que si une offre de marketplace existe.
    const marketplaceLabel = hideMarketplace.closest<HTMLElement>('.pi-check');
    if (marketplaceLabel) marketplaceLabel.hidden = !cells.some((c) => c.is_marketplace);

    const profiles = availableProfiles(recommendations);
    const reference = profiles.find((p) => p.isDefault);
    for (const profile of profiles) {
      profileSelect.append(el('option', { value: profile.key, text: profile.isDefault ? `${profile.label} ${T.profile.reference}` : profile.label }));
    }
    if (reference) profileSelect.value = reference.key;

    drawMatrix();
    drawSummary();
  } catch (error) {
    showLoadError(error);
  }
}

load();
