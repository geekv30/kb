// Every user-facing string that differs between the two auto-mode
// designs, in one place so the hub, table tag, edit banner and Settings
// never drift apart.
//
//   publish (option 1) — Hiver AI changes the live article and marks each
//                        change in the editor: keep it or restore the original.
//   merge   (option 2) — Hiver AI saves a draft update of the article,
//                        changes marked the same way; someone publishes it.

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
  /** Hub notice: "Hiver AI updated 2 articles" / "…saved draft updates for 2 articles". */
  notice: (articles: string) => string;
  noticeAction: string;
  /** Category table tag while the article needs a look. */
  tag: { label: string; tooltip: string };
}

export const AUTO_MODE_COPY: Record<AutoModeOption, AutoModeCopy> = {
  publish: {
    optionLabel: 'Publish automatically',
    tab: 'Auto-applied',
    whenColumn: 'APPLIED',
    empty: {
      title: 'Nothing applied yet',
      info: 'When auto mode applies a Hiver AI suggestion to an article, the article shows here.',
    },
    settingsOn:
      'Hiver AI applies its suggestions to your articles as they come in, without waiting for a review. You can see each one on the article and revert it.',
    hubDescription:
      'Auto mode is on: Hiver AI applies its suggestions from recent customer conversations as they come in. Check what it applied and revert anything you don’t want.',
    notice: (articles) => `Auto mode applied Hiver AI suggestions to ${articles}. Check what was applied.`,
    noticeAction: 'View suggestions',
    tag: { label: 'Auto-applied', tooltip: 'Auto mode applied Hiver AI suggestions to this article. Open to check them.' },
  },
  merge: {
    optionLabel: 'Save as a draft',
    tab: 'Draft updates',
    whenColumn: 'SAVED',
    empty: {
      title: 'No draft updates',
      info: 'When Hiver AI improves an article, it saves a draft update here for you to publish.',
    },
    settingsOn:
      'Hiver AI saves its improvements as a draft update of each article. Nothing changes on your help center until someone publishes it.',
    hubDescription:
      'Hiver AI saves improvements from recent customer conversations as draft updates. Open an article to check the changes and publish it.',
    notice: (articles) => `Hiver AI saved draft updates for ${articles}. They aren’t live yet.`,
    noticeAction: 'Review draft',
    tag: { label: 'Draft update', tooltip: 'Hiver AI saved a draft update. Open the article to publish it.' },
  },
};

export const MANUAL_SETTINGS_COPY = 'Suggestions wait in AI › Suggestions until someone on your team reviews them.';
