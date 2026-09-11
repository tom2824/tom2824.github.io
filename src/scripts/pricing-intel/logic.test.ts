import { describe, expect, it } from 'vitest';
import type { Family, MatrixCell, OurPriceDecision, ProductRow, RecommendationRow, SummaryRow } from './api';
import {
  availableProfiles, distinctiveNames, eachDay, isoDate, niceStep, ourPriceAt, ourPriceByDay,
  parseProfileKey, pick, priceLadder, profileLabel, profileRank, rankLabel, rankOf, rankTone,
  segmentLabels, shiftDay, sortDecisions, usable,
} from './logic';

// Les textes viennent de i18n : sans document, la langue est le français.

// ---------------------------------------------------------------------------------------------------------
// Jeux d'essai
// ---------------------------------------------------------------------------------------------------------
function cell(over: Partial<MatrixCell> = {}): MatrixCell {
  return {
    product_id: 1,
    product_name: 'Produit',
    source_code: 'ldlc',
    source_label: 'LDLC',
    url: 'https://example.test/1',
    price: 100,
    availability: 'IN_STOCK',
    item_condition: 'NEW',
    quarantine: 'none',
    observed_date: '2026-09-10',
    is_marketplace: false,
    ...over,
  };
}

function product(over: Partial<SummaryRow> = {}): SummaryRow {
  return {
    product_id: 1,
    product_name: 'Produit',
    family_code: 'gpu',
    family_label: 'Carte graphique',
    brand: 'MSI',
    equivalence_key: 'gpu|chip=rtx5070',
    current_price: 700,
    purchase_price: 600,
    ...over,
  };
}

function decision(over: Partial<OurPriceDecision> = {}): OurPriceDecision {
  return {
    product_id: 1,
    decision_date: '2026-09-01',
    old_price: 100,
    new_price: 100,
    profile_key: 'index-98',
    strategy: 'index',
    changed: false,
    ...over,
  };
}

function reco(key: string, isDefault = false, description = 'description'): RecommendationRow {
  return {
    product_id: 1,
    scope: 'strict',
    profile_key: key,
    is_default: isDefault,
    strategy: key.split('-')[0],
    fell_back: false,
    price: 100,
    index_vs_median: 100,
    profile: { strategy: key, description },
    min: '90', median: '100', mean: '100', max: '110', source_count: '3',
    retained: [],
    explanation: { text: '', steps: [] },
    computed_at: '2026-09-10T00:00:00Z',
  };
}

// ---------------------------------------------------------------------------------------------------------
// Choix du relevé affiché
// ---------------------------------------------------------------------------------------------------------
describe('usable', () => {
  it('ne retient que les offres en stock hors quarantaine ouverte', () => {
    expect(usable(cell())).toBe(true);
    expect(usable(cell({ quarantine: 'confirmed' }))).toBe(true);
    expect(usable(cell({ quarantine: 'suspect' }))).toBe(false);
    expect(usable(cell({ quarantine: 'rejected' }))).toBe(false);
    expect(usable(cell({ availability: 'OUT_OF_STOCK' }))).toBe(false);
    expect(usable(cell({ availability: 'PREORDER' }))).toBe(false);
  });
});

