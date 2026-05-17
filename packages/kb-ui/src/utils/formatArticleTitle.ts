// Display-layer fallback for empty article titles. Centralizes the read-side
// "Untitled" placeholder so every surface stays consistent.

const UNTITLED_FALLBACK = 'Untitled';

export function formatArticleTitle(title: string | undefined | null): string {
  const trimmed = (title ?? '').trim();
  return trimmed === '' ? UNTITLED_FALLBACK : trimmed;
}
