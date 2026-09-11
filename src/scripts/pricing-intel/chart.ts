import type { HistoryPoint, OurPriceDecision } from './api';
import { el, fmt, money, moneyWhole } from './format';
import { T } from './i18n';
import { eachDay, niceStep, ourPriceByDay, profileLabel, shiftDay, sortDecisions } from './logic';

const SVG = 'http://www.w3.org/2000/svg';

/** Palette par enseigne : stable dans l'ordre de la liste des sources, lisible sur fond sombre. */
export const SERIES_COLORS = ['#c8956c', '#6ca0c8', '#7fb77e', '#d47fa6', '#e0c060', '#9c8fd6', '#5fc4c0', '#e07b5a'];

export interface Series {
  code: string;
  label: string;
  color: string;
}

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, String(value));
  return node;
}

/**
 * Courbe d'historique : une ligne par enseigne, un point par relevé quotidien. Un jour sans relevé (échec de
 * collecte, annonce disparue) laisse un trou visible dans la ligne : on ne comble jamais l'absence de donnée.
 */
export interface ChartOptions {
  /** Enseigne mise en avant : les autres courbes sont estompées. */
  highlight?: string;
  /** Notre prix actuel, tracé en pointillés quand il n'y a pas encore d'historique de décisions. */
  ourPrice?: number | null;
  /** Décisions quotidiennes sur notre prix (ADR 0023) : tracées en escalier, un repère à chaque changement. */
  ourPriceHistory?: OurPriceDecision[];
  /** Fenêtre en jours, terminée au relevé le plus récent ; absente = tout l'historique. */
  windowDays?: number;
}

// ---------------------------------------------------------------------------------------------------------
// Géométrie
// ---------------------------------------------------------------------------------------------------------

const WIDTH = 680;
const HEIGHT = 280;
const MARGINS = { top: 16, right: 16, bottom: 34, left: 64 };

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** La fenêtre du graphe une fois calculée : où tombe chaque jour, où tombe chaque prix. */
export interface Scale {
  /** Abscisse du i-ième jour de la fenêtre. Un seul jour se pose au milieu, jamais de division par zéro. */
  x: (i: number) => number;
  /** Ordonnée d'un prix. */
  y: (price: number) => number;
  /** Les jours de la fenêtre, sans trou. */
  days: string[];
  /** Les relevés qui tombent dans la fenêtre. */
  points: HistoryPoint[];
  /** Notre prix ce jour-là, null si on ne le connaît pas. */
  ourPriceOn: (day: string) => number | null;
  yMin: number;
  yMax: number;
  /** Le pas entre deux graduations de l'axe des prix. */
  step: number;
  width: number;
  height: number;
  margins: Margins;
  innerW: number;
  innerH: number;
}

/** Ce que notre prix apporte à l'échelle : les décisions quotidiennes, et le prix courant en repli. */
export interface OurPrices {
  decisions: OurPriceDecision[];
  current: number | null;
}

/** Aucune échelle possible : pas le moindre relevé, ou aucun dans la fenêtre demandée. */
export type ScaleResult = { ok: true; scale: Scale } | { ok: false; reason: 'no-data' | 'empty-window' };

/**
 * L'échelle du graphe : la fenêtre de temps, les bornes de l'axe des prix et les deux fonctions de projection.
 * Fonction pure, sans DOM : c'est elle qui se teste.
 */