describe('pick', () => {
  it('ne rend rien sur une liste vide', () => {
    expect(pick([])).toBeUndefined();
  });

  it('préfère une offre en stock à une offre en rupture plus récente', () => {
    const oos = cell({ price: 50, observed_date: '2026-09-10', availability: 'OUT_OF_STOCK' });
    const stock = cell({ price: 900, observed_date: '2026-09-01' });
    expect(pick([oos, stock])).toBe(stock);
  });

  it('entre deux offres en stock, prend le relevé le plus récent', () => {
    const vieux = cell({ price: 50, observed_date: '2026-09-01' });
    const recent = cell({ price: 900, observed_date: '2026-09-10' });
    expect(pick([vieux, recent])).toBe(recent);
  });

  it('à date égale, prend le moins cher', () => {
    const cher = cell({ price: 900, observed_date: '2026-09-10' });
    const bas = cell({ price: 700, observed_date: '2026-09-10' });
    expect(pick([cher, bas])).toBe(bas);
  });

  it('tout en rupture : retombe sur le plus récent, puis le moins cher', () => {
    const a = cell({ price: 800, observed_date: '2026-09-01', availability: 'OUT_OF_STOCK' });
    const b = cell({ price: 900, observed_date: '2026-09-10', availability: 'OUT_OF_STOCK' });
    const c = cell({ price: 850, observed_date: '2026-09-10', availability: 'OUT_OF_STOCK' });
    expect(pick([a, b, c])).toBe(c);
  });

  it('ne modifie pas la liste reçue', () => {
    const list = [cell({ price: 900 }), cell({ price: 100, observed_date: '2026-01-01' })];
    const copie = [...list];
    pick(list);
    expect(list).toEqual(copie);
  });
});

// ---------------------------------------------------------------------------------------------------------
// Noms distinctifs
// ---------------------------------------------------------------------------------------------------------
describe('distinctiveNames', () => {
  it('retire les mots communs quand les marques diffèrent', () => {
    const names = distinctiveNames([
      product({ product_id: 1, product_name: 'MSI GeForce RTX 5070 VENTUS' }),
      product({ product_id: 2, product_name: 'Gigabyte GeForce RTX 5070 WINDFORCE' }),
    ]);
    expect(names.get(1)).toBe('MSI VENTUS');
    expect(names.get(2)).toBe('Gigabyte WINDFORCE');
  });

  it('distingue deux modèles de la même marque', () => {
    const names = distinctiveNames([
      product({ product_id: 1, product_name: 'Corsair Vengeance 32 Go DDR5 6000' }),
      product({ product_id: 2, product_name: 'Corsair Vengeance 64 Go DDR5 6000' }),
    ]);
    expect(names.get(1)).toBe('32');
    expect(names.get(2)).toBe('64');
  });

  it('garde le nom entier quand il n’y a qu’un produit', () => {
    const names = distinctiveNames([product({ product_id: 7, product_name: 'MSI RTX 5070' })]);
    expect(names.get(7)).toBe('MSI RTX 5070');
  });

  it('retombe sur la marque quand les noms sont identiques', () => {
    const names = distinctiveNames([
      product({ product_id: 1, product_name: 'Même nom', brand: 'MSI' }),
      product({ product_id: 2, product_name: 'Même nom', brand: 'Gigabyte' }),
    ]);
    expect(names.get(1)).toBe('MSI');
    expect(names.get(2)).toBe('Gigabyte');
  });

  it('tronque au-delà de trente caractères', () => {
    const long = 'Seasonic Prime TX 850 W 80 PLUS Titanium modulaire';
    const names = distinctiveNames([product({ product_id: 1, product_name: long })]);
    const kept = names.get(1) ?? '';
    expect(kept.endsWith('…')).toBe(true);
    expect(kept.length).toBeLessThanOrEqual(30);
    expect(long.startsWith(kept.slice(0, -1))).toBe(true);
  });
});

// ---------------------------------------------------------------------------------------------------------
// Classement
// ---------------------------------------------------------------------------------------------------------
describe('priceLadder / rankOf', () => {
  it('dédoublonne : à prix égal, même rang', () => {
    const ladder = priceLadder([120, 100, 100], null);
    expect(ladder).toEqual([100, 120]);
    expect(rankOf(ladder, 100)).toBe(1);
    expect(rankOf(ladder, 120)).toBe(2);
  });

  it('insère notre prix dans l’échelle', () => {
    const ladder = priceLadder([100, 120], 110);
    expect(ladder).toEqual([100, 110, 120]);
    expect(rankOf(ladder, 110)).toBe(2);
    expect(rankOf(ladder, 120)).toBe(3);
    expect(ladder.length).toBe(3);
  });

  it('n’insère pas notre prix sans marché en face', () => {
    expect(priceLadder([], 110)).toEqual([]);
    expect(rankOf(priceLadder([], 110), 110)).toBe(0);
  });

  it('rend 0 pour un prix absent de l’échelle', () => {
    expect(rankOf(priceLadder([100, 120], null), 999)).toBe(0);
  });
});

