import { describe, expect, it } from 'vitest';
import type { HistoryPoint, OurPriceDecision } from './api';
import { computeScale, type ChartOptions, type OurPrices, type Scale } from './chart';

// ---------------------------------------------------------------------------------------------------------
// Jeux d'essai
// ---------------------------------------------------------------------------------------------------------
function point(over: Partial<HistoryPoint> = {}): HistoryPoint {
  return {
    listing_code: 'ldlc-1',
    source_code: 'ldlc',
    observed_date: '2026-09-10',
    price: 100,
    availability: 'IN_STOCK',
    quarantine: 'none',
    ...over,
  };
}

function decision(over: Partial<OurPriceDecision> = {}): OurPriceDecision {
  return {
    product_id: 1,
    decision_date: '2026-09-10',
    old_price: 100,
    new_price: 100,
    profile_key: 'index:98',
    strategy: 'index',
    changed: false,
    ...over,
  };
}

const noOurPrice: OurPrices = { decisions: [], current: null };

/** L'échelle, ou l'échec du test si computeScale a refusé de la calculer. */
function scaleOf(points: HistoryPoint[], ours: OurPrices = noOurPrice, options: ChartOptions = {}): Scale {
  const result = computeScale(points, ours, options);
  if (!result.ok) throw new Error(`échelle attendue, refus « ${result.reason} »`);
  return result.scale;
}

// ---------------------------------------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------------------------------------
describe('computeScale — refus', () => {
  it('refuse sans le moindre relevé', () => {
    expect(computeScale([], noOurPrice)).toEqual({ ok: false, reason: 'no-data' });
  });

  it('accepte dès qu’il y a un relevé, quelle que soit la fenêtre', () => {
    // La fenêtre se termine toujours au relevé le plus récent : celui-là en fait donc toujours partie.
    // Le refus « empty-window » n'est pas atteignable par ce chemin, il ne couvre qu'un appel direct.
    const points = [point({ observed_date: '2026-07-01' }), point({ observed_date: '2026-09-10' })];
    for (const windowDays of [1, 7, 30, 90, undefined]) {
      const result = computeScale(points, noOurPrice, { windowDays });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.scale.points.length).toBeGreaterThan(0);
    }
  });

  it('laisse hors de la fenêtre les relevés trop anciens', () => {
    const points = [point({ observed_date: '2026-07-01' }), point({ observed_date: '2026-09-10' })];
    const scale = scaleOf(points, noOurPrice, { windowDays: 7 });
    expect(scale.points.map((p) => p.observed_date)).toEqual(['2026-09-10']);
  });
});

describe('computeScale — fenêtre temporelle', () => {
  const points = [
    point({ observed_date: '2026-06-15', price: 90 }),
    point({ observed_date: '2026-09-04', price: 110 }),
    point({ observed_date: '2026-09-10', price: 100 }),
  ];

  it('couvre exactement les N derniers jours, terminés au relevé le plus récent', () => {
    const scale = scaleOf(points, noOurPrice, { windowDays: 7 });
    expect(scale.days).toHaveLength(7);
    expect(scale.days[0]).toBe('2026-09-04');
    expect(scale.days[6]).toBe('2026-09-10');
  });

  it('ne garde que les relevés de la fenêtre', () => {
    const scale = scaleOf(points, noOurPrice, { windowDays: 7 });
    expect(scale.points.map((p) => p.observed_date)).toEqual(['2026-09-04', '2026-09-10']);
  });

  it('sans fenêtre, remonte au premier relevé', () => {
    const scale = scaleOf(points, noOurPrice);
    expect(scale.days[0]).toBe('2026-06-15');
    expect(scale.days[scale.days.length - 1]).toBe('2026-09-10');
  });

  it('sans fenêtre, étale quand même une semaine sur un historique plus court', () => {
    const scale = scaleOf([point({ observed_date: '2026-09-09' }), point({ observed_date: '2026-09-10' })]);
    expect(scale.days).toHaveLength(7);
    expect(scale.days[0]).toBe('2026-09-04');
  });

  it('n’a pas de trou : un jour sans relevé reste sur l’axe', () => {
    const scale = scaleOf([point({ observed_date: '2026-09-01' }), point({ observed_date: '2026-09-10' })]);
    expect(scale.days).toContain('2026-09-05');
  });
});

