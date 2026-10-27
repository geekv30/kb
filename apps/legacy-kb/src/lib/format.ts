// Ports of the live app's string helpers (main bundle `Oj`, `_D`, `Zr`),
// so truncation and relative-time labels match character for character.

import type { Article, StoreState } from '../store/types';

/** Live `Oj`: trims, then cuts to `max` chars and appends "...". */
export function truncate(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.substring(0, max)}...` : trimmed;
}

/** Live `Zr`: upper-cases the first character. */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Live `_D`: "2 months", "21 days", "about 1 minute". Months are 30-day
 * buckets and years 365-day buckets; there is no "weeks" unit.
 */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const seconds = Math.floor((now - new Date(iso).getTime()) / 1000);
  const buckets: Array<[number, string]> = [
    [31_536_000, 'year'],
    [2_592_000, 'month'],
    [86_400, 'day'],
    [3_600, 'hour'],
    [60, 'minute'],
  ];
  for (const [size, unit] of buckets) {
    const count = Math.floor(seconds / size);
    if (count >= 1) return `${count} ${unit}${count > 1 ? 's' : ''}`;
  }
  return 'about 1 minute';
}

export function displayName(state: StoreState, userId: string | null): string {
  if (!userId) return 'Unassigned';
  return state.users[userId]?.name ?? 'Unassigned';
}

/** Under a minute old: activity reads "just now" instead of a relative time. */
const JUST_NOW_MS = 60_000;

/**
 * Live row text: `${Capitalized activity} by ${first name} ${relative} ago`,
 * or `... just now` for activity under a minute old (e.g. right after
 * publishing AI suggestions).
 */
export function activityText(state: StoreState, article: Article, now: number = Date.now()): string {
  return `${capitalize(article.lastActivity)} by ${firstName(state, article.modifierId)} ${whenText(article.modifiedAt, now)}`;
}

export function firstName(state: StoreState, userId: string | null): string {
  return displayName(state, userId).split(' ')[0] ?? '';
}

/** "just now" under a minute, otherwise "2 months ago". */
export function whenText(iso: string, now: number = Date.now()): string {
  return now - new Date(iso).getTime() < JUST_NOW_MS ? 'just now' : `${relativeTime(iso, now)} ago`;
}

/** Lower-case, hyphen-separated slug (live `SL`). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** "1 suggestion" / "3 suggestions". */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
