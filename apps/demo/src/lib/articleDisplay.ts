// Display-layer fallback for empty article titles. The store may hold
// an empty string (new drafts that haven't been titled yet) — this
// helper centralizes the read-side "Untitled" placeholder so every
// surface stays consistent.

const UNTITLED_FALLBACK = 'Untitled';

export function formatArticleTitle(title: string | undefined | null): string {
  const trimmed = (title ?? '').trim();
  return trimmed === '' ? UNTITLED_FALLBACK : trimmed;
}
