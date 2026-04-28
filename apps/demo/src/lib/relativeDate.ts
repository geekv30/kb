// Phase 7.5.4 — relative-date formatting for table cells.
//
// Tiny helper kept in `lib/` so any future page that needs the same
// "Today / Yesterday / N days ago / Mon DD, YYYY" formatting can reuse
// it without duplicating the logic. Pure: takes the source ISO string
// and an optional `now` for testability (defaults to the current time).
//
// Format chosen to balance recency context vs. precision:
//   - same calendar day             → "Today"
//   - 1 calendar day ago            → "Yesterday"
//   - 2..6 calendar days ago        → "N days ago"
//   - older                         → "MMM D, YYYY" (e.g. "Apr 12, 2026")
//
// Calendar-day comparison (not a 24h-rolling window) avoids the "edited
// at 11pm yesterday shows '1 day ago' at 9am today" off-by-one that
// pure-millisecond math produces.

export function formatRelativeDate(
  isoTimestamp: string,
  now: Date = new Date(),
): string {
  const then = new Date(isoTimestamp);
  if (Number.isNaN(then.getTime())) return '';

  const dayMs = 24 * 60 * 60 * 1000;
  const startOfDay = (d: Date) =>
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const dayDelta = Math.floor((startOfDay(now) - startOfDay(then)) / dayMs);

  if (dayDelta <= 0) return 'Today';
  if (dayDelta === 1) return 'Yesterday';
  if (dayDelta < 7) return `${dayDelta} days ago`;

  // Fall back to a stable absolute date for older items.
  const month = then.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  return `${month} ${then.getUTCDate()}, ${then.getUTCFullYear()}`;
}