export function computeScale(allPoints: HistoryPoint[], ours: OurPrices, options: ChartOptions = {}): ScaleResult {
  if (allPoints.length === 0) return { ok: false, reason: 'no-data' };

  const { windowDays } = options;
  const innerW = WIDTH - MARGINS.left - MARGINS.right;
  const innerH = HEIGHT - MARGINS.top - MARGINS.bottom;

  // Fenêtre de temps : terminée au relevé le plus récent, au moins une semaine pour que deux jours ne s'étirent
  // pas sur toute la largeur.
  const dates = allPoints.map((p) => p.observed_date).sort();
  const end = dates[dates.length - 1];
  const start = windowDays ? shiftDay(end, -(windowDays - 1)) : dates[0] < shiftDay(end, -6) ? dates[0] : shiftDay(end, -6);
  const days = eachDay(start, end);
  // Notre prix jour par jour, calculé en une passe plutôt qu'en reparcourant les décisions à chaque lecture.
  const oursByDay = ourPriceByDay(ours.decisions, days, ours.current);
  const ourPriceOn = (day: string): number | null => oursByDay.get(day) ?? null;
  const points = allPoints.filter((p) => p.observed_date >= start);

  if (points.length === 0) return { ok: false, reason: 'empty-window' };

  const prices = points.map((p) => p.price);
  for (const day of days) {
    const oursThatDay = ourPriceOn(day);
    if (oursThatDay !== null) prices.push(oursThatDay);
  }
  const rawMin = Math.min(...prices);
  const rawMax = Math.max(...prices);
  // Le rembourrage vaut au moins un euro : sans lui un prix constant donnerait yMin === yMax, donc une division par zéro.
  const pad = Math.max((rawMax - rawMin) * 0.15, rawMax * 0.02, 1);
  const step = niceStep(rawMax - rawMin + 2 * pad);
  const yMin = Math.floor((rawMin - pad) / step) * step;
  const yMax = Math.ceil((rawMax + pad) / step) * step;

  return {
    ok: true,
    scale: {
      x: (i: number) => MARGINS.left + (days.length === 1 ? innerW / 2 : (i / (days.length - 1)) * innerW),
      y: (price: number) => MARGINS.top + innerH - ((price - yMin) / (yMax - yMin)) * innerH,
      days,
      points,
      ourPriceOn,
      yMin,
      yMax,
      step,
      width: WIDTH,
      height: HEIGHT,
      margins: MARGINS,
      innerW,
      innerH,
    },
  };
}

// ---------------------------------------------------------------------------------------------------------
// Étapes du tracé
// ---------------------------------------------------------------------------------------------------------

/** Le message affiché au centre quand il n'y a rien à tracer. */
function drawEmpty(root: SVGSVGElement, message: string): void {
  const empty = svg('text', { x: WIDTH / 2, y: HEIGHT / 2, class: 'pi-chart-empty', 'text-anchor': 'middle' });
  empty.textContent = message;
  root.append(empty);
}

/** La grille horizontale et l'axe des prix : une ligne et son montant à chaque graduation. */
function drawGrid(root: SVGSVGElement, scale: Scale): void {
  const { margins, step, yMax, yMin } = scale;
  for (let tick = yMin; tick <= yMax + 1e-9; tick += step) {
    const yy = scale.y(tick);
    root.append(svg('line', { x1: margins.left, x2: scale.width - margins.right, y1: yy, y2: yy, class: 'pi-chart-grid' }));
    const label = svg('text', { x: margins.left - 8, y: yy + 4, class: 'pi-chart-axis', 'text-anchor': 'end' });
    label.textContent = moneyWhole(tick);
    root.append(label);
  }
}

/** L'axe des dates : au plus ~8 étiquettes, la dernière seulement si elle ne colle pas à la précédente. */
function drawDateAxis(root: SVGSVGElement, scale: Scale): void {
  const { days, margins } = scale;
  const every = Math.max(1, Math.ceil(days.length / 8));
  const last = days.length - 1;
  const showLast = last % every === 0 || last % every >= every / 2;
  days.forEach((day, i) => {
    const regular = i % every === 0;
    if (!(regular || (i === last && showLast))) return;
    const label = svg('text', { x: scale.x(i), y: scale.height - margins.bottom + 18, class: 'pi-chart-axis', 'text-anchor': 'middle' });
    label.textContent = fmt.dayMonth(day);
    root.append(label);
  });
}

/**
 * Notre prix : en escalier quand on a l'historique des décisions (le prix tient jusqu'à la décision suivante,
 * un repère à chaque changement effectif), en simple ligne quand on n'a que le prix courant.
 */
