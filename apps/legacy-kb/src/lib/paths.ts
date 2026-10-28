// URLs for the AI section. It sits beside the categories cluster
// (`/product/category/...`), like the new UI's AI Optimise area; the
// editor banner and the table pill only link into it.

export const SUGGESTIONS_HUB_PATH = '/product/ai/suggestions';

export function suggestionsReviewPath(articleSlug: string): string {
  return `${SUGGESTIONS_HUB_PATH}/${articleSlug}`;
}

// Hiver Admin Panel replica (Part B entry points). Mirrors the live
// v2.hiverhq.com/app/* pages the nudges sit on.
export const ADMIN_PATH = '/hiver/admin';
export const ADMIN_HELP_CENTER_PATH = `${ADMIN_PATH}/help-center`;
export const ADMIN_KNOWLEDGE_HUB_PATH = `${ADMIN_PATH}/knowledge-hub`;
