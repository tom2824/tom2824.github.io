import { lang, locale, T } from './i18n';
import { isoDate } from './logic';

const eur = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' });
const eurWhole = new Intl.NumberFormat(locale, {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0,
});
const dateShort = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' });
const dateLong = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' });
const dateTime = new Intl.DateTimeFormat(locale, {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
const decimal = lang === 'fr' ? ',' : '.';

export function money(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  return eur.format(Number(value));
}

/**
 * Un montant arrondi à l'euro, dans la locale de la page (« 1 200 € », « €1,200 ») : pour les graduations
 * d'axe, où les centimes n'apportent rien.
 */
export function moneyWhole(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  return eurWhole.format(Number(value));
}

export function percent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits).replace('.', decimal)}${lang === 'fr' ? ' %' : '%'}`;
}

export function index(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toFixed(1).replace('.', decimal);
}

/** Intl jette un RangeError sur une date invalide : mieux vaut un tiret qu'un rendu qui s'arrête. */
function safe(format: Intl.DateTimeFormat, date: Date): string {
  return Number.isNaN(date.getTime()) ? '—' : format.format(date);
}

export const fmt = {
  dayMonth: (date: string) => safe(dateShort, isoDate(date)),
  long: (date: string) => safe(dateLong, isoDate(date)),
  dateTime: (iso: string) => safe(dateTime, new Date(iso)),
};

export const AVAILABILITY_LABEL: Record<string, string> = T.availability;

export const QUARANTINE_LABEL: Record<string, string> = T.quarantine;

type Attrs = Record<string, string | number | boolean | null | undefined>;
type Child = Node | string | null | undefined | false;

/** Construit un élément DOM sans passer par innerHTML : le contenu vient de l'API, il ne doit jamais être interprété. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: Child[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (name === 'class') node.className = String(value);
    else if (name === 'text') node.textContent = String(value);
    else node.setAttribute(name, value === true ? '' : String(value));
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

export function clear(node: Element): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}
