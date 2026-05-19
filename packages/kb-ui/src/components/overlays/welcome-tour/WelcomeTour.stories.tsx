import type { Meta, StoryObj } from '@storybook/react-vite';
import { Folder, BarChartSquare02, Stars02 } from '@untitledui/icons';
import '../../../tokens.css';
import {
  WelcomeTourProvider,
  useTourTarget,
  useWelcomeTour,
  type CompletionContent,
  type TourStep,
  type WelcomeContent,
} from './index';
import { Button } from '../../primitives/Button';

/* ─────────────────────────────────────────────────────────────
 * Single Playground story — smoke-proves the lifted Welcome
 * Tour primitive renders standalone with generic data, separate
 * from any Hiver-specific config. The story owns its own
 * storage key (`storybook-welcome-tour`) so it doesn't collide
 * with the demo app's `hiver-kb-welcome-tour-v1`.
 *
 * The provider auto-shows on first mount (700ms default) when
 * the storageKey hasn't been seen. The "Reset tour" button
 * clears localStorage and reloads the iframe so the auto-show
 * fires again — useful when stepping through repeatedly without
 * touching devtools.
 *
 * Per project convention, single-story files do NOT define
 * argTypes/controls — controls are reserved for collapsing
 * sibling variants.
 * ───────────────────────────────────────────────────────────── */

const STORYBOOK_STORAGE_KEY = 'storybook-welcome-tour';

const DEMO_STEPS: TourStep[] = [
  {
    id: 'demo-1',
    title: 'Step one',
    body: 'Body for step one. This spotlight points at the Sidebar target.',
  },
  {
    id: 'demo-2',
    title: 'Step two',
    body: 'Body for step two. This spotlight points at the AI Hub target.',
  },
  {
    id: 'demo-3',
    title: 'Step three',
    body: 'Body for step three. This spotlight points at the Analytics target.',
  },
];

const DEMO_WELCOME: WelcomeContent = {
  title: 'Welcome to the tour',
  body: 'This is a 3-step walkthrough of the generic Welcome Tour primitive.',
  ctaLabel: 'Start tour',
  skipLabel: 'Maybe later',
  features: [
    {
      id: 'sidebar',
      title: 'Sidebar',
      body: 'Navigate folders and files in a tree.',
      icon: <Folder className="text-slate-700" />,
    },
    {
      id: 'ai',
      title: 'AI Hub',
      body: 'Spot gaps in your content and act on them.',
      icon: <Stars02 className="text-slate-700" />,
    },
    {
      id: 'analytics',
      title: 'Analytics',
      body: 'See how your content performs over time.',
      icon: <BarChartSquare02 className="text-slate-700" />,
    },
  ],
};

const DEMO_COMPLETION: CompletionContent = {
  title: 'All done',
  body: "You're set.",
  ctaLabel: 'Finish',
};

/** Demo target tile — registers itself with the tour by id. */
function TourTargetTile({
  id,
  label,
  icon,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
}) {
  const register = useTourTarget(id);
  return (
    <div
      ref={register}
      className="flex h-32 w-48 flex-col items-center justify-center gap-2 rounded-lg border border-border-default bg-white text-text-primary shadow-sm"
    >
      <div className="text-slate-700">{icon}</div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
}

/** Controls inside the provider — manual trigger + reset shortcut. */
function TourControls() {
  const { start } = useWelcomeTour();
  return (
    <div className="flex gap-2">
      <Button variant="primary" onClick={start}>
        Start tour
      </Button>
      <Button
        variant="subtle"
        onClick={() => {
          try {
            window.localStorage.removeItem(STORYBOOK_STORAGE_KEY);
          } catch {
            // localStorage may be unavailable; reload still attempts auto-show.
          }
          window.location.reload();
        }}
      >
        Reset tour
      </Button>
    </div>
  );
}

function WelcomeTourPlayground() {
  return (
    <WelcomeTourProvider
      steps={DEMO_STEPS}
      welcome={DEMO_WELCOME}
      completion={DEMO_COMPLETION}
      storageKey={STORYBOOK_STORAGE_KEY}
    >
      <div className="flex flex-col items-center gap-6 p-8">
        <p className="max-w-md text-center text-sm text-text-meta">
          On first visit, the welcome card auto-shows after ~700ms. Use
          <span className="mx-1 font-medium text-text-primary">
            Start tour
          </span>
          to trigger it manually, or
          <span className="mx-1 font-medium text-text-primary">
            Reset tour
          </span>
          to clear the seen flag and reload.
        </p>
        <div className="flex gap-4">
          <TourTargetTile
            id="demo-1"
            label="Sidebar"
            icon={<Folder />}
          />
          <TourTargetTile
            id="demo-2"
            label="AI Hub"
            icon={<Stars02 />}
          />
          <TourTargetTile
            id="demo-3"
            label="Analytics"
            icon={<BarChartSquare02 />}
          />
        </div>
        <TourControls />
      </div>
    </WelcomeTourProvider>
  );
}

const meta: Meta<typeof WelcomeTourProvider> = {
  title: 'Components/Overlays/WelcomeTour',
  component: WelcomeTourProvider,
  parameters: { layout: 'fullscreen' },
  globals: { backgrounds: { value: 'canvas' } },
};
export default meta;

export const Playground: StoryObj<typeof WelcomeTourProvider> = {
  render: () => <WelcomeTourPlayground />,
};