describe('computeScale — bornes de l’axe des prix', () => {
  it('encadre les prix avec un rembourrage, sur des multiples du pas', () => {
    const points = [point({ price: 100 }), point({ price: 200, source_code: 'topachat' })];
    const scale = scaleOf(points);
    expect(scale.yMin).toBeLessThan(100);
    expect(scale.yMax).toBeGreaterThan(200);
    expect(scale.step).toBeGreaterThan(0);
    expect(scale.yMin / scale.step).toBeCloseTo(Math.round(scale.yMin / scale.step), 9);
    expect(scale.yMax / scale.step).toBeCloseTo(Math.round(scale.yMax / scale.step), 9);
  });

  it('tient compte de notre prix, même hors de l’intervalle des enseignes', () => {
    const points = [point({ price: 100 })];
    const ours = { decisions: [decision({ decision_date: '2026-09-04', new_price: 400, old_price: 400 })], current: 400 };
    const scale = scaleOf(points, ours);
    expect(scale.yMax).toBeGreaterThan(400);
  });

  it('projette le bas de l’intervalle vers le bas du cadre', () => {
    const scale = scaleOf([point({ price: 100 }), point({ price: 200, source_code: 'topachat' })]);
    expect(scale.y(scale.yMin)).toBeCloseTo(scale.margins.top + scale.innerH, 9);
    expect(scale.y(scale.yMax)).toBeCloseTo(scale.margins.top, 9);
  });
});

describe('computeScale — pas de division par zéro', () => {
  it('garde un intervalle vertical même quand tous les prix sont identiques', () => {
    const scale = scaleOf([point({ price: 100 }), point({ price: 100, source_code: 'topachat' })]);
    expect(scale.yMax).toBeGreaterThan(scale.yMin);
    expect(Number.isFinite(scale.y(100))).toBe(true);
  });

  it('reste fini sur un prix nul', () => {
    const scale = scaleOf([point({ price: 0 })]);
    expect(scale.yMax).toBeGreaterThan(scale.yMin);
    expect(Number.isFinite(scale.y(0))).toBe(true);
  });

  it('pose un jour unique au milieu du cadre', () => {
    // Une seule journée : l'écart entre jours est indéfini, l'abscisse ne doit pas devenir NaN.
    const scale = scaleOf([point({ observed_date: '2026-09-10' })], noOurPrice, { windowDays: 1 });
    expect(scale.days).toHaveLength(1);
    expect(scale.x(0)).toBeCloseTo(scale.margins.left + scale.innerW / 2, 9);
  });

  it('répartit les jours du bord gauche au bord droit', () => {
    const scale = scaleOf([point({ observed_date: '2026-09-10' })], noOurPrice, { windowDays: 7 });
    expect(scale.x(0)).toBeCloseTo(scale.margins.left, 9);
    expect(scale.x(6)).toBeCloseTo(scale.margins.left + scale.innerW, 9);
  });
});

describe('computeScale — notre prix jour par jour', () => {
  it('tient le prix décidé jusqu’à la décision suivante', () => {
    const ours = {
      decisions: [
        decision({ decision_date: '2026-09-05', old_price: 100, new_price: 120, changed: true }),
        decision({ decision_date: '2026-09-08', old_price: 120, new_price: 90, changed: true }),
      ],
      current: 90,
    };
    const scale = scaleOf([point({ observed_date: '2026-09-10', price: 100 })], ours, { windowDays: 7 });
    expect(scale.ourPriceOn('2026-09-04')).toBe(100);
    expect(scale.ourPriceOn('2026-09-06')).toBe(120);
    expect(scale.ourPriceOn('2026-09-09')).toBe(90);
  });

  it('se rabat sur le prix courant sans historique de décisions', () => {
    const scale = scaleOf([point({ observed_date: '2026-09-10' })], { decisions: [], current: 250 }, { windowDays: 7 });
    expect(scale.ourPriceOn('2026-09-07')).toBe(250);
  });
});