describe('rankTone / rankLabel', () => {
  it('ne colore rien tant qu’il n’y a qu’un prix', () => {
    expect(rankTone(1, 1)).toBe('');
    expect(rankLabel(1, 1)).toBe('#1');
  });

  it('colore le moins cher et le plus cher', () => {
    expect(rankTone(1, 3)).toBe(' is-good');
    expect(rankTone(3, 3)).toBe(' is-bad');
    expect(rankTone(2, 3)).toBe('');
    expect(rankTone(null, 3)).toBe('');
  });

  it('nomme les extrêmes et numérote le reste', () => {
    expect(rankLabel(1, 3)).toBe('#1 · moins cher');
    expect(rankLabel(3, 3)).toBe('#3 · plus cher');
    expect(rankLabel(2, 3)).toBe('#2');
  });
});

// ---------------------------------------------------------------------------------------------------------
// Notre prix au fil des jours
// ---------------------------------------------------------------------------------------------------------
const DECISIONS = [
  decision({ decision_date: '2026-01-15', old_price: 110, new_price: 120, changed: true }),
  decision({ decision_date: '2026-01-05', old_price: 100, new_price: 110, changed: true }),
  decision({ decision_date: '2026-01-10', old_price: 110, new_price: null }),
];

describe('ourPriceAt', () => {
  it('rend le repli quand il n’y a aucune décision', () => {
    expect(ourPriceAt([], '2026-01-01', 42)).toBe(42);
    expect(ourPriceAt([], '2026-01-01')).toBeNull();
  });

  it('avant la première décision, rend l’ancien prix de celle-ci et non le repli', () => {
    expect(ourPriceAt(DECISIONS, '2026-01-01', 999)).toBe(100);
  });

  it('tient le prix entre deux décisions', () => {
    expect(ourPriceAt(DECISIONS, '2026-01-05')).toBe(110);
    expect(ourPriceAt(DECISIONS, '2026-01-07')).toBe(110);
    expect(ourPriceAt(DECISIONS, '2026-01-14')).toBe(110);
    expect(ourPriceAt(DECISIONS, '2026-01-15')).toBe(120);
    expect(ourPriceAt(DECISIONS, '2026-06-01')).toBe(120);
  });

  it('ignore une décision sans nouveau prix', () => {
    expect(ourPriceAt(DECISIONS, '2026-01-10')).toBe(110);
  });

  it('trie les décisions reçues en désordre et ne touche pas au tableau', () => {
    const copie = [...DECISIONS];
    expect(ourPriceAt(DECISIONS, '2026-01-20')).toBe(120);
    expect(DECISIONS).toEqual(copie);
    expect(sortDecisions(DECISIONS).map((d) => d.decision_date))
      .toEqual(['2026-01-05', '2026-01-10', '2026-01-15']);
  });

  it('part du nouveau prix si la première décision n’a pas d’ancien prix', () => {
    const list = [decision({ decision_date: '2026-01-05', old_price: null, new_price: 130, changed: true })];
    expect(ourPriceAt(list, '2026-01-01')).toBe(130);
  });
});

describe('ourPriceByDay', () => {
  it('donne jour par jour le même résultat que ourPriceAt', () => {
    const days = eachDay('2026-01-01', '2026-01-20');
    const byDay = ourPriceByDay(DECISIONS, days, 999);
    expect(byDay.size).toBe(days.length);
    for (const day of days) {
      expect(byDay.get(day)).toBe(ourPriceAt(DECISIONS, day, 999));
    }
  });

  it('remplit tous les jours avec le repli sans aucune décision', () => {
    const byDay = ourPriceByDay([], ['2026-01-01', '2026-01-02'], 55);
    expect([...byDay.values()]).toEqual([55, 55]);
  });
});

