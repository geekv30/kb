// Phase 7.5.3 + 7.5.8 — Settings placeholder.
//
// PRD §3.2 + §10 decision 9: settings page stays as a "Coming soon"
// placeholder. The rail icon is wired (lights up + navigates here)
// but no real settings UI is in scope for the demo.
//
// Phase 7.5.8 polish: replaces the stub copy with an intentional
// centered card that explains what this surface is reserved for, so
// the viewer never thinks they hit a broken page.

import { Settings01 } from '@untitledui/icons';

export default function SettingsPlaceholder() {
  return (
    <div
      data-route="settings"
      className="flex h-full items-center justify-center py-16"
    >
      <div className="flex max-w-[420px] flex-col items-center gap-3 text-center">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-meta"
        >
          <Settings01 className="h-5 w-5" />
        </div>
        <h1 className="text-[24px] font-semibold leading-8 text-text-primary">
          Settings — coming soon.
        </h1>
        <p className="text-[14px] leading-5 text-text-muted">
          This area is reserved for workspace configuration: members,
          permissions, branding, and billing.
        </p>
      </div>
    </div>
  );
}
