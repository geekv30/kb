// Every user-facing string that differs between the two auto-mode
// designs, in one place so the hub, table pill, edit banner, review view
// and Settings never drift apart.
//
//   publish (option 1) — Hiver AI changes the live article; each change
//                        can be undone afterwards.
//   merge   (option 2) — Hiver AI keeps an improved version next to the
//                        live article; someone merges it.

import type { AutoModeOption } from '../store/types';

export interface AutoModeCopy {
  /** Prototype switch label. */
  optionLabel: string;
  /** Hub tab for articles in the AUTO stage. */
  tab: string;
  /** Hub column for when the batch arrived. */
  whenColumn: string;
  empty: { title: string; info: string };
  /** Settings › Hiver AI, under the toggle while it's on. */
  settingsOn: string;
  /** Hub header description while auto mode is on. */
  hubDescription: string;
  pill: { label: string; tooltip: string };
  banner: { lead: string; action: string };
  /** Review view: summary card title and the note under the summary. */
  reviewTitle: string;
  reviewNote: (when: string) => string;
}

export const AUTO_MODE_COPY: Record<AutoModeOption, AutoModeCopy> = {
  publish: {
    optionLabel: 'Publish live',
    tab: 'Applied by AI',
    whenColumn: 'APPLIED',
    empty: {
      title: 'Nothing applied yet',
      info: 'When Hiver AI updates an article, the changes show here so you can check them.',
    },
    settingsOn:
      'Hiver AI publishes new suggestions to your articles as they come in. You can check and undo each change in AI › Suggestions.',
    hubDescription:
      'Hiver AI applies improvements from recent customer conversations as they come in. Check what it changed and undo anything you don’t want.',
    pill: { label: 'Updated by AI', tooltip: 'See what Hiver AI changed' },
    banner: { lead: 'Hiver AI updated this article', action: 'See changes' },
    reviewTitle: 'Applied by Hiver AI',
    reviewNote: (when) => `Went live ${when}. Undo a change to restore its original text.`,
  },
  merge: {
    optionLabel: 'Merge into live',
    tab: 'Ready to merge',
    whenColumn: 'PREPARED',
    empty: {
      title: 'No improved versions yet',
      info: 'When Hiver AI prepares an improved version of an article, it shows here.',
    },
    settingsOn:
      'Hiver AI prepares an improved version of each article as suggestions come in. Nothing changes on your help center until someone merges it.',
    hubDescription:
      'Hiver AI prepares improved versions of your articles from recent customer conversations. Check a version, then merge it into the live article.',
    pill: { label: 'Improved version', tooltip: 'Review and merge the improved version' },
    banner: { lead: 'Hiver AI prepared an improved version of this article', action: 'Review version' },
    reviewTitle: 'Improved version',
    reviewNote: (when) => `Prepared by Hiver AI ${when}. Nothing is live until you merge.`,
  },
};

export const MANUAL_SETTINGS_COPY = 'Suggestions wait in AI › Suggestions until someone on your team reviews them.';
