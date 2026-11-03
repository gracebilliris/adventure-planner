export type Interest = 'nature' | 'culture' | 'food' | 'views';
export type Area = 'Circular Quay' | 'Central' | 'Darling Harbour';

export interface Place {
  id: string;
  name: string;
  area: string;
  interests: Interest[];
  rainy: boolean;
  cost: number;
  duration: number;
  lat: number;
  lng: number;
  description: string;
}

export interface Preferences {
  minutes: number;
  budget: number;
  interests: Interest[];
  area: Area;
  rainy: boolean;
}

export interface Plan {
  id: string;
  name: string;
  preferences: Preferences;
  stops: Array<{ placeId: string; duration: number }>;
}

// Curated examples, not live listings. Costs are AUD estimates per person;
// admission, accessibility, weather and opening hours must be checked separately.
export const places: Place[] = [
  { id: 'customs-house', name: 'Customs House', area: 'Circular Quay', interests: ['culture'], rainy: true, cost: 0, duration: 25, lat: -33.8623, lng: 151.2106, description: 'Curated example: look for the city model and enjoy an indoor architecture pause. Public access is not guaranteed.' },
  { id: 'quay-promenade', name: 'Circular Quay promenade', area: 'Circular Quay', interests: ['views'], rainy: false, cost: 0, duration: 25, lat: -33.8609, lng: 151.2121, description: 'Curated example: a harbour-side wander to watch ferries and sketch the skyline.' },
  { id: 'botanic-garden', name: 'Royal Botanic Garden', area: 'Circular Quay', interests: ['nature', 'views'], rainy: false, cost: 0, duration: 45, lat: -33.8642, lng: 151.2166, description: 'Curated example: a gentle garden walk; the estimate excludes ticketed experiences.' },
  { id: 'mrs-macquaries-chair', name: 'Mrs Macquarie’s Chair', area: 'Circular Quay', interests: ['nature', 'views'], rainy: false, cost: 0, duration: 25, lat: -33.8593, lng: 151.2223, description: 'Curated example: pause at the sandstone headland for harbour views; this is an exposed outdoor stop.' },
  { id: 'observatory-hill', name: 'Observatory Hill Park', area: 'Circular Quay', interests: ['nature', 'views'], rainy: false, cost: 0, duration: 30, lat: -33.8596, lng: 151.2048, description: 'Curated example: a hilltop picnic and bridge-view pause. Allow for slopes and steps.' },
  { id: 'rocks-snack', name: 'The Rocks snack wander', area: 'Circular Quay', interests: ['food', 'culture'], rainy: false, cost: 18, duration: 35, lat: -33.8599, lng: 151.2088, description: 'Curated example: browse the historic lanes and choose a snack. The allowance is an estimate, not a quoted menu.' },
  { id: 'mca', name: 'Museum of Contemporary Art Australia', area: 'Circular Quay', interests: ['culture'], rainy: true, cost: 30, duration: 60, lat: -33.8599, lng: 151.209, description: 'Curated example: an indoor contemporary-art visit with an estimated admission allowance. Check current tickets and access.' },
  { id: 'barangaroo-reserve', name: 'Barangaroo Reserve', area: 'Darling Harbour', interests: ['nature', 'views'], rainy: false, cost: 0, duration: 40, lat: -33.8587, lng: 151.2019, description: 'Curated example: follow the waterfront landscaping and stop for a harbour outlook.' },
  { id: 'state-library', name: 'State Library of New South Wales', area: 'Circular Quay', interests: ['culture'], rainy: true, cost: 0, duration: 40, lat: -33.8662, lng: 151.2128, description: 'Curated example: explore public library spaces or a free display when available. Special events are excluded.' },
  { id: 'art-gallery', name: 'Art Gallery of New South Wales', area: 'Circular Quay', interests: ['culture'], rainy: true, cost: 0, duration: 55, lat: -33.8688, lng: 151.2173, description: 'Curated example: focus on free collection areas; ticketed exhibitions are not included.' },
  { id: 'hyde-park', name: 'Hyde Park', area: 'Central', interests: ['nature', 'culture'], rainy: false, cost: 0, duration: 35, lat: -33.8731, lng: 151.2113, description: 'Curated example: walk beneath the fig trees and pause near the park monuments.' },
  { id: 'chinese-garden', name: 'Chinese Garden of Friendship', area: 'Darling Harbour', interests: ['nature', 'culture'], rainy: false, cost: 15, duration: 45, lat: -33.8764, lng: 151.2024, description: 'Curated example: a contemplative garden visit with an estimated admission allowance; check current pricing.' },
  { id: 'tumbalong-park', name: 'Tumbalong Park', area: 'Darling Harbour', interests: ['nature'], rainy: false, cost: 0, duration: 25, lat: -33.8755, lng: 151.2016, description: 'Curated example: an open-air park break between city walks, excluding any ticketed events.' },
  { id: 'maritime-museum', name: 'Australian National Maritime Museum', area: 'Darling Harbour', interests: ['culture'], rainy: true, cost: 35, duration: 60, lat: -33.8695, lng: 151.1985, description: 'Curated example: an indoor museum visit with a conservative ticket allowance. Vessel access is not included in this route.' },
  { id: 'darling-square', name: 'Darling Square food pause', area: 'Darling Harbour', interests: ['food'], rainy: true, cost: 22, duration: 40, lat: -33.8771, lng: 151.202, description: 'Curated example: choose an indoor food venue in the precinct. Seating, availability and the estimated meal cost need checking.' },
  { id: 'paddys-markets', name: 'Paddy’s Markets Haymarket', area: 'Central', interests: ['culture', 'food'], rainy: true, cost: 0, duration: 35, lat: -33.8792, lng: 151.2035, description: 'Curated example: browse the covered market without a purchase allowance. Check operating days before going.' },
  { id: 'white-rabbit', name: 'White Rabbit Gallery', area: 'Central', interests: ['culture'], rainy: true, cost: 0, duration: 50, lat: -33.8875, lng: 151.2006, description: 'Curated example: an indoor contemporary-art stop; exhibition changeovers can affect access.' },
  { id: 'central-heritage', name: 'Central Station heritage hall', area: 'Central', interests: ['culture'], rainy: true, cost: 0, duration: 20, lat: -33.8832, lng: 151.2066, description: 'Curated example: an architecture pause in publicly accessible station areas, without entering paid platforms.' },
  { id: 'spice-alley', name: 'Spice Alley lunch pause', area: 'Central', interests: ['food'], rainy: false, cost: 22, duration: 40, lat: -33.8855, lng: 151.2015, description: 'Curated example: choose a casual meal in the laneway precinct. Outdoor seating and prices vary.' },
  { id: 'belmore-park', name: 'Belmore Park', area: 'Central', interests: ['nature'], rainy: false, cost: 0, duration: 20, lat: -33.881, lng: 151.2065, description: 'Curated example: a short green-space break near Central; assess conditions and personal comfort on arrival.' },
  { id: 'pyrmont-bridge', name: 'Pyrmont Bridge', area: 'Darling Harbour', interests: ['views', 'culture'], rainy: false, cost: 0, duration: 25, lat: -33.8705, lng: 151.2013, description: 'Curated example: a pedestrian harbour crossing with a waterside photo pause.' },
];