// ---------------------------------------------------------------------------------------------------------
// Profils tarifaires
// ---------------------------------------------------------------------------------------------------------
describe('parseProfileKey', () => {
  it('sépare la stratégie de son paramètre', () => {
    expect(parseProfileKey('index-98')).toEqual({ strategy: 'index', param: '98' });
    expect(parseProfileKey('undercut-1')).toEqual({ strategy: 'undercut', param: '1' });
    expect(parseProfileKey('cost-plus-25')).toEqual({ strategy: 'cost-plus', param: '25' });
  });

  it('rend la clé entière quand il n’y a pas de paramètre', () => {
    expect(parseProfileKey('align')).toEqual({ strategy: 'align', param: '' });
    expect(parseProfileKey('cost-plus')).toEqual({ strategy: 'cost-plus', param: '' });
  });
});

describe('profileLabel', () => {
  it('traduit les stratégies connues avec leur paramètre', () => {
    expect(profileLabel('index-98')).toBe('Index 98 % de la médiane');
    expect(profileLabel('undercut-1')).toBe('Sous le moins cher de 1 %');
    expect(profileLabel('cost-plus-25')).toBe('Marge cible 25 % sur l\'achat');
    expect(profileLabel('align')).toBe('Alignement sur le moins cher');
    expect(profileLabel('follow')).toBe('Suivi du leader');
    expect(profileLabel('hold')).toBe('Maintien du prix');
  });

  it('retombe sur la description, puis sur la clé, pour une stratégie inconnue', () => {
    expect(profileLabel('mystere-7', 'Règle maison')).toBe('Règle maison');
    expect(profileLabel('mystere-7')).toBe('mystere-7');
  });
});

describe('profileRank', () => {
  it('ordonne par famille de stratégie puis par paramètre', () => {
    expect(profileRank('index-95')).toEqual([0, 95]);
    expect(profileRank('align')).toEqual([1, 0]);
    expect(profileRank('hold')).toEqual([5, 0]);
  });

  it('renvoie les stratégies inconnues en fin', () => {
    expect(profileRank('mystere')[0]).toBeGreaterThan(profileRank('hold')[0]);
  });
});

