// Phase 7.5.8 — Per-layout error element (PRD §9 / TRD §4.6 + §8.7).
//
// Rendered when a route throws during loading or render. Mounts inside
// the shell so the user keeps the rail/explorer/breadcrumb context and
// can recover by reloading. We also surface the error message in a
// muted block so the user can describe what they saw to the team.

import { useRouteError } from 'react-router-dom';
import { Button } from '@test-kb-ui/kb-ui';
import { RiErrorWarningLine } from '@remixicon/react';

function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}

export function RouteErrorBoundary() {
  const error = useRouteError();
  const message = describe(error);

  return (
    <div
      data-kb-part="route-error-boundary"
      className="flex h-full items-center justify-center py-16"
    >
      <div className="flex max-w-[480px] flex-col items-center gap-4 rounded-[8px] border border-card-border bg-white p-8 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fef2f2] text-[#dc2626]">
          <RiErrorWarningLine aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-semibold leading-7 text-text-primary">
            Something went wrong
          </h2>
          <p className="text-[14px] leading-5 text-text-meta">
            We hit an unexpected error rendering this page. Reload to try
            again — your in-memory data will reset to the seed.
          </p>
        </div>
        {message && (
          <pre className="w-full overflow-auto rounded-[6px] bg-surface-subtle p-3 text-left text-[12px] leading-5 text-text-meta">
            {message}
          </pre>
        )}
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
        >
          Reload page
        </Button>
      </div>
    </div>
  );
}