export const defaultPreferences: Preferences = {
  minutes: 180,
  budget: 40,
  interests: ['nature', 'views'],
  area: 'Circular Quay',
  rainy: false,
};

const origins: Record<Area, { lat: number; lng: number }> = {
  'Circular Quay': { lat: -33.8612, lng: 151.2106 },
  Central: { lat: -33.8832, lng: 151.2066 },
  'Darling Harbour': { lat: -33.8737, lng: 151.2009 },
};
const interests: Interest[] = ['nature', 'culture', 'food', 'views'];
const areas: Area[] = ['Circular Quay', 'Central', 'Darling Harbour'];
const maxStops = 12;
const maxFavorites = 20;
export const FAVORITES_STORAGE_KEY = 'sydney-afternoon:favorites:v1';

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberIn(value: unknown, min: number, max: number, integer = true): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
    && (!integer || Number.isInteger(value));
}

function parsePreferences(value: unknown): Preferences | null {
  if (!record(value) || !numberIn(value.minutes, 15, 720)
    || !numberIn(value.budget, 0, 1000, false)
    || !Array.isArray(value.interests) || value.interests.length > interests.length
    || !Array.from(value.interests).every((item) => interests.includes(item as Interest))
    || new Set(value.interests).size !== value.interests.length
    || !areas.includes(value.area as Area) || typeof value.rainy !== 'boolean') return null;
  return {
    minutes: value.minutes,
    budget: value.budget,
    interests: [...value.interests] as Interest[],
    area: value.area as Area,
    rainy: value.rainy,
  };
}

// Schema validity is separate from route feasibility: edited overruns can still
// be shared and saved, but evaluatePlan will flag them.
function parsePlan(value: unknown): Plan | null {
  if (!record(value) || typeof value.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(value.id)
    || typeof value.name !== 'string' || !value.name.trim() || value.name.length > 120
    || !Array.isArray(value.stops) || value.stops.length > maxStops) return null;
  const preferences = parsePreferences(value.preferences);
  if (!preferences) return null;
  const stops: Plan['stops'] = [];
  for (const stop of value.stops) {
    if (!record(stop) || typeof stop.placeId !== 'string'
      || !places.some((place) => place.id === stop.placeId)
      || !numberIn(stop.duration, 5, 360)) return null;
    stops.push({ placeId: stop.placeId, duration: stop.duration });
  }
  return { id: value.id, name: value.name, preferences, stops };
}

function travel(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const radians = Math.PI / 180;
  const a = Math.sin((to.lat - from.lat) * radians / 2) ** 2
    + Math.cos(from.lat * radians) * Math.cos(to.lat * radians)
    * Math.sin((to.lng - from.lng) * radians / 2) ** 2;
  const meters = 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Walking only: a 35% street detour at 60 m/min, plus crossings/orientation.
  // This is a conservative geographic estimate, not a routed/accessibility guarantee.
  return Math.ceil(meters * 1.35 / 60) + 5;
}