function drawOurPriceStep(root: SVGSVGElement, scale: Scale, decisions: OurPriceDecision[], ourPrice: number | null): void {
  const { days, margins } = scale;
  if (decisions.length > 0) {
    let d = '';
    let previous: number | null = null;
    days.forEach((day, i) => {
      const price = scale.ourPriceOn(day);
      if (price === null) return;
      if (previous === null) d += `M${scale.x(i).toFixed(1)},${scale.y(price).toFixed(1)} `;
      else d += `L${scale.x(i).toFixed(1)},${scale.y(previous).toFixed(1)} L${scale.x(i).toFixed(1)},${scale.y(price).toFixed(1)} `;
      previous = price;
    });
    root.append(svg('path', { d: d.trim(), class: 'pi-chart-ours', fill: 'none' }));
    const dayIndexOf = new Map(days.map((day, i) => [day, i]));
    for (const decision of decisions) {
      const i = dayIndexOf.get(decision.decision_date);
      if (i === undefined || !decision.changed || decision.new_price === null) continue;
      const cx = scale.x(i);
      const cy = scale.y(decision.new_price);
      root.append(svg('path', { d: `M${cx},${cy - 5} L${cx + 5},${cy} L${cx},${cy + 5} L${cx - 5},${cy} Z`, class: 'pi-chart-ours-mark' }));
    }
    const first = scale.ourPriceOn(days[0]);
    if (first !== null) {
      const label = svg('text', { x: margins.left + 6, y: scale.y(first) - 6, class: 'pi-chart-ours-label', 'text-anchor': 'start' });
      label.textContent = T.chart.ourPrice;
      root.append(label);
    }
  } else if (ourPrice !== null) {
    const yy = scale.y(ourPrice);
    root.append(svg('line', { x1: margins.left, x2: scale.width - margins.right, y1: yy, y2: yy, class: 'pi-chart-ours' }));
    // À gauche : les relevés s'accumulent à droite, le bord gauche reste libre.
    const label = svg('text', { x: margins.left + 6, y: yy - 6, class: 'pi-chart-ours-label', 'text-anchor': 'start' });
    label.textContent = `${T.chart.ourPrice} ${money(ourPrice)}`;
    root.append(label);
  }
}

