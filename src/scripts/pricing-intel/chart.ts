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

export function historyChart(allPoints: HistoryPoint[], series: Series[], options: ChartOptions = {}): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'pi-chart-wrap';
  wrapper.append(drawChart(allPoints, series, options, wrapper));
  return wrapper;
}

function drawChart(allPoints: HistoryPoint[], series: Series[], options: ChartOptions, wrapper: HTMLElement): SVGSVGElement {
  const { highlight, ourPrice = null, windowDays } = options;
  const decisions = sortDecisions(options.ourPriceHistory ?? []);

  const width = 680;
  const height = 280;
  const margin = { top: 16, right: 16, bottom: 34, left: 64 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const root = svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'pi-chart', role: 'img' });
  root.setAttribute('aria-label', T.chart.aria);

  if (allPoints.length === 0) {
    const empty = svg('text', { x: width / 2, y: height / 2, class: 'pi-chart-empty', 'text-anchor': 'middle' });
    empty.textContent = T.chart.empty;
    root.append(empty);
    return root;
  }

  // Fenêtre de temps : terminée au relevé le plus récent, au moins une semaine pour que deux jours ne s'étirent
  // pas sur toute la largeur.
  const dates = allPoints.map((p) => p.observed_date).sort();
  const end = dates[dates.length - 1];
  const start = windowDays ? shiftDay(end, -(windowDays - 1)) : dates[0] < shiftDay(end, -6) ? dates[0] : shiftDay(end, -6);
  const days = eachDay(start, end);
  // Notre prix jour par jour, calculé en une passe plutôt qu'en reparcourant les décisions à chaque lecture.
  const oursByDay = ourPriceByDay(decisions, days, ourPrice);
  const ourPriceOn = (day: string): number | null => oursByDay.get(day) ?? null;
  const points = allPoints.filter((p) => p.observed_date >= start);

  if (points.length === 0) {
    const empty = svg('text', { x: width / 2, y: height / 2, class: 'pi-chart-empty', 'text-anchor': 'middle' });
    empty.textContent = T.chart.emptyWindow;
    root.append(empty);
    return root;
  }

  const prices = points.map((p) => p.price);
  for (const day of days) {
    const ours = ourPriceOn(day);
    if (ours !== null) prices.push(ours);
  }
  const rawMin = Math.min(...prices);
  const rawMax = Math.max(...prices);
  const pad = Math.max((rawMax - rawMin) * 0.15, rawMax * 0.02, 1);
  const step = niceStep(rawMax - rawMin + 2 * pad);
  const yMin = Math.floor((rawMin - pad) / step) * step;
  const yMax = Math.ceil((rawMax + pad) / step) * step;

  const x = (i: number) => margin.left + (days.length === 1 ? innerW / 2 : (i / (days.length - 1)) * innerW);
  const y = (price: number) => margin.top + innerH - ((price - yMin) / (yMax - yMin)) * innerH;

  // Grille et axe des prix.
  for (let tick = yMin; tick <= yMax + 1e-9; tick += step) {
    const yy = y(tick);
    root.append(svg('line', { x1: margin.left, x2: width - margin.right, y1: yy, y2: yy, class: 'pi-chart-grid' }));
    const label = svg('text', { x: margin.left - 8, y: yy + 4, class: 'pi-chart-axis', 'text-anchor': 'end' });
    label.textContent = moneyWhole(tick);
    root.append(label);
  }
  // Axe des dates : au plus ~8 étiquettes.
  const every = Math.max(1, Math.ceil(days.length / 8));
  const last = days.length - 1;
  // La dernière date n'est ajoutée que si elle ne colle pas à l'étiquette régulière précédente.
  const showLast = last % every === 0 || last % every >= every / 2;
  days.forEach((day, i) => {
    const regular = i % every === 0;
    if (!(regular || (i === last && showLast))) return;
    const label = svg('text', { x: x(i), y: height - margin.bottom + 18, class: 'pi-chart-axis', 'text-anchor': 'middle' });
    label.textContent = fmt.dayMonth(day);
    root.append(label);
  });

  if (decisions.length > 0) {
    // Escalier : le prix tient jusqu'à la décision suivante, un repère à chaque changement effectif.
    let d = '';
    let previous: number | null = null;
    days.forEach((day, i) => {
      const price = ourPriceOn(day);
      if (price === null) return;
      if (previous === null) d += `M${x(i).toFixed(1)},${y(price).toFixed(1)} `;
      else d += `L${x(i).toFixed(1)},${y(previous).toFixed(1)} L${x(i).toFixed(1)},${y(price).toFixed(1)} `;
      previous = price;
    });
    root.append(svg('path', { d: d.trim(), class: 'pi-chart-ours', fill: 'none' }));
    const dayIndexOf = new Map(days.map((day, i) => [day, i]));
    for (const decision of decisions) {
      const i = dayIndexOf.get(decision.decision_date);
      if (i === undefined || !decision.changed || decision.new_price === null) continue;
      const cx = x(i);
      const cy = y(decision.new_price);
      root.append(svg('path', { d: `M${cx},${cy - 5} L${cx + 5},${cy} L${cx},${cy + 5} L${cx - 5},${cy} Z`, class: 'pi-chart-ours-mark' }));
    }
    const first = ourPriceOn(days[0]);
    if (first !== null) {
      const label = svg('text', { x: margin.left + 6, y: y(first) - 6, class: 'pi-chart-ours-label', 'text-anchor': 'start' });
      label.textContent = T.chart.ourPrice;
      root.append(label);
    }
  } else if (ourPrice !== null) {
    const yy = y(ourPrice);
    root.append(svg('line', { x1: margin.left, x2: width - margin.right, y1: yy, y2: yy, class: 'pi-chart-ours' }));
    // À gauche : les relevés s'accumulent à droite, le bord gauche reste libre.
    const label = svg('text', { x: margin.left + 6, y: yy - 6, class: 'pi-chart-ours-label', 'text-anchor': 'start' });
    label.textContent = `${T.chart.ourPrice} ${money(ourPrice)}`;
    root.append(label);
  }

  const dayIndex = new Map(days.map((d, i) => [d, i]));
  const dimmed = highlight !== undefined;
  for (const s of series) {
    const own = points.filter((p) => p.source_code === s.code);
    if (own.length === 0) continue;
    const byDay = new Map(own.map((p) => [p.observed_date, p]));
    const group = svg('g', { class: `pi-series${dimmed && s.code !== highlight ? ' is-dimmed' : ''}` });
    group.dataset.source = s.code;

    // Chemin interrompu à chaque jour manquant.
    let d = '';
    let open = false;
    days.forEach((day, i) => {
      const p = byDay.get(day);
      if (!p) { open = false; return; }
      d += `${open ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.price).toFixed(1)} `;
      open = true;
    });
    group.append(svg('path', { d: d.trim(), fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round' }));

    for (const p of own) {
      const i = dayIndex.get(p.observed_date);
      if (i === undefined) continue;
      const inStock = p.availability === 'IN_STOCK';
      const dot = svg('circle', {
        cx: x(i), cy: y(p.price), r: inStock ? 4 : 4.5,
        fill: inStock ? s.color : '#121010', stroke: s.color, 'stroke-width': inStock ? 0 : 2,
        class: `pi-point${p.quarantine !== 'none' ? ' is-quarantined' : ''}`,
      });
      group.append(dot);
    }
    root.append(group);
  }

  // Survol : une colonne invisible par jour, un guide vertical et une infobulle avec le prix de chaque enseigne.
  const guide = svg('line', { class: 'pi-chart-guide', y1: margin.top, y2: margin.top + innerH, x1: 0, x2: 0 });
  guide.setAttribute('visibility', 'hidden');
  root.append(guide);
  const tooltip = document.createElement('div');
  tooltip.className = 'pi-chart-tooltip';
  tooltip.hidden = true;
  wrapper.append(tooltip);

  const byDayAndSource = new Map<string, HistoryPoint>();
  for (const p of points) byDayAndSource.set(`${p.observed_date}|${p.source_code}`, p);
  const halfStep = days.length > 1 ? innerW / (days.length - 1) / 2 : innerW / 2;

  days.forEach((day, i) => {
    const hasData = series.some((s) => byDayAndSource.has(`${day}|${s.code}`));
    if (!hasData) return;
    const zone = svg('rect', {
      x: x(i) - halfStep, y: margin.top, width: halfStep * 2, height: innerH, fill: 'transparent', class: 'pi-chart-zone',
    });
    zone.addEventListener('mouseenter', () => {
      guide.setAttribute('x1', String(x(i)));
      guide.setAttribute('x2', String(x(i)));
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
      const oursOnDay = ourPriceOn(day);
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
      const ratio = x(i) / width;
      tooltip.style.left = `${ratio * 100}%`;
      tooltip.classList.toggle('is-left', ratio > 0.6);
    });
    zone.addEventListener('mouseleave', () => {
      guide.setAttribute('visibility', 'hidden');
      tooltip.hidden = true;
    });
    root.append(zone);
  });
  return root;
}
