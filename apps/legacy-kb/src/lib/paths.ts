// URLs for the AI section. It sits beside the categories cluster
// (`/product/category/...`), like the new UI's AI Optimise area; the
// editor banner and the table pill only link into it.

export const SUGGESTIONS_HUB_PATH = '/product/ai/suggestions';

export function suggestionsReviewPath(articleSlug: string): string {
  return `${SUGGESTIONS_HUB_PATH}/${articleSlug}`;
}
