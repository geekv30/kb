// Auto mode's user-facing strings, in one place so the hub, table tag,
// editor banner, review page and Settings never drift apart.
//
// Hiver AI never publishes: it applies its suggestions as unpublished
// edits (or into a draft), the article reads "Edited by AI", and a
// teammate checks the edits and publishes them.

export const AUTO_MODE_COPY = {
  /** Tag on the article (editor top bar, category table) and the hub tab. */
  tag: 'Edited by AI',
  tagTooltip: 'Hiver AI applied suggestions to this article. They aren’t published yet.',
  /** Hub column for when Hiver AI applied the batch. */
  whenColumn: 'EDITED',
  empty: {
    title: 'No articles edited by AI',
    info: 'When auto mode applies Hiver AI suggestions to an article, the article shows here until someone publishes the changes.',
  },
  /** Settings › Hiver AI, under the toggle while it's on. */
  settingsOn:
    'Hiver AI applies its suggestions to your articles as unpublished edits. Nothing goes live until someone on your team publishes the changes.',
  /** Hub header description while auto mode is on. */
  hubDescription:
    'Improvements Hiver AI drafted from recent customer conversations. Auto mode is on, so Hiver AI applies new ones as unpublished edits for you to check and publish.',
} as const;

export const MANUAL_SETTINGS_COPY = 'Suggestions wait in AI › Suggestions until someone on your team reviews them.';