export function evaluatePlan(plan: Plan): {
  minutes: number; cost: number; travelMinutes: number; valid: boolean; issues: string[]; legs: number[];
} {
  const parsed = parsePlan(plan);
  if (!parsed) {
    return { minutes: 0, cost: 0, travelMinutes: 0, valid: false, issues: ['Invalid plan data, preferences, stop ID or duration.'], legs: [] };
  }
  let position = origins[parsed.preferences.area];
  let minutes = 0;
  let cost = 0;
  const legs: number[] = [];
  const issues: string[] = [];
  const seen = new Set<string>();
  if (!parsed.stops.length) issues.push('Add at least one stop; no outing fits this empty plan.');
  for (const stop of parsed.stops) {
    const place = places.find((candidate) => candidate.id === stop.placeId)!;
    const leg = travel(position, place);
    legs.push(leg);
    minutes += stop.duration + leg;
    cost += place.cost;
    if (seen.has(place.id)) issues.push(`Duplicate stop: ${place.name}.`);
    if (parsed.preferences.rainy && !place.rainy) issues.push(`${place.name} is an outdoor stop, not a rainy-day choice.`);
    seen.add(place.id);
    position = place;
  }
  if (minutes > parsed.preferences.minutes) issues.push(`Time limit exceeded by ${minutes - parsed.preferences.minutes} minutes.`);
  if (cost > parsed.preferences.budget) issues.push(`Budget exceeded by AUD ${(cost - parsed.preferences.budget).toFixed(2)} (estimated).`);
  return { minutes, cost, travelMinutes: legs.reduce((sum, leg) => sum + leg, 0), valid: issues.length === 0, issues, legs };
}

export function generatePlan(preferences: Preferences): Plan {
  const parsed = parsePreferences(preferences);
  const plan: Plan = {
    id: 'afternoon',
    name: 'A Sydney afternoon',
    preferences: parsed ?? { ...defaultPreferences, interests: [...defaultPreferences.interests] },
    stops: [],
  };
  if (!parsed) return plan;
  let position = origins[parsed.area];
  let minutes = 0;
  let cost = 0;
  const remaining = places.filter((place) => !parsed.rainy || place.rainy);
  while (remaining.length && plan.stops.length < maxStops) {
    const candidates = remaining.map((place) => ({
      place,
      leg: travel(position, place),
      matches: place.interests.filter((interest) => parsed.interests.includes(interest)).length,
    })).filter(({ place, leg }) => minutes + leg + place.duration <= parsed.minutes && cost + place.cost <= parsed.budget);
    candidates.sort((a, b) => b.matches - a.matches
      || (a.leg + a.place.duration) - (b.leg + b.place.duration)
      || a.place.id.localeCompare(b.place.id, 'en'));
    const next = candidates[0];
    if (!next) break;
    plan.stops.push({ placeId: next.place.id, duration: next.place.duration });
    minutes += next.leg + next.place.duration;
    cost += next.place.cost;
    position = next.place;
    remaining.splice(remaining.indexOf(next.place), 1);
  }
  const seed = JSON.stringify([parsed, plan.stops]);
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index++) hash = Math.imul(hash ^ seed.charCodeAt(index), 16777619);
  plan.id = `afternoon-${(hash >>> 0).toString(36)}`;
  return plan;
}

export function serializePlan(plan: Plan): string {
  const parsed = parsePlan(plan);
  if (!parsed) throw new TypeError('Cannot share invalid plan data.');
  const bytes = new TextEncoder().encode(JSON.stringify(parsed));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function deserializePlan(value: string): Plan | null {
  try {
    if (typeof value !== 'string' || !value.length || value.length > 16_000 || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
    const encoded = value.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(encoded + '='.repeat((4 - encoded.length % 4) % 4));
    const text = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
    return parsePlan(JSON.parse(text));
  } catch {
    return null;
  }
}

export function saveFavorites(plans: Plan[], storage?: Storage, rememberArea = false): boolean {
  try {
    if (!Array.isArray(plans) || plans.length > maxFavorites) return false;
    const sanitized: Plan[] = [];
    for (const plan of plans) {
      const parsed = parsePlan(plan);
      if (!parsed) return false;
      if (rememberArea !== true) parsed.preferences.area = 'Circular Quay';
      sanitized.push(parsed);
    }
    (storage ?? globalThis.localStorage).setItem(FAVORITES_STORAGE_KEY, JSON.stringify(sanitized));
    return true;
  } catch {
    return false;
  }
}

export function loadFavorites(storage?: Storage): Plan[] {
  try {
    const value = (storage ?? globalThis.localStorage).getItem(FAVORITES_STORAGE_KEY);
    if (!value || value.length > 250_000) return [];
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || parsed.length > maxFavorites) return [];
    return parsed.map(parsePlan).filter((plan): plan is Plan => plan !== null);
  } catch {
    return [];
  }
}
