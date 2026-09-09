import { fr, type Dictionary } from './fr';
import { en } from './en';

export type Lang = 'fr' | 'en';

export const LANGS: Lang[] = ['fr', 'en'];
export const DEFAULT_LANG: Lang = 'fr';

const DICTIONARIES: Record<Lang, Dictionary> = { fr, en };

export function t(lang: Lang): Dictionary {
  return DICTIONARIES[lang];
}

/** Préfixe d'URL d'une langue : le français est à la racine, l'anglais sous /en. */
export function prefix(lang: Lang): string {
  return lang === DEFAULT_LANG ? '' : `/${lang}`;
}

/** « /cv » en français, « /en/cv » en anglais ; la racine reste « / » et « /en/ ». */
export function localized(path: string, lang: Lang): string {
  const clean = path === '/' ? '' : path.replace(/\/$/, '');
  const result = `${prefix(lang)}${clean}`;
  return result === '' ? '/' : result;
}

/** Le même chemin dans l'autre langue, pour la bascule de la barre de navigation. */
export function switched(pathname: string, lang: Lang): { lang: Lang; href: string } {
  const other: Lang = lang === 'fr' ? 'en' : 'fr';
  const bare = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return { lang: other, href: localized(bare, other) };
}