/** Une courbe et ses points par enseigne. Le chemin s'interrompt à chaque jour sans relevé. */
function drawSeries(root: SVGSVGElement, scale: Scale, series: Series[], highlight: string | undefined): void {
  const { days, points } = scale;
  const dayIndex = new Map(days.map((d, i) => [d, i]));
  const dimmed = highlight !== undefined;
  for (const s of series) {
    const own = points.filter((p) => p.source_code === s.code);
    if (own.length === 0) continue;
    const byDay = new Map(own.map((p) => [p.observed_date, p]));
    const group = svg('g', { class: `pi-series${dimmed && s.code !== highlight ? ' is-dimmed' : ''}` });
    group.dataset.source = s.code;

    let d = '';
    let open = false;
    days.forEach((day, i) => {
      const p = byDay.get(day);
      if (!p) { open = false; return; }
      d += `${open ? 'L' : 'M'}${scale.x(i).toFixed(1)},${scale.y(p.price).toFixed(1)} `;
      open = true;
    });
    group.append(svg('path', { d: d.trim(), fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round' }));

    for (const p of own) {
      const i = dayIndex.get(p.observed_date);
      if (i === undefined) continue;
      const inStock = p.availability === 'IN_STOCK';
      const dot = svg('circle', {
        cx: scale.x(i), cy: scale.y(p.price), r: inStock ? 4 : 4.5,
        fill: inStock ? s.color : '#121010', stroke: s.color, 'stroke-width': inStock ? 0 : 2,
        class: `pi-point${p.quarantine !== 'none' ? ' is-quarantined' : ''}`,
      });
      group.append(dot);
    }
    root.append(group);
  }
}

/**
 * Le survol : une colonne invisible par jour, un guide vertical et une infobulle listant le prix de chaque
 * enseigne. Au doigt il n'y a pas de survol, l'appui sur une colonne ouvre l'infobulle et l'appui ailleurs la ferme.
 */
function attachHover(
  root: SVGSVGElement,
  wrapper: HTMLElement,
  scale: Scale,
  series: Series[],
  decisions: OurPriceDecision[],
  highlight: string | undefined,
): void {
  const { days, margins, points } = scale;
  const guide = svg('line', { class: 'pi-chart-guide', y1: margins.top, y2: margins.top + scale.innerH, x1: 0, x2: 0 });
  guide.setAttribute('visibility', 'hidden');
  root.append(guide);
  const tooltip = document.createElement('div');
  tooltip.className = 'pi-chart-tooltip';
  tooltip.hidden = true;
  wrapper.append(tooltip);
  const hide = () => {
    guide.setAttribute('visibility', 'hidden');
    tooltip.hidden = true;
  };

  const byDayAndSource = new Map<string, HistoryPoint>();
  for (const p of points) byDayAndSource.set(`${p.observed_date}|${p.source_code}`, p);
  const halfStep = days.length > 1 ? scale.innerW / (days.length - 1) / 2 : scale.innerW / 2;

  days.forEach((day, i) => {
    const hasData = series.some((s) => byDayAndSource.has(`${day}|${s.code}`));
    if (!hasData) return;
    const zone = svg('rect', {
      x: scale.x(i) - halfStep, y: margins.top, width: halfStep * 2, height: scale.innerH, fill: 'transparent', class: 'pi-chart-zone',
    });
    const show = () => {
      guide.setAttribute('x1', String(scale.x(i)));
      guide.setAttribute('x2', String(scale.x(i)));
      guide.setAttribute('visibility', 'visible');
      const rows: Node[] = [
        el('div', { class: 'pi-chart-tooltip-date', text: fmt.long(day) }),
        ...series.map((s) => {
          const p = byDayAndSource.get(`${day}|${s.code}`);
          return el('div', { class: `pi-chart-tooltip-row${highlight !== undefined && s.code !== highlight ? ' is-dimmed' : ''}` }, [
            el('span', { class: 'pi-swatch', style: `background:${s.color}` }),
            el('span', { class: 'pi-chart-tooltip-label', text: s.label }),
            el('span', { class: `pi-chart-tooltip-price${p && p.availability !== 'IN_STOCK' ? ' is-oos' : ''}`, text: p ? money(p.price) : T.chart.noReading }),
            p && p.availability !== 'IN_STOCK' ? el('span', { class: 'pi-chart-tooltip-note', text: T.chart.outOfStock }) : null,
            p && p.quarantine !== 'none' ? el('span', { class: 'pi-chart-tooltip-note', text: T.chart.quarantine }) : null,
          ]);
        }),
      ];
      const oursOnDay = scale.ourPriceOn(day);
      if (oursOnDay !== null) {
        const decision = decisions.find((d) => d.decision_date === day);
        rows.push(el('div', { class: 'pi-chart-tooltip-row is-ours' }, [
          el('span', { class: 'pi-swatch is-dashed' }),
          el('span', { class: 'pi-chart-tooltip-label', text: T.chart.ourPrice }),
          el('span', { class: 'pi-chart-tooltip-price', text: money(oursOnDay) }),
          decision
            ? el('span', { class: 'pi-chart-tooltip-note', text: decision.changed ? profileLabel(decision.profile_key) : T.chart.unchanged })
            : null,
        ]));
      }
      tooltip.replaceChildren(...rows);
      tooltip.hidden = false;
      // Position en pourcentage de la largeur : le SVG est mis à l'échelle par le conteneur.
      const ratio = scale.x(i) / scale.width;
      tooltip.style.left = `${ratio * 100}%`;
      tooltip.classList.toggle('is-left', ratio > 0.6);
    };
    zone.addEventListener('mouseenter', show);
    // Au doigt il n'y a pas de survol : un appui sur la colonne ouvre l'infobulle du jour.
    zone.addEventListener('pointerdown', show);
    zone.addEventListener('mouseleave', hide);
    root.append(zone);
  });

  // Un appui hors du graphe referme l'infobulle ouverte au doigt. Le graphe précédent, détaché par un
  // changement de fenêtre, se désabonne de lui-même au premier appui qui suit.
  const closeOnOutside = (event: PointerEvent) => {
    if (!wrapper.isConnected) {
      document.removeEventListener('pointerdown', closeOnOutside);
      return;
    }
    if (event.target instanceof Node && root.contains(event.target)) return;
    hide();
  };
  document.addEventListener('pointerdown', closeOnOutside);
}

// ---------------------------------------------------------------------------------------------------------
// Coordination
// ---------------------------------------------------------------------------------------------------------

export function historyChart(allPoints: HistoryPoint[], series: Series[], options: ChartOptions = {}): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'pi-chart-wrap';
  wrapper.append(drawChart(allPoints, series, options, wrapper));
  return wrapper;
}

/** Enchaîne les étapes du tracé dans l'ordre des plans : grille, axes, notre prix, les enseignes, le survol. */
function drawChart(allPoints: HistoryPoint[], series: Series[], options: ChartOptions, wrapper: HTMLElement): SVGSVGElement {
  const { highlight, ourPrice = null } = options;
  const decisions = sortDecisions(options.ourPriceHistory ?? []);

  const root = svg('svg', { viewBox: `0 0 ${WIDTH} ${HEIGHT}`, class: 'pi-chart', role: 'img' });
  root.setAttribute('aria-label', T.chart.aria);

  const computed = computeScale(allPoints, { decisions, current: ourPrice }, options);
  if (!computed.ok) {
    drawEmpty(root, computed.reason === 'no-data' ? T.chart.empty : T.chart.emptyWindow);
    return root;
  }
  const { scale } = computed;

  drawGrid(root, scale);
  drawDateAxis(root, scale);
  drawOurPriceStep(root, scale, decisions, ourPrice);
  drawSeries(root, scale, series, highlight);
  attachHover(root, wrapper, scale, series, decisions, highlight);
  return root;
}
