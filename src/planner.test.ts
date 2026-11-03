import { describe, expect, it } from 'vitest';
import {
  defaultPreferences, deserializePlan, evaluatePlan, FAVORITES_STORAGE_KEY, generatePlan,
  loadFavorites, places, saveFavorites, serializePlan,
} from './planner';
import type { Area, Plan, Preferences } from './planner';

function preferences(overrides: Partial<Preferences> = {}): Preferences {
  return { ...defaultPreferences, interests: [...defaultPreferences.interests], ...overrides };
}

function route(ids: string[], overrides: Partial<Preferences> = {}): Plan {
  return {
    id: 'test-plan',
    name: 'Harbour afternoon ☀',
    preferences: preferences(overrides),
    stops: ids.map((placeId) => ({ placeId, duration: places.find((place) => place.id === placeId)!.duration })),
  };
}

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => { data.delete(key); },
    setItem: (key, value) => { data.set(key, value); },
  };
}

function rawShare(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

describe('curated afternoon scheduling', () => {
  it('is deterministic without mutating preferences', () => {
    const input = preferences();
    const before = structuredClone(input);
    expect(generatePlan(input)).toEqual(generatePlan(input));
    expect(input).toEqual(before);
    expect(generatePlan(input).preferences).not.toBe(input);
  });

  it('fits time and estimated budget across starting areas and weather choices', () => {
    for (const area of ['Circular Quay', 'Central', 'Darling Harbour'] as Area[]) {
      for (const rainy of [true, false]) {
        for (const budget of [0, 15, 40]) {
          for (const minutes of [60, 120, 240]) {
            const plan = generatePlan(preferences({ area, rainy, budget, minutes }));
            const result = evaluatePlan(plan);
            expect(result.valid, JSON.stringify({ area, rainy, budget, minutes, result })).toBe(true);
            expect(result.minutes).toBeLessThanOrEqual(minutes);
            expect(result.cost).toBeLessThanOrEqual(budget);
            expect(plan.stops.every((stop) => !rainy || places.find((place) => place.id === stop.placeId)!.rainy)).toBe(true);
          }
        }
      }
    }
  });

  it('uses curated visit durations and includes travel from the starting area', () => {
    const plan = generatePlan(preferences());
    const result = evaluatePlan(plan);
    expect(plan.stops.length).toBeGreaterThan(0);
    for (const stop of plan.stops) expect(stop.duration).toBe(places.find((place) => place.id === stop.placeId)!.duration);
    expect(result.legs).toHaveLength(plan.stops.length);
    expect(result.legs.every((leg) => Number.isInteger(leg) && leg > 0)).toBe(true);
    expect(result.travelMinutes).toBe(result.legs.reduce((sum, leg) => sum + leg, 0));
    expect(result.minutes).toBe(result.travelMinutes + plan.stops.reduce((sum, stop) => sum + stop.duration, 0));
  });

  it('recomputes route legs when stops are reordered', () => {
    const plan = route(['customs-house', 'white-rabbit', 'quay-promenade'], { minutes: 720 });
    const reordered = { ...plan, stops: [...plan.stops].reverse() };
    expect(evaluatePlan(reordered).legs).not.toEqual(evaluatePlan(plan).legs);
    expect(evaluatePlan(reordered).minutes).not.toBe(evaluatePlan(plan).minutes);
    expect(evaluatePlan(reordered).cost).toBe(evaluatePlan(plan).cost);
  });

  it('flags edited time and budget overruns without hiding their totals', () => {
    const plan = route(['mca'], { minutes: 30, budget: 0 });
    plan.stops[0].duration = 90;
    const result = evaluatePlan(plan);
    expect(result.valid).toBe(false);
    expect(result.minutes).toBeGreaterThan(90);
    expect(result.cost).toBe(places.find((place) => place.id === 'mca')!.cost);
    expect(result.issues.join(' ')).toMatch(/Time limit exceeded.*Budget exceeded/);
    expect(deserializePlan(serializePlan(plan))).toEqual(plan);
  });

  it('marks empty, impossible and rainy outdoor routes invalid', () => {
    expect(evaluatePlan(route([])).valid).toBe(false);
    expect(evaluatePlan(generatePlan(preferences({ minutes: 15, budget: 0 })))).toMatchObject({ valid: false, minutes: 0 });
    expect(evaluatePlan(route(['quay-promenade'], { rainy: true })).issues.join(' ')).toMatch(/outdoor/);
    expect(evaluatePlan(route(['customs-house', 'customs-house'])).issues.join(' ')).toMatch(/Duplicate/);
  });

  it('keeps custom valid durations rather than silently reverting them', () => {
    const plan = route(['customs-house']);
    const before = evaluatePlan(plan);
    plan.stops[0].duration += 17;
    expect(evaluatePlan(plan).minutes).toBe(before.minutes + 17);
  });
});

describe('bounded URL-safe sharing', () => {
  it('round-trips Unicode and explicit broad starting area', () => {
    const plan = route(['central-heritage'], { area: 'Central' });
    const encoded = serializePlan(plan);
    expect(encoded).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(deserializePlan(encoded)).toEqual(plan);
  });

  it.each(['', '%broken', 'a', 'null', 'x'.repeat(16_001)])('rejects malformed or oversized input', (value) => {
    expect(deserializePlan(value)).toBeNull();
  });

  it('rejects unknown IDs, bad shapes, unsupported areas and duplicate interests', () => {
    const plan = route(['customs-house']);
    const invalid = [
      null, [], {}, { ...plan, stops: null }, { ...plan, name: '' },
      { ...plan, stops: [{ placeId: 'made-up', duration: 20 }] },
      { ...plan, preferences: { ...plan.preferences, area: 'Home address' } },
      { ...plan, preferences: { ...plan.preferences, interests: ['nature', 'nature'] } },
      { ...plan, stops: Array.from({ length: 13 }, () => plan.stops[0]) },
    ];
    for (const value of invalid) {
      expect(deserializePlan(rawShare(value))).toBeNull();
      expect(evaluatePlan(value as Plan).valid).toBe(false);
    }
  });

  it.each([NaN, Infinity, -1, 0, 1.5, 361, '30'])('rejects invalid duration %s', (duration) => {
    const plan = { ...route(['customs-house']), stops: [{ placeId: 'customs-house', duration }] } as Plan;
    expect(evaluatePlan(plan).valid).toBe(false);
    expect(() => serializePlan(plan)).toThrow(TypeError);
    expect(deserializePlan(rawShare(plan))).toBeNull();
  });

  it.each([
    { minutes: NaN }, { minutes: Infinity }, { minutes: 0 }, { minutes: 30.5 },
    { budget: -1 }, { budget: Infinity }, { budget: '40' }, { rainy: 'true' },
  ])('rejects invalid preferences %j', (overrides) => {
    const plan = route(['customs-house']);
    Object.assign(plan.preferences, overrides);
    expect(evaluatePlan(plan).valid).toBe(false);
    expect(() => serializePlan(plan)).toThrow(TypeError);
  });

  it('drops unknown fields when sharing', () => {
    const plan = { ...route(['customs-house']), location: { lat: 1, lng: 2 } };
    expect(deserializePlan(serializePlan(plan))).not.toHaveProperty('location');
  });
});

describe('local favorites', () => {
  it('sanitizes the starting area by default without mutating the source', () => {
    const storage = memoryStorage();
    const plan = route(['central-heritage'], { area: 'Central' });
    Object.assign(plan, { location: { lat: 1, lng: 2 } });
    expect(saveFavorites([plan], storage)).toBe(true);
    const [saved] = loadFavorites(storage);
    expect(saved.preferences.area).toBe('Circular Quay');
    expect(saved).not.toHaveProperty('location');
    expect(plan.preferences.area).toBe('Central');
    expect(storage.getItem(FAVORITES_STORAGE_KEY)).not.toContain('"area":"Central"');
  });

  it('persists broad starting area only with explicit opt-in', () => {
    const storage = memoryStorage();
    const plan = route(['central-heritage'], { area: 'Central' });
    expect(saveFavorites([plan], storage, true)).toBe(true);
    expect(loadFavorites(storage)).toEqual([plan]);
    expect(saveFavorites([], storage)).toBe(true);
    expect(loadFavorites(storage)).toEqual([]);
  });

  it('does not treat a truthy non-boolean value as privacy opt-in', () => {
    const storage = memoryStorage();
    const plan = route(['central-heritage'], { area: 'Central' });
    expect(saveFavorites([plan], storage, 'false' as unknown as boolean)).toBe(true);
    expect(loadFavorites(storage)[0].preferences.area).toBe('Circular Quay');
  });

  it('handles corrupt, oversized and partially invalid stored data', () => {
    const storage = memoryStorage();
    for (const value of ['{broken', 'null', '{}', 'x'.repeat(250_001)]) {
      storage.setItem(FAVORITES_STORAGE_KEY, value);
      expect(loadFavorites(storage)).toEqual([]);
    }
    const plan = route(['customs-house']);
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([plan, { id: 'invalid' }]));
    expect(loadFavorites(storage)).toEqual([plan]);
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from({ length: 21 }, () => plan)));
    expect(loadFavorites(storage)).toEqual([]);
  });

  it('returns safe results when storage access or quota fails', () => {
    const storage = memoryStorage();
    storage.setItem = () => { throw new Error('QuotaExceededError'); };
    storage.getItem = () => { throw new Error('SecurityError'); };
    expect(saveFavorites([route(['customs-house'])], storage)).toBe(false);
    expect(loadFavorites(storage)).toEqual([]);
  });

  it('rejects invalid saves without replacing previous favorites', () => {
    const storage = memoryStorage();
    const plan = route(['customs-house']);
    saveFavorites([plan], storage);
    expect(saveFavorites([{ ...plan, stops: [{ placeId: 'unknown', duration: 20 }] }], storage)).toBe(false);
    expect(saveFavorites(Array.from({ length: 21 }, () => plan), storage)).toBe(false);
    expect(loadFavorites(storage)).toEqual([plan]);
  });
});
