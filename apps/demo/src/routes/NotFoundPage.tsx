// Phase 7.5.3 + 7.5.8 — Branded standalone 404 (no shell).
//
// PRD §9.10 / §12.5 — catch-all unknown routes render a polished
// 404 page that feels intentional rather than browser-default. We
// keep the surface small (one column, ~440px wide), centered, and
// brand-cohesive: same slate palette + 6px-radius primary CTA used
// by the rest of the app.

import { Link } from 'react-router-dom';
import { CompanyLogo } from '@test-kb-ui/kb-ui';
import { routes } from '../lib/routes';
import { cn } from '../lib/cn';

export default function NotFoundPage() {
  return (
    <main
      data-route="not-found"
      className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-6"
    >
      {/* Brand mark — small, top-of-card. Reinforces this is still the
          Hiver KB even when the URL was wrong. */}
      <div
        aria-hidden="true"
        className="mb-8 flex h-10 w-10 items-center justify-center text-[#0f172a]"
      >
        <CompanyLogo size={28} />
      </div>

      <div className="flex max-w-[440px] flex-col items-center gap-3 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
          Error 404
        </p>
        <h1
          tabIndex={-1}
          className="text-[36px] font-semibold leading-[44px] text-[#0f172a]"
        >
          Page not found
        </h1>
        <p className="text-[14px] leading-6 text-[#475569]">
          The page you were looking for doesn't exist or has moved.
          Head back to the knowledge base to find what you need.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <Link
            to={routes.home()}
            className={cn(
              'inline-flex h-9 items-center rounded-[6px] bg-black px-4',
              'text-[14px] font-medium leading-5 text-white',
              'transition-colors hover:bg-black/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
            )}
          >
            Back to home
          </Link>
          <Link
            to={routes.aiOptimise.hub()}
            className={cn(
              'inline-flex h-9 items-center rounded-[6px] border border-[#cbd5e1] bg-white px-4',
              'text-[14px] font-medium leading-5 text-[#0f172a]',
              'transition-colors hover:bg-[#f8fafc]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
            )}
          >
            Go to AI Optimise
          </Link>
        </div>
      </div>
    </main>
  );
}