describe('availableProfiles', () => {
  it('dédoublonne, ordonne et laisse les stratégies inconnues en fin', () => {
    const profiles = availableProfiles([
      reco('undercut-1'),
      reco('index-100'),
      reco('mystere', false, 'Règle maison'),
      reco('align'),
      reco('index-95', true),
      reco('index-95'),
      reco('index-100'),
    ]);
    expect(profiles.map((p) => p.key)).toEqual(['index-95', 'index-100', 'align', 'undercut-1', 'mystere']);
    expect(profiles.filter((p) => p.isDefault).map((p) => p.key)).toEqual(['index-95']);
    expect(profiles[4].label).toBe('Règle maison');
  });

  it('ne rend rien sans recommandation', () => {
    expect(availableProfiles([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------------------------------------
// Segments
// ---------------------------------------------------------------------------------------------------------
const FAMILIES: Family[] = [
  {
    code: 'gpu',
    label: 'Carte graphique',
    attribute_schema: [
      { code: 'chip', label: 'Puce', type: 'text', roles: ['identity', 'equivalence'] },
      { code: 'vram', label: 'VRAM', type: 'number', unit: 'Go', roles: ['equivalence'] },
      { code: 'oc', label: 'Overclockée', type: 'boolean', roles: ['equivalence'] },
      { code: 'cooler', label: 'Refroidissement', type: 'text', roles: ['descriptive'] },
    ],
  },
  {
    code: 'psu',
    label: 'Alimentation',
    attribute_schema: [
      { code: 'watt', label: 'Puissance', type: 'number', roles: ['equivalence'] },
    ],
  },
];

function row(over: Partial<ProductRow> = {}): ProductRow {
  return { id: 1, family_code: 'gpu', attributes: {}, ...over };
}

describe('segmentLabels', () => {
  it('compose texte, nombre avec unité et booléen vrai', () => {
    const labels = segmentLabels(FAMILIES, [
      row({ id: 1, attributes: { chip: 'RTX 5070', vram: 12, oc: true, cooler: 'VENTUS' } }),
    ]);
    expect(labels.get(1)).toBe('RTX 5070 · 12 Go · Overclockée');
  });

  it('omet un booléen faux et les attributs descriptifs', () => {
    const labels = segmentLabels(FAMILIES, [
      row({ id: 2, attributes: { chip: 'RTX 5070', vram: 12, oc: false, cooler: 'VENTUS' } }),
    ]);
    expect(labels.get(2)).toBe('RTX 5070 · 12 Go');
  });

  it('préfixe du libellé un nombre sans unité', () => {
    const labels = segmentLabels(FAMILIES, [row({ id: 3, family_code: 'psu', attributes: { watt: 850 } })]);
    expect(labels.get(3)).toBe('Puissance 850');
  });

  it('n’inscrit rien quand aucun attribut d’équivalence n’est renseigné', () => {
    const labels = segmentLabels(FAMILIES, [
      row({ id: 4, attributes: { cooler: 'VENTUS' } }),
      row({ id: 5, attributes: { chip: '', vram: null } }),
      row({ id: 6, family_code: 'inconnue', attributes: { chip: 'RTX 5070' } }),
    ]);
    expect(labels.has(4)).toBe(false);
    expect(labels.has(5)).toBe(false);
    expect(labels.has(6)).toBe(false);
  });
});

// ---------------------------------------------------------------------------------------------------------
// Dates et graduations
// ---------------------------------------------------------------------------------------------------------
describe('isoDate / shiftDay / eachDay', () => {
  it('lit une date ISO en UTC, sans décalage local', () => {
    const d = isoDate('2026-09-10');
    expect(d.toISOString()).toBe('2026-09-10T00:00:00.000Z');
    expect(d.getUTCDate()).toBe(10);
  });

  it('rend une date invalide sur une entrée douteuse', () => {
    expect(Number.isNaN(isoDate('pas-une-date').getTime())).toBe(true);
    expect(Number.isNaN(isoDate('').getTime())).toBe(true);
  });

  it('décale en franchissant les mois et les années', () => {
    expect(shiftDay('2026-01-01', -1)).toBe('2025-12-31');
    expect(shiftDay('2026-02-28', 1)).toBe('2026-03-01');
    expect(shiftDay('2026-09-10', -6)).toBe('2026-09-04');
  });

  it('énumère les jours bornes comprises, sans trou', () => {
    expect(eachDay('2026-02-26', '2026-03-02'))
      .toEqual(['2026-02-26', '2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02']);
    expect(eachDay('2026-09-10', '2026-09-10')).toEqual(['2026-09-10']);
    expect(eachDay('2026-09-10', '2026-09-01')).toEqual([]);
  });

  it('ne saute pas de jour au changement d’heure européen', () => {
    // 2026-03-29 : passage à l'heure d'été en Europe. En heure locale, un jour ferait 23 h.
    expect(eachDay('2026-03-28', '2026-03-30')).toEqual(['2026-03-28', '2026-03-29', '2026-03-30']);
    expect(eachDay('2026-10-24', '2026-10-26')).toEqual(['2026-10-24', '2026-10-25', '2026-10-26']);
  });
});

describe('niceStep', () => {
  it('rend un pas rond de la famille 1 / 2 / 2,5 / 5 / 10', () => {
    expect(niceStep(40)).toBe(10);
    expect(niceStep(8)).toBe(2);
    expect(niceStep(100)).toBe(25);
    expect(niceStep(1000)).toBe(250);
    expect(niceStep(4)).toBe(1);
  });

  it('reste positif sur une amplitude nulle', () => {
    expect(niceStep(0)).toBeGreaterThan(0);
  });

  it('découpe l’amplitude en quatre graduations au plus', () => {
    for (const range of [3, 17, 42, 199, 780, 5400]) {
      expect(Math.ceil(range / niceStep(range))).toBeLessThanOrEqual(4);
    }
  });
});
